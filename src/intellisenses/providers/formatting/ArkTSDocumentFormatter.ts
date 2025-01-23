import * as vscode from 'vscode';
import { arkts } from '../../../arkts';

export class ArkTSDocumentFormatter implements vscode.DocumentFormattingEditProvider {
    async provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions,
        token: vscode.CancellationToken
    ): Promise<vscode.TextEdit[]> {
        try {
            await arkts.format(document.uri);
            return [];
        } catch (error) {
            console.error('Format failed:', error);
            return [];
        }
    }
}