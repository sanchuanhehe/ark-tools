import * as vscode from 'vscode';
import { createContext } from '../../utils/createContext';
import { completionProvider } from '../base/completionProvider';
import { classCompletionItem } from '../../utils/classCompletionItem';

export const classProvider: completionProvider = {
    selector: [{
        scheme: "file",
        language: "arkts"
    }, {
        scheme: "file",
        language: "arkui"
    }],
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