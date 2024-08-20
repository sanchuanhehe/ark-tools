const opn = require('opn');
import * as vscode from 'vscode';
import { buildTools } from "../build/buildTools";

export class projectBuilder {
    private readonly projectPath;
    constructor(projectPath: vscode.Uri) {
        this.projectPath = projectPath;
    }

    async check() {
        let ret = await buildTools.check();
        if (!ret) {
            const result = await vscode.window.showInformationMessage('Failed to build project. Please follow the guide then retry', "Open", "Cancel");
            if (result === "Open") {
                opn('http://developer.huawei.com/consumer/cn/download/command-line-tools-for-hmos');
            }
        }
    }

    async build() {

    }
}