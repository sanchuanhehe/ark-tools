import * as vscode from 'vscode';

export interface definitionProvider {
    selector: vscode.DocumentSelector;
    provider: vscode.DefinitionProvider;
    triggerCharacters?: string[];
}