import * as vscode from 'vscode';
import { context } from '../utils/context';

const keys = ['async', 'await', 'extends', 'function', 'import', 'from', 'private', 'public', 'protected'];

export class keyCompletionItem {
    private static context: context;
    private static arr: vscode.CompletionItem[] = [];
    static create(mark: string, context: context) {
        this.arr = [];
        try {
            this.context = context;
            const tag = mark.toLowerCase();
            const arr = keys.filter((i) => i.startsWith(tag));
            this.newItems(arr);
        } catch (err) {
            console.log(err);
        }
        return this.arr;
    }

    private static newItems(marks: string[]) {
        for (let mark of marks) {
            const label = mark;
            if (mark === 'import') {
                mark = `import {} from '';`;
            }
            const item = {
                label: label,
                insertText: mark,
                range: this.context.importRange,
                kind: vscode.CompletionItemKind.Keyword
            };
            this.arr.push(item);
        }
    }
}