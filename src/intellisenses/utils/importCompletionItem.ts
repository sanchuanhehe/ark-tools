import * as vscode from 'vscode';
import { globalContext } from '../globalContext';

export class importCompletionItem {
    private static arr: vscode.CompletionItem[] = [];
    static create(mark: string) {
        this.arr = [];
        try {
            if (mark === 'import') {
                const root = globalContext.instance.root;
                this.newItems(root);
            } else {
                const fns = mark.split(' ')?.[1]?.trim(), cld = fns?.split('.'), root = cld[0]?.toLowerCase();
                const digit = cld.filter((i) => i.trim() !== '').length;
                if (globalContext.instance.root.includes(root)) {
                    const modules = globalContext.instance.getModules(root, digit, fns);
                    this.newItems(modules, fns);
                }
            }
        } catch (err) {
            console.log(err);
        }
        return this.arr;
    }

    private static newItems(marks: string[], replace?: string) {
        for (let mark of marks) {
            if (replace) {
                mark = mark.replace(replace, '');
            }
            const item = {
                label: mark,
                insertText: mark,
                kind: vscode.CompletionItemKind.Module
            };
            this.arr.push(item);
        }
    }
}