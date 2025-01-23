import { $r } from './utils';
import { arkts } from './arkts';
import * as vscode from 'vscode';
import tools from './projects/tools';
import { language } from './language';
import { globalData } from './globalData';
import projectLoader from './projects/projectLoader';
import { registerProvider } from './intellisenses/providers';
import { globalContext } from './intellisenses/globalContext';
import { ArkTSDocumentFormatter } from './intellisenses/providers/formatting/ArkTSDocumentFormatter';


export function activate(context: vscode.ExtensionContext) {
	globalData.init(context);
	globalContext.instance.initialize();
	projectLoader.tryLoad();
	projectLoader.onChangeInit();
	context.subscriptions.push(vscode.commands.registerCommand("arkts.createProject",
		() => arkts.createProject()));
	context.subscriptions.push(vscode.commands.registerCommand("arkts.about",
		() => arkts.showAbout()));
	context.subscriptions.push(vscode.commands.registerCommand("arkts.createFile",
		(fileUri: vscode.Uri) => arkts.createFile(fileUri)));
	context.subscriptions.push(vscode.commands.registerCommand("arkts.refreshProject",
		(fileUri: vscode.Uri) => arkts.refreshProject(fileUri)));
	context.subscriptions.push(vscode.commands.registerCommand("arkts.buildProject",
		(fileUri: vscode.Uri) => arkts.buildProject(fileUri)));
	context.subscriptions.push(vscode.commands.registerCommand("arkts.dependencies",
		(fileUri: vscode.Uri) => arkts.dependencies(fileUri)));
	context.subscriptions.push(vscode.commands.registerCommand("arkts.format",
		(fileUri: vscode.Uri) => arkts.format(fileUri)));
	context.subscriptions.push(vscode.commands.registerCommand("arkts.createModule",
		() => arkts.createModule()));
	context.subscriptions.push(vscode.commands.registerCommand("arkts.codelinter",
		(fileUri: vscode.Uri) => arkts.codelinter(fileUri)));
	context.subscriptions.push(vscode.commands.registerCommand("arkts.toolsInit",
		() => arkts.toolsInit()));
	context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(
            { scheme: 'file', language: 'arkts' },
            new ArkTSDocumentFormatter()
        )
    );
	registerProvider(context);
	language.newInstance(context.extensionPath);
	vscode.window.showInformationMessage($r('activeMessage'));
}
export function deactivate() {
	tools.abort();
}