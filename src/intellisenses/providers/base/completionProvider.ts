import * as vscode from 'vscode';

export interface completionProvider {
  selector: vscode.DocumentSelector;
  provider: vscode.CompletionItemProvider;
  triggerCharacters?: string[];
}