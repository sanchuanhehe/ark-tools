import * as vscode from 'vscode';
import { keyProvider } from "./providers/completion/keyProvider";
import { pathProvider } from './providers/completion/pathProvider';
import { classProvider } from './providers/completion/classProvider';
import { stateProvider } from './providers/completion/stateProvider';
import { importProvider } from "./providers/completion/importProvider";
import { packageProvider } from './providers/definition/packageProvider';
import { variableProvider } from './providers/completion/variableProvider';
import { resourcesProvider } from './providers/completion/resourcesProvider';

export function registerProvider(context: vscode.ExtensionContext) {
    [keyProvider, importProvider, variableProvider, classProvider, stateProvider, pathProvider, resourcesProvider].forEach((provider) => {
        const disposable = vscode.languages.registerCompletionItemProvider(provider.selector, provider.provider, ...(provider.triggerCharacters || []));
        context.subscriptions.push(disposable);
    }); 
    [packageProvider].forEach((provider) => {
        const disposable = vscode.languages.registerDefinitionProvider(provider.selector, provider.provider);
        context.subscriptions.push(disposable);
    });
}