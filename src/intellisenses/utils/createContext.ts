import * as vscode from 'vscode';
import { context } from "./context";

export function createContext(document: vscode.TextDocument, position: vscode.Position): context {
    const range = document.lineAt(position).range;
    const textFullLine = document.getText(range);
    const fromString = getFromString(textFullLine, position.character);
    const documentExtension = extractExtension(document);
    return {
        document,
        fromString,
        textFullLine,
        documentExtension,
        importRange: range
    };
}

function getFromString(textFullLine: string, position: number) {
    const textToPosition = textFullLine.substring(0, position);
    const quoatationPosition = Math.max(
        textToPosition.lastIndexOf('"'),
        textToPosition.lastIndexOf("'"),
        textToPosition.lastIndexOf("`")
    );
    return quoatationPosition !== -1 ? textToPosition.substring(quoatationPosition + 1, textToPosition.length) : undefined;
}

function extractExtension(document: vscode.TextDocument) {
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