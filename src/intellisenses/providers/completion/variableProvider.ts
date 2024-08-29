import * as vscode from 'vscode';
import { createContext } from '../../utils/createContext';
import { completionProvider } from '../base/completionProvider';
import { variableCompletionItem } from '../../utils/variableCompletionItem';

export const variableProvider: completionProvider = {
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
    triggerCharacters: [':']
};

async function provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.CompletionItem[]> {
    const context = createContext(document, position);
    const { textFullLine } = context;
    if (typeof textFullLine !== 'undefined' && textFullLine.length > 0) {
        const arr = variableCompletionItem.create(textFullLine.trim());
        return Promise.resolve(arr);
    }
    return Promise.resolve([]);
}