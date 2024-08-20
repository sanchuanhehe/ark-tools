import * as vscode from 'vscode';

export interface context {
    textFullLine: string;
    fromString?: string;
    importRange: vscode.Range;
    document: vscode.TextDocument;
    documentExtension: string | undefined;
}