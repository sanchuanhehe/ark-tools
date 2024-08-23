import * as fs from 'fs';
import * as path from 'path';
import { $r } from '../utils';
import * as vscode from 'vscode';
import { globalData } from '../globalData';
import WebviewMessageHandler from './webviewMessageHandler';

export default class UiPanel {
    private readonly panel: vscode.WebviewPanel;
    private readonly projectFileUri: vscode.Uri;
    private readonly extensionPath: string;
    private readonly builtAppFolder: string;
    private disposables: vscode.Disposable[] = [];
    public static currentPanels: Record<string, UiPanel | undefined> = {};
    private static currentMessageHandler: Record<string, WebviewMessageHandler | undefined> = {};

    public static async createOrShow(projectFileUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
        const projectFilePath = projectFileUri.path;
        const existingPanel = UiPanel.currentPanels[projectFilePath];
        if (existingPanel) {
            existingPanel.panel.reveal(column);
        } else {
            UiPanel.currentPanels[projectFilePath] = new UiPanel(globalData.extensionPath, column || vscode.ViewColumn.One, projectFileUri);
        }
        return UiPanel.currentPanels;
    }

    private constructor(extensionPath: string, column: vscode.ViewColumn, projectFileUri: vscode.Uri) {
        this.extensionPath = extensionPath;
        this.builtAppFolder = 'app';
        this.projectFileUri = projectFileUri;
        const projectName = path.basename(this.projectFileUri.path);
        this.panel = vscode.window.createWebviewPanel('arkts.dependencies', projectName, column, {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(this.extensionPath, this.builtAppFolder))],
            retainContextWhenHidden: true,
        });
        this.panel.webview.html = this._getHtmlForWebview();
        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
        UiPanel.currentMessageHandler[projectFileUri.path] = new WebviewMessageHandler(this.panel.webview, this.projectFileUri.fsPath);
    }

    private async dispose() {
        let currentMessageHandler = UiPanel.currentMessageHandler[this.projectFileUri.path];
        if (currentMessageHandler?.needApply) {
            const result = await vscode.window.showInformationMessage($r('dpSaveWarning'), $r('yes'), $r('no'));
            if (result === $r('no')) {
                currentMessageHandler.applySave();
            }
        }
        UiPanel.currentPanels[this.projectFileUri.path] = undefined;
        currentMessageHandler?.dispose();
        currentMessageHandler = undefined;
        this.panel.dispose();
        while (this.disposables.length) {
            const disposable = this.disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }

    private _getHtmlForWebview() {
        const lng = vscode.env.language.includes('zh') ? 'cn' : 'en',
            appDistPath = path.join(this.extensionPath, 'views', lng),
            appDistPathUri = vscode.Uri.file(appDistPath),
            baseUri = this.panel.webview.asWebviewUri(appDistPathUri),
            indexPath = path.join(appDistPath, 'dependencies.html');
        return fs.readFileSync(indexPath, { encoding: 'utf8' }).replace('<base href="/">', `<base href="${String(baseUri)}/">`);
    }
}