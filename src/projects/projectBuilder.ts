import { $r } from '../utils';
import * as vscode from 'vscode';
import projectLoader from './projectLoader';
import { buildTools } from "./build/buildTools";

export class projectBuilder {
    private readonly open;
    private readonly projectPath;
    constructor(projectPath: vscode.Uri) {
        this.open = require('opn');
        this.projectPath = projectPath;
    }

    async check() {
        let ret = await buildTools.check();
        if (!ret) {
            const result = await vscode.window.showInformationMessage($r('pjBuildFailed'), $r('open'), $r('cancel'));
            if (result === $r('open')) {
                this.open('http://developer.huawei.com/consumer/cn/download/command-line-tools-for-hmos');
            }
        } else {
            buildTools.init();
        }
    }

    async build(fileUri: vscode.Uri) {
        try {
            let index = fileUri.fsPath.lastIndexOf(process.platform === 'win32' ? '\\' : '/');
            let path = fileUri.fsPath.substring(0, index);
            if (this.projectPath.fsPath === path) {
                let entries = projectLoader.moduleEntries;
                let mode = await vscode.window.showQuickPick(['debug', 'release']);
                if (mode) {
                    if (entries.length === 1) {
                        buildTools.build(entries[0], mode);
                    } else {
                        let name = await vscode.window.showQuickPick(entries);
                        if (name) {
                            buildTools.build(name, mode);
                        }
                    }
                }
            } else {
                buildTools.buildModule(fileUri, path);
            }
        } catch (err) {
            vscode.window.showErrorMessage($r('moduleBuildFailed', err));
        }
    }
}