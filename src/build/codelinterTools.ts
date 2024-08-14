import fs from 'fs';
import * as vscode from 'vscode';

export class codelinterTools {
    private static enable = false;
    static check(): Promise<boolean> {
        return new Promise((resolve) => {
            let codelinter = vscode.workspace.getConfiguration("arktsTools.codelinter").inspect<string>('codelinter')?.globalValue ?? '';
            if (codelinter.trim() !== '') {
                fs.accessSync(codelinter);
                this.enable = true;
                resolve(true);
            }
            resolve(false);
        });
    }

}