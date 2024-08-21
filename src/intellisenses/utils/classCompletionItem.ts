import * as vscode from 'vscode';
import { globalContext } from '../globalContext';

export class classCompletionItem {
    private static arr: vscode.CompletionItem[] = [];
    static create(mark: string) {
        this.arr = [];
        if (mark === 'import') {
            let root = globalContext.instance.root;
            this.newItems(root);
        } else {
            let fns = mark.split(' ')?.[1]?.trim(), cld = fns?.split('.'), root = cld[0]?.toLowerCase();
            let digit = cld.filter((i) => i.trim() !== '').length;
            if (globalContext.instance.root.includes(root)) {
                let modules = globalContext.instance.getModules(root, digit, fns);
                this.newItems(modules, fns);
            }
        }
        return this.arr;
    }

    private static newItems(marks: string[], replace?: string) {
        for (let mark of marks) {
            if (replace) {
                mark = mark.replace(replace, '');
            }
            let item = {
                label: mark,
                insertText: mark,
                kind: vscode.CompletionItemKind.Module
            };
            this.arr.push(item);
        }
    }
}