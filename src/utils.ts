import * as vscode from 'vscode';

export function isEmpty(obj: any) {
    if (typeof obj === 'undefined' || obj === null) {
        return true;
    }
    if (Number.isNaN(obj)) {
        return true;
    }
    if (typeof obj === 'string' && obj.trim() === '') {
        return true;
    }
    return false;
}

export function objToBuffer(obj: any) {
    let json = JSON.stringify(obj);
    return Buffer.from(json, 'utf8');
}

export async function createDirectories(dirs: string[]) {
    for (let dir of dirs) {
        await vscode.workspace.fs.createDirectory(vscode.Uri.parse(dir));
    }
}