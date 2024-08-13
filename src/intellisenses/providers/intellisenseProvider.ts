import * as vscode from 'vscode';

export interface intellisenseProvider {
  selector: vscode.DocumentSelector;
  provider: vscode.CompletionItemProvider;
  triggerCharacters?: string[];
}