import fs from 'fs';
import path from 'path';
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
    const json = JSON.stringify(obj);
    return textToBuffer(json);
}

export function hasFile(path: string | vscode.Uri) {
    try {
        if (typeof path !== 'string') {
            path = path.fsPath;
        }
        fs.statSync(path);
        return true;
    } catch {
        return false;
    }
}

export function getFiles(uri: string | vscode.Uri) {
    let files: [string, string][] = [];
    try {
        if (typeof uri !== 'string') {
            uri = uri.fsPath;
        }
        for (let f of fs.readdirSync(uri)) {
            const name = path.join(uri, f),
                stat = fs.statSync(name);
            if (!stat.isDirectory()) {
                files.push([f, name]);
            }
        }
    } catch { }
    return files;
}

export function textToBuffer(text: string) {
    return encoder.encode(text);
}

export function $r(key: string, end?: any) {
    const content = language.instance.getContent(key);
    return `${content} ${end ?? ''}`;
}

export async function fileToJson(path: string | vscode.Uri) {
    try {
        if (typeof path === 'string') {
            path = vscode.Uri.parse(path);
        }
        const stream = await vscode.workspace.fs.readFile(path);
        const content = decoder.decode(stream);
        return JSON5.parse(content);
    } catch {
        return undefined;
    }
}

export function fileToJsonSync(path: string | vscode.Uri) {
    try {
        if (typeof path !== 'string') {
            path = path.fsPath;
        }
        const stream = fs.readFileSync(path);
        const content = decoder.decode(stream);
        return JSON5.parse(content);
    } catch {
        return undefined;
    }
}

export async function fileToContent(path: string | vscode.Uri) {
    try {
        if (typeof path === 'string') {
            path = vscode.Uri.parse(path);
        }
        const stream = await vscode.workspace.fs.readFile(path);
        return decoder.decode(stream);
    } catch {
        return undefined;
    }
}

export async function createDirectories(dirs: string[]) {
    for (const dir of dirs) {
        await vscode.workspace.fs.createDirectory(vscode.Uri.parse(dir));
    }
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

export function relativePath(mark: string) {
    const fidx = mark.lastIndexOf('from');
    let relative = mark.substring(fidx + 4).trim().replace(/\'/g, '');
    if (!relative.endsWith('\'') || !relative.endsWith('\"')) {
        relative = relative.replace(';', '');
    }
    return relative.replaceAll('\'', '').replaceAll('\"', '');
}

export function getFolder(fsPath: string) {
    const index = fsPath.lastIndexOf('/'), lastPart = fsPath.substring(index);
    if (lastPart.indexOf('.') !== -1) {
        return fsPath.substring(0, index);
    } else {
        return fsPath;
    }
}

export function toObject(json: string) {
    return JSON5.parse(json);
}