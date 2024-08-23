import * as vscode from 'vscode';

export class projectLinter {
    register() {
        let codelinter = vscode.workspace.getConfiguration("arktsTools"),
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
            for (let file of e.files) {
                if (file.newUri.fsPath.includes('resources')) {

                }
            }
        });
    }

    private createFiles() {
        vscode.workspace.onDidCreateFiles((e) => {
            for (let file of e.files) {
                if (file.fsPath.includes('resources')) {

                }
            }
        });
    }

    private deleteFiles() {
        vscode.workspace.onDidDeleteFiles((e) => {
            for (let file of e.files) {
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

    execute(path: string) {
        if (path.endsWith('.ets') || path.endsWith('.ts')) {

        } else {

        }
    }
}