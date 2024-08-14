import fs from 'fs';
import * as vscode from 'vscode';

export class buildTools {
    private static enable = false;

    static check(): Promise<boolean> {
        return new Promise((resolve) => {
            let jdkPath = vscode.workspace.getConfiguration("arktsTools.jdkPath").inspect<string>('jdkPath')?.globalValue ?? '';
            let hdcPath = vscode.workspace.getConfiguration("arktsTools.hdcPath").inspect<string>('hdcPath')?.globalValue ?? '';
            let ohpmPath = vscode.workspace.getConfiguration("arktsTools.ohpmPath").inspect<string>('ohpmPath')?.globalValue ?? '';
            let hvigorPath = vscode.workspace.getConfiguration("arktsTools.hvigorPath").inspect<string>('hvigorPath')?.globalValue ?? '';
            if (jdkPath.trim() === '' || hdcPath.trim() === '' || ohpmPath.trim() === '' || hvigorPath.trim() === '') {
                vscode.window.showErrorMessage("Failed to init build tools. Please check your env or config!");
                resolve(false);
            } else {
                try {
                    fs.accessSync(jdkPath);
                    fs.accessSync(hdcPath);
                    fs.accessSync(ohpmPath);
                    fs.accessSync(hvigorPath);
                    this.enable = true;
                    resolve(true);
                } catch (err) {
                    vscode.window.showErrorMessage(`Failed to init build tools. Please check your env or config! ${err}`);
                    resolve(false);
                }
            }
        });
    }

    static init() {
        if (this.enable) {
            switch (process.platform) {
                case 'win32': {

                    break;
                }
                case 'linux': {

                    break;
                }
                case 'darwin': {

                    break;
                }
            }
        } else {
            vscode.window.showErrorMessage('Failed to init build tools. Please check your env or config then restart the VsCode!');
        }
    }
}