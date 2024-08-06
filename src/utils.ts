
import * as vscode from 'vscode';

export function isEmpty(obj: any) {
    if (typeof obj === 'undefined' || obj == null)
        return true;
    if (Number.isNaN(obj))
        return true;
    if (typeof obj === 'string' && obj.trim() === '')
        return true;
    return false;
}

export function initPackage(projectPath: string): Promise<string> {
    try {

        return Promise.resolve(projectPath);
    }
    catch (err) {
        vscode.window.showErrorMessage(`Create Project Failed, ${err}`);
        return Promise.reject(err);
    }
}