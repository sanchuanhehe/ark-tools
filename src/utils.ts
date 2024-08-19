import * as JSON5 from 'json5';
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
    let json = JSON5.stringify(obj);
    return Buffer.from(json, 'utf8');
}

export async function fileToJson(path: string | vscode.Uri) {
    if (typeof path === 'string') {
        path = vscode.Uri.parse(path);
    }
    let stream = await vscode.workspace.fs.readFile(path);
    let content = decoder.decode(stream);
    return JSON5.parse(content);
}

export async function fileToContent(path: string | vscode.Uri) {
    if (typeof path === 'string') {
        path = vscode.Uri.parse(path);
    }
    let stream = await vscode.workspace.fs.readFile(path);
    return decoder.decode(stream);
}

export async function createDirectories(dirs: string[]) {
    for (let dir of dirs) {
        await vscode.workspace.fs.createDirectory(vscode.Uri.parse(dir));
    }
}