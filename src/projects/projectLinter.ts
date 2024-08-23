import * as vscode from 'vscode';
import { toObject } from '../utils';
import codelinterTools from './build/codelinterTools';

export class projectLinter {
    register() {
        const codelinter = vscode.workspace.getConfiguration("arktsTools"),
            reloadChange = codelinter.inspect<boolean>('codelinterReloadChange')?.globalValue ?? false,
            checkAfterSave = codelinter.inspect<boolean>('codelinterCheckAfterSave')?.globalValue ?? false;
        if (reloadChange) {
            this.deleteFiles();
            this.createFiles();
            this.renameFiles();
        }
        if (checkAfterSave) {
            this.checkAfterSave();
        }
    }

    private renameFiles() {
        vscode.workspace.onDidRenameFiles((e) => {
            for (const file of e.files) {
                if (file.newUri.fsPath.includes('resources')) {

                }
            }
        });
    }

    private createFiles() {
        vscode.workspace.onDidCreateFiles((e) => {
            for (const file of e.files) {
                if (file.fsPath.includes('resources')) {

                }
            }
        });
    }

    private deleteFiles() {
        vscode.workspace.onDidDeleteFiles((e) => {
            for (const file of e.files) {
                if (file.fsPath.includes('resources')) {

                }
            }
        });
    }

    private checkAfterSave() {
        vscode.workspace.onDidSaveTextDocument((e) => {
            if (e.fileName.endsWith('.ts') || e.fileName.endsWith('.ets')) {
                this.execute(e.uri.fsPath);
            }
        });
    }

    async execute(path: string) {
        const json = await codelinterTools.exec(path);
        if (json) {
            const obj = toObject(json);

        }
    }
}