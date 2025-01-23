import * as vscode from 'vscode';
import { arkts } from '../../../arkts';

export class ArkTSDocumentFormatter implements vscode.DocumentFormattingEditProvider {
    async provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions,
        token: vscode.CancellationToken
    ): Promise<vscode.TextEdit[]> {
        try {
            // 调用 arkts.format 获取 TextEdit[]
            return await arkts.format(document.uri);
        } catch (error) {
            console.error('Format failed:', error as any);
            vscode.window.showErrorMessage(`Formatting failed: ${(error as any).message}`);
            return [];
        }
    }
}
