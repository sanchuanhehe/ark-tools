import * as vscode from 'vscode';

export interface context {
    textFullLine: string;
    importRange: vscode.Range;
    document: vscode.TextDocument;
    documentExtension: string | undefined;
}