import * as vscode from 'vscode';
import { context } from './context';

export class pathCompletionItem {
    private static context: context;
    private static arr: vscode.CompletionItem[] = [];
    static create(mark: string, context: context) {
        this.arr = [];
        this.context = context;
        
        this.newItems(['']);
        return this.arr;
    }

    private static newItems(marks: string[]) {
        for (let mark of marks) {
            let item = {
                label: mark,
                insertText: mark,
                range: this.context.importRange,
                kind: vscode.CompletionItemKind.File
            };
            this.arr.push(item);
        }
    }
}