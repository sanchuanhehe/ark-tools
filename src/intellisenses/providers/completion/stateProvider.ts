import * as vscode from 'vscode';
import { createContext } from '../../utils/createContext';
import { completionProvider } from '../base/completionProvider';
import { stateCompletionItem } from '../../utils/stateCompletionItem';

export const stateProvider: completionProvider = {
    selector: {
        scheme: "file",
        language: "arkts"
    },
    provider: {
        provideCompletionItems,
    },
    triggerCharacters: ['@']
};

async function provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.CompletionItem[]> {
    const context = createContext(document, position);
    const { textFullLine } = context;
    if (typeof textFullLine !== 'undefined') {
        const text = textFullLine.replace('@', '').trim();
        const arr = stateCompletionItem.create(text);
        return Promise.resolve(arr);
    }
    return Promise.resolve([]);
}