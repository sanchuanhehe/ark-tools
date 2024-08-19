import { arkts } from './arkts';
import * as vscode from 'vscode';
import { globalData } from './globalData';
import { registerProvider } from './intellisenses/providers';
import { globalContext } from './intellisenses/globalContext';

export function activate(context: vscode.ExtensionContext) {
	globalData.extensionPath = context.extensionPath;
	globalData.projectPath = vscode.workspace.workspaceFolders?.[0].uri.path ?? '';
	globalContext.instance.initialize();

	context.subscriptions.push(vscode.commands.registerCommand("arkts.createProject", () => {
		arkts.createProject();
	}));

	context.subscriptions.push(vscode.commands.registerCommand("arkts.about", () => {
		arkts.showAbout(context.extensionPath);
	}));

	context.subscriptions.push(vscode.commands.registerCommand("arkts.createFile", (fileUri: vscode.Uri) => {
		arkts.createFile(context.extensionPath, fileUri);
	}));

	context.subscriptions.push(vscode.commands.registerCommand("arkts.dependencies", (fileUri: vscode.Uri) => {
		arkts.dependencies(context.extensionPath, fileUri);
	}));

	context.subscriptions.push(vscode.commands.registerCommand("arkts.format", (fileUri: vscode.Uri) => {
		return arkts.format(fileUri);
	}));

	registerProvider(context);
	vscode.window.showInformationMessage("ArkTS Tools is now activate!");
}
export function deactivate() { }