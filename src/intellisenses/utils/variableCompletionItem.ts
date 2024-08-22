import * as vscode from 'vscode';

const keys = [
    'number', 'string', 'boolean', 'Map', 'String', 'Number', 'Array'
];

export class variableCompletionItem {
    private static arr: vscode.CompletionItem[] = [];
    static create(mark: string) {
        this.arr = [];
        try {
            let tag = mark.toLowerCase().split(':')?.[1] ?? '';
            if (tag || tag === '') {
                tag = mark.toLowerCase().split('@')?.[1] ?? '';
            }
            let arr = tag === '' ? keys : keys.filter((i) => i.toLowerCase().startsWith(tag));
            this.newItems(arr);
        } catch (err) {
            console.log(err);
        }
        return this.arr;
    }

    private static newItems(marks: string[]) {
        for (let mark of marks) {
            let item = {
                label: mark,
                insertText: mark,
                kind: vscode.CompletionItemKind.Variable
            };
            this.arr.push(item);
        }
    }
}