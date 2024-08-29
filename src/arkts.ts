import * as fs from 'fs';
import * as path from 'path';
import { $r } from './utils';
import * as vscode from 'vscode';
import tools from './projects/tools';
import * as prettier from "prettier";
import UiPanel from './views/uiPanel';
import { globalData } from './globalData';
import moduleCreator from './projects/moduleCreator';
import projectLoader from './projects/projectLoader';
import projectCreator from './projects/projectCreator';
import { moduleType } from './models/modules/moduleDetail';

export class arkts {
    static readonly encoder = new TextEncoder();

    static async createProject() {
        const projectName = await vscode.window.showInputBox({
            prompt: $r('enterProjectName'),
            placeHolder: $r('pjPlaceHolder')
        });
        const projectPath = await vscode.window.withProgress<string>(
            { location: vscode.ProgressLocation.Notification, cancellable: false },
            async (progress) => {
                progress.report({ message: $r('pjCreateNew', projectName) });
                try {
                    if (!projectName) {
                        return '';
                    }
                    const folders = await vscode.window.showOpenDialog({
                        canSelectMany: false,
                        canSelectFolders: true,
                        openLabel: $r('select')
                    });
                    const folder = folders ? folders[0].fsPath : undefined;
                    if (!folder) {
                        return '';
                    }
                    const projectPath = path.join(folder, projectName);
                    const uri = vscode.Uri.parse(projectPath);
                    await vscode.workspace.fs.createDirectory(uri);
                    return projectCreator.create(projectPath);
                } catch (error) {
                    vscode.window.showErrorMessage($r('pjCreateFailed', error));
                    return '';
                }
            }
        );
        if (projectPath.trim() === '') {
            vscode.window.showErrorMessage($r('pjCreateFailed'));
            return;
        }
        const result = await vscode.window.showInformationMessage($r('pjCreated'), $r('open'), $r('cancel'));
        if (result === $r('open')) {
            vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(projectPath), false);
        }
    }

    static async refreshProject(fileUri: vscode.Uri) {
        const index = fileUri.fsPath.lastIndexOf(process.platform === 'win32' ? '\\' : '/');
        const path = fileUri.fsPath.substring(0, index);
        if (path === globalData.projectPath.fsPath) {
            projectLoader.load(vscode.Uri.parse(path));
        } else {
            projectLoader.loadModule(path);
        }
    }

    static buildProject(fileUri: vscode.Uri) {
        if (fileUri && fileUri.fsPath) {
            projectLoader.build(fileUri);
        }
    }

    static async createFile(fileUri: vscode.Uri) {
        const fileName = await vscode.window.showInputBox({
            prompt: $r('enterFileName'),
            placeHolder: $r('filePlaceHolder')
        });
        if (fileName && fileUri && fileUri.fsPath) {
            const targetPath = path.extname(fileUri.path).length > 0 ? path.dirname(fileUri.path) : fileUri.path;
            const uri = vscode.Uri.parse(path.join(targetPath, `${fileName}.ets`));
            const source = fs.readFileSync(path.join(globalData.extensionPath, 'templates', 'project', 'page.txt'), 'utf-8');
            const data = this.encoder.encode(source.replace('Index', fileName));
            await vscode.workspace.fs.writeFile(uri, data);
        }
    }

    static dependencies(fileUri: vscode.Uri) {
        if (fileUri && fileUri.fsPath) {
            UiPanel.createOrShow(fileUri);
        }
    }

    static showAbout() {
        UiPanel.createOrShow(vscode.Uri.parse('about'));
    }

    static async format(fileUri: vscode.Uri) {
        if (fileUri && fileUri.fsPath) {
            const filePath = fileUri.fsPath;
            const text = fs.readFileSync(filePath, { encoding: 'utf8' });
            const document = vscode.window.activeTextEditor?.document;
            if (document) {
                let i = 0, j = 0;
                const string0 = document.getText(), formatted = prettier.format(text, {
                    tabWidth: 4,
                    semi: false,
                    parser: (filePath.endsWith('.json') || filePath.endsWith('.json5')) ? "json5" : "typescript"
                });
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

    static async createModule() {
        const moduleName = await vscode.window.showInputBox({
            prompt: $r('enterModuleName'),
            placeHolder: $r('modulePlaceHolder')
        });
        const mode = await vscode.window.showQuickPick(['entry', 'shared', 'static', 'feature']);
        await vscode.window.withProgress<void>(
            { location: vscode.ProgressLocation.Notification, cancellable: false },
            async (progress) => {
                progress.report({ message: $r('moduleCreate', moduleName) });
                try {
                    if (moduleName) {
                        const modulePath = path.join(projectLoader.projectPath.fsPath, moduleName);
                        const uri = vscode.Uri.parse(modulePath),
                            authorName = projectLoader.tryGetAuthor();
                        await vscode.workspace.fs.createDirectory(uri);
                        let type: moduleType = 'entry';
                        if (mode === 'shared') {
                            type = 'shared';
                        } else if (mode === 'static') {
                            type = 'har';
                        } else if (mode === 'feature') {
                            type = 'feature';
                        }
                        await moduleCreator.createModule(moduleName, projectLoader.appName, authorName, type);
                        await projectLoader.loadModule(moduleName);
                    }
                } catch (error) {
                    vscode.window.showErrorMessage($r('pjCreateFailed', error));
                }
            }
        );
    }

    static codelinter(fileUri: vscode.Uri) {
        if (fileUri && fileUri.fsPath) {
            projectLoader.executeCodelinter(fileUri);
        }
    }

    static async toolsInit() {
        const folders = await vscode.window.showOpenDialog({
            canSelectMany: false,
            canSelectFiles: true,
            openLabel: $r('select'),
            filters: { 'Zip': ['zip'] }
        });
        const fsPath = folders?.[0].fsPath;
        if (fsPath && fsPath.endsWith('.zip')) {
            const folders = await vscode.window.showOpenDialog({
                canSelectMany: false,
                canSelectFolders: true,
                openLabel: $r('select')
            });
            const folder = folders ? folders[0].fsPath : undefined;
            if (folder) {
                await vscode.window.withProgress<void>(
                    { location: vscode.ProgressLocation.Notification, cancellable: false },
                    async (progress, token) => {
                        progress.report({ message: $r('unzipTools') });
                        token.onCancellationRequested(async () => {
                            await tools.abort();
                        });
                        let target = await tools.unZip(fsPath, folder, (name: string) => {
                            progress.report({ message: `${$r('extractTips')} ${name}...` });
                        });
                        if (target) {
                            await vscode.workspace.getConfiguration("arktsTools").update('commandToolsPath', target);
                            await tools.config(folder);
                        } else {
                            vscode.window.showErrorMessage($r('initToolsFailed'));
                        }
                    });
            }
        }
    }
}