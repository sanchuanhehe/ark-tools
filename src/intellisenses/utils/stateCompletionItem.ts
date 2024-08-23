import * as vscode from 'vscode';

const keys = [
    'State', 'Prop', 'Link', 'Provide', 'Consume', 'Observed', 'ObjectLink',
    'Watch', 'Track',
    'Entry', 'Component', 'Reusable', 'Preview', 'CustomDialog',
    'Builder', 'BuilderParam', 'Styles', 'Extend', 'AnimatableExtend', 'Require'
];

export class stateCompletionItem {
    private static arr: vscode.CompletionItem[] = [];
    static create(mark: string) {
        this.arr = [];
        try {
            const arr = mark === '' ? keys : keys.filter((i) => i.toLowerCase().startsWith(mark));
            this.newItems(arr);
        } catch (err) {
            console.log(err);
        }
        return this.arr;
    }

    private static newItems(marks: string[]) {
        for (const mark of marks) {
            const item = {
                label: mark,
                insertText: mark,
                kind: vscode.CompletionItemKind.Variable
            };
            this.arr.push(item);
        }
    }
}