import fs from 'fs';
import * as JSON5 from 'json5';
import * as vscode from 'vscode';
import { language } from './language';

const encoder = new TextEncoder();
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
    return textToBuffer(json);
}

export function hasFile(path: string) {
    try {
        fs.statSync(path);
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}

export function textToBuffer(text: string) {
    return encoder.encode(text);
}

export function $r(key: string, end?: any) {
    let content = language.instance.getContent(key);
    return `${content} ${end ?? ''}`;
}

export async function fileToJson(path: string | vscode.Uri) {
    try {
        if (typeof path === 'string') {
            path = vscode.Uri.parse(path);
        }
        let stream = await vscode.workspace.fs.readFile(path);
        let content = decoder.decode(stream);
        return JSON5.parse(content);
    } catch (err) {
        console.log(err);
        return undefined;
    }
}

export function fileToJsonSync(path: string | vscode.Uri) {
    try {
        if (typeof path !== 'string') {
            path = path.fsPath;
        }
        let stream = fs.readFileSync(path);
        let content = decoder.decode(stream);
        return JSON5.parse(content);
    } catch (err) {
        console.log(err);
        return undefined;
    }
}

export async function fileToContent(path: string | vscode.Uri) {
    try {
        if (typeof path === 'string') {
            path = vscode.Uri.parse(path);
        }
        let stream = await vscode.workspace.fs.readFile(path);
        return decoder.decode(stream);
    } catch (err) {
        console.log(err);
        return undefined;
    }
}

export async function createDirectories(dirs: string[]) {
    for (let dir of dirs) {
        await vscode.workspace.fs.createDirectory(vscode.Uri.parse(dir));
    }
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

export function relativePath(mark: string) {
    let fidx = mark.lastIndexOf('from');
    let relative = mark.substring(fidx + 4).trim().replace(/\'/g, '');
    if (!relative.endsWith('\'') || !relative.endsWith('\"')) {
        relative = relative.replace(';', '');
    }
    return relative.replaceAll('\'', '').replaceAll('\"', '');
}

export function getFolder(fsPath: string) {
    let index = fsPath.lastIndexOf('/');
    let lastPart = fsPath.substring(index);
    if (lastPart.indexOf('.') !== -1) {
        return fsPath.substring(0, index);
    } else {
        return fsPath;
    }
}