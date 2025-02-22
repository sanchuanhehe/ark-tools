import * as vscode from 'vscode';
import { createContext } from '../../utils/createContext';
import { completionProvider } from '../base/completionProvider';
import { pathCompletionItem } from '../../utils/pathCompletionItem';

export const pathProvider: completionProvider = {
    selector: {
        scheme: "file",
        language: "arkts"
    },
    provider: {
        provideCompletionItems,
    },
    triggerCharacters: ['/', '.']
};

async function provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.CompletionItem[]> {
    const context = createContext(document, position);
    const { textFullLine } = context;
    if (typeof textFullLine !== 'undefined') {
        if (textFullLine.trim().startsWith('import')) {
            const arr = await pathCompletionItem.create(context);
            return Promise.resolve(arr);
        }
    }
    return Promise.resolve([]);
}