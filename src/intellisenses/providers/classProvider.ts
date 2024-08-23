import * as vscode from 'vscode';
import { createContext } from '../utils/createContext';
import { intellisenseProvider } from "./intellisenseProvider";
import { classCompletionItem } from '../utils/classCompletionItem';

export const classProvider: intellisenseProvider = {
    selector: {
        scheme: "file",
        language: "arkts"
    },
    provider: {
        provideCompletionItems,
    },
    triggerCharacters: ['{', ' ']
};

async function provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.CompletionItem[]> {
    const context = createContext(document, position);
    const { textFullLine } = context;
    if (typeof textFullLine !== 'undefined' && textFullLine.includes('from')) {
        const arr = classCompletionItem.create(textFullLine.trim(), context);
        return Promise.resolve(arr);
    }
    return Promise.resolve([]);
}