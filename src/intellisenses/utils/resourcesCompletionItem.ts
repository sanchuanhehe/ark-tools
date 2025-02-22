import * as vscode from 'vscode';
import { context } from '../utils/context';
import projectLoader from '../../projects/projectLoader';

export class resourcesCompletionItem {
    private static arr: vscode.CompletionItem[] = [];
    static create(mark: string, context: context) {
        this.arr = [];
        try {
            if (mark.trim() === '$') {
                this.newItems(['$r(\'\')']);
                this.newItems(['$r(\'app.color\')']);
                this.newItems(['$r(\'app.string\')']);
                this.newItems(['$r(\'app.media\')']);
            } else {
                const rows: string[] = [];
                const appScope = projectLoader.getProjectModule('appScope');
                const projectModule = projectLoader.getProjectModule(context);
                if (appScope) {
                    if (mark.indexOf('app.color') > -1) {
                        for (const color of appScope.colors) {
                            rows.push(color.name);
                        }
                    } else if (mark.indexOf('app.string') > -1) {
                        for (const color of appScope.strings) {
                            rows.push(color.name);
                        }
                    } else if (mark.indexOf('app.media') > -1) {
                        for (const media of appScope.medias) {
                            rows.push(media);
                        }
                    }
                }
                if (projectModule) {
                    if (mark.indexOf('app.color') > -1) {
                        for (const color of projectModule.colors) {
                            rows.push(color.name);
                        }
                    } else if (mark.indexOf('app.string') > -1) {
                        for (const color of projectModule.strings) {
                            rows.push(color.name);
                        }
                    } else if (mark.indexOf('app.media') > -1) {
                        for (const media of projectModule.medias) {
                            rows.push(media);
                        }
                    }
                }
                this.newItems(rows);
            }
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
                kind: vscode.CompletionItemKind.Value
            };
            this.arr.push(item);
        }
    }
}