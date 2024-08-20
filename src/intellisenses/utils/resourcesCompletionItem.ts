import * as vscode from 'vscode';
import { context } from '../utils/context';
import projectLoader from '../../projects/projectLoader';

export class resourcesCompletionItem {
    private static arr: vscode.CompletionItem[] = [];
    static create(mark: string, context: context) {
        this.arr = [];
        if (mark.trim() === '$') {
            this.newItems(['$r(\'\')']);
            this.newItems(['$r(\'app.color\')']);
            this.newItems(['$r(\'app.string\')']);
            this.newItems(['$r(\'app.media\')']);
        } else {
            let rows: string[] = [];
            let appScope = projectLoader.getProjectModule('appScope');
            let projectModule = projectLoader.getProjectModule(context);
            if (appScope) {
                if (mark.indexOf('app.color') > -1) {
                    for (let color of appScope.colors) {
                        rows.push(color.name);
                    }
                } else if (mark.indexOf('app.string') > -1) {
                    for (let color of appScope.strings) {
                        rows.push(color.name);
                    }
                } else if (mark.indexOf('app.media') > -1) {
                    for (let media of appScope.medias) {
                        rows.push(media);
                    }
                }
            }
            if (projectModule) {
                if (mark.indexOf('app.color') > -1) {
                    for (let color of projectModule.colors) {
                        rows.push(color.name);
                    }
                } else if (mark.indexOf('app.string') > -1) {
                    for (let color of projectModule.strings) {
                        rows.push(color.name);
                    }
                } else if (mark.indexOf('app.media') > -1) {
                    for (let media of projectModule.medias) {
                        rows.push(media);
                    }
                }
            }
            this.newItems(rows);
        }
        return this.arr;
    }

    private static newItems(marks: string[]) {
        for (let mark of marks) {
            let item = {
                label: mark,
                insertText: mark,
                kind: vscode.CompletionItemKind.Value
            };
            this.arr.push(item);
        }
    }
}