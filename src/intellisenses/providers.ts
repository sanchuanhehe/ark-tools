import * as vscode from 'vscode';
import { keyProvider } from "./providers/keyProvider";
import { importProvider } from "./providers/importProvider";
import { variableProvider } from './providers/variableProvider';

export function registerProvider(context: vscode.ExtensionContext) {
    [keyProvider, importProvider, variableProvider].forEach((provider) => {
        let disposable = vscode.languages.registerCompletionItemProvider(provider.selector, provider.provider, ...(provider.triggerCharacters || []));
        context.subscriptions.push(disposable);
    });
}