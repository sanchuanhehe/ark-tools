import fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';
import { executor } from '../../executor';
import { globalData } from '../../globalData';
import { module } from '../../models/modules/module';
import projectLoader from '../../projects/projectLoader';
import { $r, fileToJson, hasFile, isEmpty } from '../../utils';

export class buildTools {
    private static enable = false;
    private static lastEntry: string = '';
    private static _hdcs: Map<number | string, string> = new Map();
    static getHdc(key: number | string) {
        return this._hdcs.get(key);
    }

    static check(): Promise<boolean> {
        return new Promise((resolve) => {
            const ohpmPath = vscode.workspace.getConfiguration("arktsTools").inspect<string>('ohpmPath')?.globalValue ?? '',
                hvigorPath = vscode.workspace.getConfiguration("arktsTools").inspect<string>('hvigorPath')?.globalValue ?? '';
            for (let module of projectLoader.globalProfile?.app.products ?? []) {
                if (typeof module.compileSdkVersion === 'number') {
                    const ohosHdc = path.join(globalData.ohosSdkPath, `${module.compileSdkVersion}`, 'toolchains', process.platform === 'win32' ? 'hdc.exe' : 'hdc');
                    if (hasFile(ohosHdc)) {
                        this._hdcs.set(module.compileSdkVersion, ohosHdc);
                    }
                } else {
                    const sdk = globalData.hosSdkList.get(module.compileSdkVersion);
                    if (sdk) {
                        const hosHdc = path.join(sdk, `${module.compileSdkVersion}`, 'openharmony', 'toolchains', process.platform === 'win32' ? 'hdc.exe' : 'hdc');
                        if (hasFile(hosHdc)) {
                            this._hdcs.set(module.compileSdkVersion, hosHdc);
                        }
                    }
                }
            }
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
                executor.runInTerminal(`cd \"${modulePath.fsPath}\"`);
                executor.runInTerminal('ohpm install');
            }
            const npmrc = path.join(process.platform === 'win32' ? '' : '~/.npmrc');
            if (!hasFile(npmrc)) {
                if (process.platform !== 'win32') {
                    executor.runInTerminal(`echo "registry=https://repo.huaweicloud.com/repository/npm/\n@ohos:registry=https://repo.harmonyos.com/npm/" > ${npmrc}`);
                }
            }
        } else {
            vscode.window.showErrorMessage($r('buildInitFailed'));
        }
    }

    static build(entry: string, mode: string) {
        executor.runInTerminal(`cd \"${projectLoader.projectPath.fsPath}\"`);
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