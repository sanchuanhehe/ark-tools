import { $r } from '../utils';
import * as vscode from 'vscode';
import projectLoader from './projectLoader';
import { buildTools } from "./build/buildTools";

export class projectBuilder {
    private readonly open;
    private hasInit = false;
    constructor() {
        this.open = require('opn');
    }

    async check() {
        const ret = await buildTools.check();
        if (!ret) {
            const result = await vscode.window.showInformationMessage($r('pjBuildFailed'), $r('open'), $r('cancel'));
            if (result === $r('open')) {
                this.open('https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/ide-commandline-get-0000001954334245-V5');
            }
        } else if (!this.hasInit) {
            this.hasInit = true;
            buildTools.init();
        }
    }

    async build(fileUri: vscode.Uri) {
        try {
            const entries = projectLoader.moduleEntries,
                keys = [...entries].map((e) => e[0]),
                paths = [...entries].map((e) => e[1]),
                index = fileUri.fsPath.lastIndexOf(process.platform === 'win32' ? '\\' : '/'),
                path = fileUri.fsPath.substring(0, index),
                mode = await vscode.window.showQuickPick(['debug', 'release']);
            if (paths.findIndex((o) => path.startsWith(o)) !== -1) {
                if (mode) {
                    if (entries.size === 1) {
                        buildTools.build(keys[0], mode);
                    } else {
                        const name = await vscode.window.showQuickPick(keys);
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