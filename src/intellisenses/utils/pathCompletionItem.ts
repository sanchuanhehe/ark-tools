import * as vscode from 'vscode';
import { context } from './context';
import projectLoader from '../../projects/projectLoader';

export class pathCompletionItem {
    private static arr: vscode.CompletionItem[] = [];
    static create(mark: string, context: context) {
        this.arr = [];
        let projectModule = projectLoader.getProjectModule(context);
        if (projectModule) {
            let paths: string[] = [];
            let index = context.document.uri.fsPath.lastIndexOf(process.platform === 'win32' ? '\\' : '/'), path = context.document.uri.fsPath.substring(0, index);
            for (let file of projectModule.files) {
                let rep = file.fsPath.replace(path, '');
                console.log(rep);
            }
            this.newItems(paths);
        }
        return this.arr;
    }

    private static newItems(marks: string[]) {
        for (let mark of marks) {
            let item = {
                label: mark,
                insertText: mark,
                kind: vscode.CompletionItemKind.File
            };
            this.arr.push(item);
        }
    }
}