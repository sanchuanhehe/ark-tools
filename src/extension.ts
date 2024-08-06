import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('arkts.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from ArkTS!');
	});
	context.subscriptions.push(disposable);
}

export function deactivate() { }