import * as vscode from 'vscode';
import { arkts } from '../../../arkts';

export class ArkTSDocumentFormatter implements vscode.DocumentFormattingEditProvider {
    async provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions
    ): Promise<vscode.TextEdit[]> {
        await arkts.format(document.uri);
        return [];
    }
}

export default ArkTSDocumentFormatter;