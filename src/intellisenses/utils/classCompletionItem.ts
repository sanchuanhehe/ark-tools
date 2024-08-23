import fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';
import * as readline from 'readline';
import { context } from '../utils/context';
import { getFolder, hasFile, relativePath } from '../../utils';

export class classCompletionItem {
    private static arr: vscode.CompletionItem[] = [];
    static async create(mark: string, context: context): Promise<vscode.CompletionItem[]> {
        return new Promise((resolve) => {
            this.arr = [];
            const relative = relativePath(mark),
                root = getFolder(context.document.uri.fsPath);
            const absolute = path.resolve(root, relative),
                index = absolute.lastIndexOf('/'),
                folder = absolute.substring(0, index),
                name = absolute.substring(index + 1);
            const files = fs.readdirSync(folder),
                file = files.filter(x => x.startsWith(name))?.[0],
                absoluteFile = path.join(folder, file);
            if (hasFile(absoluteFile)) {
                const rl = readline.createInterface({ input: fs.createReadStream(absoluteFile) });
                rl.on('line', line => {
                    if (line.trim().startsWith('export')) {
                        if (line.includes('function')) {
                            const match = line.match(/export\s+function\s+([^ (]+)\(([^)]*)\)/);
                            const name = match?.[1];
                            if (name) {
                                this.newItem(name, vscode.CompletionItemKind.Function);
                            }
                        } else if (line.includes('const')) {
                            const match = line.match(/export\s+const\s+([^ :=]+)/);
                            const name = match?.[1];
                            if (name) {
                                const idx = name.lastIndexOf(':');
                                this.newItem(idx > -1 ? name.substring(0, idx) : name, vscode.CompletionItemKind.Value);
                            }
                        } else if (line.includes('class') || line.includes('enum') || line.includes('struct')) {
                            const match = line.match(/export\s+(class|enum|struct)\s+([^ ,{]+)/);
                            const name = match?.[2];
                            if (name) {
                                const kind = line.includes('class') ? vscode.CompletionItemKind.Class : (line.includes('enum') ? vscode.CompletionItemKind.Enum : vscode.CompletionItemKind.Struct);
                                this.newItem(name, kind);
                            }
                        }
                    }
                });
                rl.on('close', () => {
                    resolve(this.arr);
                });
            } else {
                resolve(this.arr);
            }
        });
    }

    private static newItem(mark: string, kind: vscode.CompletionItemKind) {
        const item = {
            label: mark,
            insertText: mark,
            kind: kind
        };
        this.arr.push(item);
    }
}