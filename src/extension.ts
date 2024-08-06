import { arkTs } from './arkTs';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand("arkts.dependencies", (fileUri: vscode.Uri) => {
		arkTs.dependencies(context.extensionPath, fileUri);
	}));
	vscode.window.showInformationMessage("ArkTS Tools is now activate!");
}

export function deactivate() { }