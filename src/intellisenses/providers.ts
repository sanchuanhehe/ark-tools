import * as vscode from 'vscode';
import { keyProvider } from "./providers/keyProvider";
import { pathProvider } from './providers/pathProvider';
import { classProvider } from './providers/classProvider';
import { stateProvider } from './providers/stateProvider';
import { importProvider } from "./providers/importProvider";
import { packageProvider } from './providers/packageProvider';
import { variableProvider } from './providers/variableProvider';
import { resourcesProvider } from './providers/resourcesProvider';

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