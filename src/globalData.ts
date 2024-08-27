import path from 'path';
import * as vscode from 'vscode';
import { fileToJsonSync, getFolders } from './utils';

export class globalData {
    private static _extensionPath: string;
    static get extensionPath() {
        return this._extensionPath;
    }

    private static _projectPath: vscode.Uri;
    static get projectPath() {
        return this._projectPath;
    }
    static set projectPath(projectPath: vscode.Uri) {
        this._projectPath = projectPath;
    }

    private static _hosSdkList: Map<string, string> = new Map();
    static get hosSdkList() {
        return this._hosSdkList;
    }

    private static _ohosSdkPath: string;
    static get ohosSdkPath() {
        return this._ohosSdkPath;
    }

    static init(context: vscode.ExtensionContext) {
        this._extensionPath = context.extensionPath;
        this.onChangeInit();
        this.loadConfiguration();
    }

    private static loadConfiguration() {
        const hosSdkPath = vscode.workspace.getConfiguration("arktsTools").inspect<string>('hosSdkPath')?.globalValue ?? '', folders = getFolders(hosSdkPath);
        for (const folder of folders) {
            const obj = fileToJsonSync(path.join(folder[1], 'sdk-pkh.json')),
                name = `${obj.data.platformVersion}(${obj.data.apiVersion})`;
            this._hosSdkList.set(name, folder[1]);
        }
        this._ohosSdkPath = vscode.workspace.getConfiguration("arktsTools").inspect<string>('ohosSdkPath')?.globalValue ?? '';
        this._projectPath = vscode.workspace.workspaceFolders?.[0].uri ?? vscode.Uri.parse('./');
    }

    private static onChangeInit() {
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('arktsTools.hosSdkPath')
                || e.affectsConfiguration('arktsTools.ohosSdkPath')) {
                this.loadConfiguration();
            }
        });
    }
}