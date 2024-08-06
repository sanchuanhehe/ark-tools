import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import UiPanel from './views/uiPanel';
import { initPackage } from './utils';

export class arkTs {
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
                    }); const folder = folders ? folders[0].fsPath : undefined;
                    if (!folder) {
                        return '';
                    }
                    const projectPath = path.join(folder, projectName);
                    let uri = vscode.Uri.parse(projectPath);
                    await vscode.workspace.fs.createDirectory(uri);
                    return initPackage(projectPath);
                } catch (error) {
                    return "";
                }
            }
        );
        if (projectPath.trim() === "") {
            vscode.window.showErrorMessage(
                "Failed to create project. Make sure you have Cangjie Sdk installed. [Learn More](https://developer.huawei.com/consumer/cn/doc/openharmony-cangjie/cj-wp-abstract)"
            );
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

    public static async createFile(fileUri: vscode.Uri) {
        const fileName = await vscode.window.showInputBox({
            prompt: "Enter File name",
            placeHolder: "ArkTs File",
        });
        if (fileName && fileUri && fileUri.fsPath) {
            let targetPath = path.extname(fileUri.path).length > 0 ? path.dirname(fileUri.path) : fileUri.path;
            let uri = vscode.Uri.parse(path.join(targetPath, `${fileName}.ets`));
            await vscode.workspace.fs.writeFile(uri, new Uint8Array());
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
}