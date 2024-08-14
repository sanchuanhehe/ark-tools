import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import * as prettier from "prettier";
import UiPanel from './views/uiPanel';
import projectCreator from './projects/projectCreator';

export class arkTs {
    static readonly encoder = new TextEncoder();

    static async createProject() {
        const projectName = await vscode.window.showInputBox({
            prompt: "Enter project name",
            placeHolder: "ArkTs Project",
        });
        let projectPath = await vscode.window.withProgress<string>(
            { location: vscode.ProgressLocation.Notification, cancellable: false },
            async (progress) => {
                progress.report({ message: `Creating a new project: ${projectName}` });
                try {
                    if (!projectName) {
                        return '';
                    }
                    const folders = await vscode.window.showOpenDialog({
                        openLabel: "Select",
                        canSelectFolders: true,
                        canSelectFiles: false,
                    }); 
                    const folder = folders ? folders[0].fsPath : undefined;
                    if (!folder) {
                        return '';
                    }
                    const projectPath = path.join(folder, projectName);
                    let uri = vscode.Uri.parse(projectPath);
                    await vscode.workspace.fs.createDirectory(uri);
                    if (await projectCreator.name()) {
                        return projectCreator.create(projectPath);
                    } else {
                        return '';
                    }
                } catch (error) {
                    return '';
                }
            }
        );
        if (projectPath.trim() === '') {
            vscode.window.showErrorMessage("Failed to create project.");
            return;
        }
        const result = await vscode.window.showInformationMessage(
            `Project ${projectName} created at ${projectPath}`,
            "Open",
            "Cancel"
        );
        if (result === "Open") {
            vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(projectPath), false);
        }
    }

    public static async createFile(extensionPath: string, fileUri: vscode.Uri) {
        const fileName = await vscode.window.showInputBox({
            prompt: "Enter File name",
            placeHolder: "ArkTs File",
        });
        if (fileName && fileUri && fileUri.fsPath) {
            let targetPath = path.extname(fileUri.path).length > 0 ? path.dirname(fileUri.path) : fileUri.path;
            let uri = vscode.Uri.parse(path.join(targetPath, `${fileName}.ets`));
            let source = fs.readFileSync(path.join(extensionPath, 'templates', 'project', 'page.txt'), 'utf-8');
            let data = this.encoder.encode(source.replace('Index', fileName));
            await vscode.workspace.fs.writeFile(uri, data);
        }
    }

    static dependencies(extensionPath: string, fileUri: vscode.Uri) {
        if (fileUri && fileUri.fsPath) {
            UiPanel.createOrShow(extensionPath, fileUri);
        }
    }

    static showAbout(extensionPath: string) {
        let panel = vscode.window.createWebviewPanel('arkts.about', 'About ArkTs Tools', vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(extensionPath, "app"))],
            retainContextWhenHidden: true,
        });
        const appDistPath = path.join(extensionPath, 'views'),
            appDistPathUri = vscode.Uri.file(appDistPath),
            indexPath = path.join(appDistPath, 'about.html');
        const baseUri = panel.webview.asWebviewUri(appDistPathUri);
        panel.webview.html = fs.readFileSync(indexPath, { encoding: 'utf8' }).replace('<base href="/">', `<base href="${String(baseUri)}/">`);
        panel.onDidDispose(() => panel.dispose(), null);
    }

    static async format(fileUri: vscode.Uri) {
        if (fileUri && fileUri.fsPath) {
            let filePath = fileUri.fsPath;
            const text = fs.readFileSync(filePath, { encoding: 'utf8' });
            const document = vscode.window.activeTextEditor?.document;
            if (document) {
                let i = 0, j = 0;
                const string0 = document.getText(), formatted = prettier.format(text);
                while (i < string0.length && i < formatted.length && string0[i] === formatted[i]) {
                    ++i;
                }
                while (i + j < string0.length && i + j < formatted.length && string0[string0.length - j - 1] === formatted[formatted.length - j - 1]) {
                    ++j;
                }
                const newText = formatted.substring(i, formatted.length - j);
                const pos0 = document.positionAt(i), pos1 = document.positionAt(string0.length - j);
                const edit = new vscode.WorkspaceEdit();
                edit.replace(document.uri, new vscode.Range(pos0, pos1), newText);
                return vscode.workspace.applyEdit(edit);
            }
        }
    }
}