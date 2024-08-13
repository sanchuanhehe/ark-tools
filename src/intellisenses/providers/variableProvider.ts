import * as vscode from 'vscode';
import { createContext } from '../utils/createContext';
import { intellisenseProvider } from "./intellisenseProvider";
import { variableCompletionItem } from '../utils/variableCompletionItem';

export const variableProvider: intellisenseProvider = {
    selector: {
        scheme: "file",
        language: "arkts"
    },
    provider: {
        provideCompletionItems,
    },
    triggerCharacters: [':', '@']
};

async function provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.CompletionItem[]> {
    const context = createContext(document, position);
    const { textFullLine } = context;
    if (typeof textFullLine !== 'undefined' && textFullLine.length > 0) {
        let arr = variableCompletionItem.create(textFullLine.trim());
        return Promise.resolve(arr);
    }
    return Promise.resolve([]);
}