import * as vscode from 'vscode';
import { context } from '../utils/context';

export class resourcesCompletionItem {
    private static context: context;
    private static arr: vscode.CompletionItem[] = [];
    static create(mark: string, context: context) {
        this.arr = [];
        this.context = context;
        if (mark.trim() === '$') {
            this.newItems(['$r(\'\')']);
            this.newItems(['$r(\'app.color\')']);
            this.newItems(['$r(\'app.string\')']);
            this.newItems(['$r(\'app.media\')']);
        } else {
            if (mark.indexOf('app.color') > -1) {

            } else if (mark.indexOf('app.string') > -1) {

            } else if (mark.indexOf('app.media') > -1) {

            }

        }
        return this.arr;
    }

    private static newItems(marks: string[]) {
        for (let mark of marks) {
            let item = {
                label: mark,
                insertText: mark,
                range: this.context.importRange,
                kind: vscode.CompletionItemKind.Value
            };
            this.arr.push(item);
        }
    }
}