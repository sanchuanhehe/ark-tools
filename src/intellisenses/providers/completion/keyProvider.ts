import * as vscode from 'vscode';
import { createContext } from '../../utils/createContext';
import { completionProvider } from '../base/completionProvider';
import { keyCompletionItem } from '../../utils/keyCompletionItem';

export const keyProvider: completionProvider = {
  selector: {
    scheme: "file",
    language: "arkts"
  },
  provider: {
    provideCompletionItems,
  }
};

async function provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.CompletionItem[]> {
  const context = createContext(document, position);
  const { textFullLine } = context;
  if (typeof textFullLine !== 'undefined' && textFullLine.length > 0) {
    const arr = keyCompletionItem.create(textFullLine.trim(), context);
    return Promise.resolve(arr);
  }
  return Promise.resolve([]);
}