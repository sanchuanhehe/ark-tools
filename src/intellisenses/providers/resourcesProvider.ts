
import * as vscode from 'vscode';
import { createContext } from "../utils/createContext";
import { intellisenseProvider } from "./intellisenseProvider";
import { resourcesCompletionItem } from '../utils/resourcesCompletionItem';

export const resourcesProvider: intellisenseProvider = {
    selector: {
        scheme: "file",
        language: "arkts"
    },
    provider: {
        provideCompletionItems,
    },
    triggerCharacters: ['$', '.']
};

async function provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.CompletionItem[]> {
    const context = createContext(document, position);
    const { textFullLine } = context;
    if (typeof textFullLine !== 'undefined') {
        if (textFullLine.startsWith('$')) {
            let arr = resourcesCompletionItem.create(textFullLine, context);
            return Promise.resolve(arr);
        }
    }
    return Promise.resolve([]);
}