import * as vscode from 'vscode';

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

    private static _hosSdkPath: string;
    static get hosSdkPath() {
        return this._hosSdkPath;
    }

    private static _ohosSdkPath: string;
    static get ohosSdkPath() {
        return this._ohosSdkPath;
    }

    static init(context: vscode.ExtensionContext) {
        this._extensionPath = context.extensionPath;
        this._hosSdkPath = vscode.workspace.getConfiguration("arktsTools").inspect<string>('hosSdkPath')?.globalValue ?? '';
        this._ohosSdkPath = vscode.workspace.getConfiguration("arktsTools").inspect<string>('ohosSdkPath')?.globalValue ?? '';
        this._projectPath = vscode.workspace.workspaceFolders?.[0].uri ?? vscode.Uri.parse('./');
    }
}