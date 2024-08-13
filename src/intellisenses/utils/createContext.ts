import * as vscode from 'vscode';
import { context } from "./context";

export function createContext(document: vscode.TextDocument, position: vscode.Position): context {
    const range = document.lineAt(position).range;
    const textFullLine = document.getText(range);
    const documentExtension = extractExtension(document);
    return {
        document,
        textFullLine,
        documentExtension,
        importRange: range
    };
}

export function extractExtension(document: vscode.TextDocument) {
    if (document.isUntitled) {
        return undefined;
    }
    const fragments = document.fileName.split(".");
    const extension = fragments[fragments.length - 1];
    if (!extension || extension.length > 3) {
        return undefined;
    }
    return extension;
}