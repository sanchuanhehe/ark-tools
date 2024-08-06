import { arkTs } from './arkts';
import * as vscode from 'vscode';
import init from './projects/init';

export function activate(context: vscode.ExtensionContext) {
	init.extensionPath = context.extensionPath;

	context.subscriptions.push(vscode.commands.registerCommand("arkts.createProject", () => {
		arkTs.createProject();
	}));

	context.subscriptions.push(vscode.commands.registerCommand("arkts.about", () => {
		arkTs.showAbout(context.extensionPath);
	}));

	context.subscriptions.push(vscode.commands.registerCommand("arkts.createFile", (fileUri: vscode.Uri) => {
		arkTs.createFile(fileUri);
	}));

	context.subscriptions.push(vscode.commands.registerCommand("arkts.dependencies", (fileUri: vscode.Uri) => {
		arkTs.dependencies(context.extensionPath, fileUri);
	}));
	vscode.window.showInformationMessage("ArkTS Tools is now activate!");
}

export function deactivate() { }