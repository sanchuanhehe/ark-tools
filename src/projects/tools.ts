import path from 'path';
import fs from 'fs-extra';
import * as vscode from 'vscode';
import { $r, hasFile } from '../utils';
import { executor } from '../executor';
import StreamZip from 'node-stream-zip';

class tools {
    private zip: StreamZip.StreamZipAsync | undefined;
    async unZip(file: string, root: string, callback: Function) {
        try {
            const temp = path.join(root, 'ark_temp'),
                target = path.join(root, 'tools'),
                index = file.lastIndexOf('/'),
                name = file.substring(index + 1, file.lastIndexOf('.')).toLowerCase();
            this.zip = new StreamZip.async({ file: file });
            this.zip.on('entry', (entry) => callback(entry.name));
            await this.zip.extract(null, temp);
            await this.zip.close();
            const dirs = await vscode.workspace.fs.readDirectory(vscode.Uri.parse(temp)),
                dir = dirs.filter((o) => o[0].toLowerCase().indexOf(name) !== -1
                    && o[1] === vscode.FileType.Directory)?.[0];
            if (dir) {
                await fs.move(path.join(temp, dir[0]), target, { overwrite: true });
                executor.exec(process.platform === 'win32' ? '' : `rm -rf "${temp}"`);
                return target;
            }
        } catch (error) {
            vscode.window.showErrorMessage($r('unzipToolsFailed', error));
        } finally {
            this.zip = undefined;
        }
        return undefined;
    }

    async abort() {
        if (this.zip) {
            await this.zip.close();
        }
    }

    async config(toolsPath: string) {
        if (hasFile(toolsPath)) {
            switch (process.platform) {
                case 'win32': {
                    executor.runInTerminal(`setx path %path%;${toolsPath}`);
                    break;
                }
                case 'linux':
                case 'darwin': {
                    const type = await executor.exec('echo $SHELL'),
                        file = type.includes('/bin/bash') ? '~/.bash_profile' : '~/.zshrc';
                    executor.runInTerminal(`echo "export PATH=${toolsPath}/bin:$PATH" > ${file}`);
                    executor.runInTerminal(`source ${file}`);
                    break;
                }
            }
        }
    }
}
export default new tools();