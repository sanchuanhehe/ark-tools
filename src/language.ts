import path from 'path';
import * as vscode from 'vscode';
import { fileToJsonSync } from './utils';

export class language {
    private readonly zhJson;
    private readonly enJson;
    private static _instance: language;
    static newInstance(extensionPath: string) {
        if (!this._instance) {
            this._instance = new language(extensionPath);
        }
        return this._instance;
    }

    static get instance() {
        return this._instance;
    }

    constructor(extensionPath: string) {
        let root = path.join(extensionPath, 'lang'),
            zh = path.join(root, 'zhs.json'), en = path.join(root, 'en.json');
        this.zhJson = fileToJsonSync(zh);
        this.enJson = fileToJsonSync(en);
    }

    getContent(key: string): string {
        let zh = vscode.env.language.includes('zh');
        if (zh) {
            if (this.zhJson.hasOwnProperty(key)) {
                return this.zhJson[key];
            }
        } else {
            if (this.enJson.hasOwnProperty(key)) {
                return this.enJson[key];
            }
        }
        return '';
    }
}