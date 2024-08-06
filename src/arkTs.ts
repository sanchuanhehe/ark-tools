import * as vscode from 'vscode';
import UiPanel from './views/uiPanel';

export class arkTs {
    static dependencies(extensionPath: string, fileUri: vscode.Uri) {
        if (fileUri && fileUri.fsPath) {
            UiPanel.createOrShow(extensionPath, fileUri);
        }
    }
}