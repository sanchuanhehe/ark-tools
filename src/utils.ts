import * as vscode from 'vscode';

const decoder = new TextDecoder('utf8');
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

export async function fileToJson(path: string) {
    let stream = await vscode.workspace.fs.readFile(vscode.Uri.parse(path));
    let content = decoder.decode(stream);
    return JSON.parse(content);
}

export async function createDirectories(dirs: string[]) {
    for (let dir of dirs) {
        await vscode.workspace.fs.createDirectory(vscode.Uri.parse(dir));
    }
}