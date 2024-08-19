import * as vscode from 'vscode';
import { context } from '../utils/context';

const keys = ['async', 'await', 'extends', 'function', 'import', 'private', 'public', 'protected'];

export class resourcesCompletionItem {
    private static context: context;
    private static arr: vscode.CompletionItem[] = [];
    static create(mark: string, context: context) {
        this.arr = [];
        this.context = context;
        if (mark.trim() === '$') {

        } else {

        }
        let tag = mark.toLowerCase();
        let arr = keys.filter((i) => i.startsWith(tag));
        this.newItems(arr);
        return this.arr;
    }

    private static newItems(marks: string[]) {
        for (let mark of marks) {
            let item = {
                label: mark,
                insertText: mark,
                range: this.context.importRange,
                kind: vscode.CompletionItemKind.Keyword
            };
            this.arr.push(item);
        }
    }
}