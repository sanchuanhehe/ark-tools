import fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';
import * as readline from 'readline';
import { context } from '../utils/context';
import { getFolder, relativePath } from '../../utils';

export class classCompletionItem {
    private static arr: vscode.CompletionItem[] = [];
    static async create(mark: string, context: context): Promise<vscode.CompletionItem[]> {
        return new Promise((resolve) => {
            this.arr = [];
            let relative = relativePath(mark),
                root = getFolder(context.document.uri.fsPath);
            let absolute = path.resolve(root, relative),
                index = absolute.lastIndexOf('/'),
                folder = absolute.substring(0, index),
                name = absolute.substring(index + 1);
            let files = fs.readdirSync(folder),
                file = files.filter(x => x.startsWith(name))?.[0],
                absoluteFile = path.join(folder, file);
            let rl = readline.createInterface({ input: fs.createReadStream(absoluteFile) });
            rl.on('line', line => {
                if (line.trim().startsWith('export')) {
                    if (line.includes('function')) {
                        const match = line.match(/export\s+function\s+([^ (]+)\(([^)]*)\)/);
                        const name = match?.[1];
                        if (name) {
                            this.newItem(name, vscode.CompletionItemKind.Function);
                        }
                    } else if (line.includes('const')) {
                        let match = line.match(/export\s+const\s+([^ :=]+)/);
                        const name = match?.[1];
                        if (name) {
                            let idx = name.lastIndexOf(':');
                            this.newItem(idx > -1 ? name.substring(0, idx) : name, vscode.CompletionItemKind.Value);
                        }
                    } else if (line.includes('class') || line.includes('enum')) {
                        const match = line.match(/export\s+(class|enum)\s+([^ ,{]+)/);
                        const name = match?.[2];
                        if (name) {
                            let kind = line.includes('class') ? vscode.CompletionItemKind.Class : vscode.CompletionItemKind.Enum;
                            this.newItem(name, kind);
                        }
                    }
                }
            });
            rl.on('close', () => {
                resolve(this.arr);
            });
        });
    }

    private static newItem(mark: string, kind: vscode.CompletionItemKind) {
        let item = {
            label: mark,
            insertText: mark,
            kind: kind
        };
        this.arr.push(item);
    }
}