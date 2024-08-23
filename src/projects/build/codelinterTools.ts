import fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';
import { executor } from '../../executor';
import projectLoader from '../projectLoader';
import { $r, fileToJson, hasFile } from '../../utils';

class codelinterTools {
    private folder = './';
    private enable = false;
    check(): Promise<boolean> {
        return new Promise((resolve) => {
            try {
                let codelinter = vscode.workspace.getConfiguration("arktsTools").inspect<string>('codelinterPath')?.globalValue ?? '';
                if (codelinter.trim() !== '') {
                    fs.accessSync(codelinter);
                    this.enable = true;
                    this.init(projectLoader.projectPath.fsPath);
                    resolve(true);
                }
            } catch (err) {
                vscode.window.showErrorMessage($r('ccInitFailed', err));
            }
            resolve(false);
        });
    }

    async exec(target: string) {
        if (this.enable) {
            let index = target.lastIndexOf('/'),
                name = `${target.substring(index)}-${new Date().getTime()}.json`,
                out = path.join(this.folder, name);
            await executor.exec(`codelinter "${target}" -f json -o "${out}"`);
            let data = await fileToJson(out);
            if (data) {

            }
        }
    }

    private init(projectPath: string) {
        this.folder = path.join(projectPath, 'codelinter');
        if (!hasFile(this.folder)) {
            fs.mkdirSync(this.folder);
        }
    }
}
export default new codelinterTools();