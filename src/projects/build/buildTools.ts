import fs from 'fs';
import * as vscode from 'vscode';
import { executor } from '../../executor';
import { module } from '../../models/modules/module';
import { $r, fileToJson, isEmpty } from '../../utils';
import projectLoader from '../../projects/projectLoader';

export class buildTools {
    private static enable = false;
    private static lastEntry: string = '';

    static check(): Promise<boolean> {
        return new Promise((resolve) => {
            const ohpmPath = vscode.workspace.getConfiguration("arktsTools.ohpmPath").inspect<string>('ohpmPath')?.globalValue ?? '',
                hvigorPath = vscode.workspace.getConfiguration("arktsTools.hvigorPath").inspect<string>('hvigorPath')?.globalValue ?? '';
            if (ohpmPath.trim() === '' || hvigorPath.trim() === '') {
                vscode.window.showErrorMessage($r('buildInitFailed'));
                resolve(false);
            } else {
                try {
                    fs.accessSync(ohpmPath);
                    fs.accessSync(hvigorPath);
                    this.enable = true;
                    resolve(true);
                } catch (err) {
                    vscode.window.showErrorMessage($r('buildInitFailed', err));
                    resolve(false);
                }
            }
        });
    }

    static init() {
        if (this.enable) {
            for (const i of projectLoader.globalProfile?.modules ?? []) {
                const modulePath = vscode.Uri.joinPath(projectLoader.projectPath, i.srcPath);
                executor.runInTerminal(`cd \"${modulePath}\"`);
                executor.runInTerminal('ohpm install');
            }
        } else {
            vscode.window.showErrorMessage($r('buildInitFailed'));
        }
    }

    static build(entry: string, mode: string) {
        executor.runInTerminal(`cd \"${projectLoader.projectPath}\"`);
        executor.runInTerminal('hvigorw clean --no-daemon');
        executor.runInTerminal(`hvigorw assembleHap --mode module -p product=${entry} -p debuggable=false -p buildMode=${mode} --no-daemon`);
        this.lastEntry = entry;
    }

    static async buildModule(fileUri: vscode.Uri, path: string) {
        const profile: module = await fileToJson(fileUri),
            m = projectLoader.getProjectModule(profile.module.name);
        executor.runInTerminal(`cd \"${path}\"`);
        executor.runInTerminal('hvigorw clean --no-daemon');
        const entry = profile.module.name,
            targetName = m?.moduleProfile?.targets[0] ?? '';
        if (profile.module.type === 'har') {
            executor.runInTerminal(`hvigorw assembleHar --mode module -p module=${entry}@${targetName} -p product=${entry} --no-daemon`);
        } else if (profile.module.type === 'shared') {
            executor.runInTerminal(`hvigorw assembleHsp --mode module -p module=${entry}@${targetName} -p product=${entry} --no-daemon`);
        }
    }

    static install(start: boolean = false) {
        if (!isEmpty(this.lastEntry)) {
            const scope = projectLoader.appScope,
                m = projectLoader.getProjectModule(this.lastEntry);
            executor.runInTerminal(`hdc file send "${m?.modulePath?.fsPath}/build/default/outputs/default/entry-default-signed.hap" "data/local/tmp/entry-default-signed.hap"`);
            executor.runInTerminal('hdc shell bm install -p "data/local/tmp/entry-default-signed.hap"');
            executor.runInTerminal('hdc shell rm -rf "data/local/tmp/entry-default-signed.hap"');
            if (start) {
                executor.runInTerminal(`hdc shell aa start -a ${m?.detail?.mainElement} -b ${scope?.app.bundleName} -m entry`);
            }
        } else {
            vscode.window.showErrorMessage($r('installFailedError'));
        }
    }
}