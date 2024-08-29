import * as vscode from 'vscode';
import { $r, hasFile } from '../utils';
import { executor } from '../executor';
import StreamZip from 'node-stream-zip';

class tools {
    private zip: StreamZip.StreamZipAsync | undefined;
    async unZip(file: string, root: string, callback: Function) {
        try {
            this.zip = new StreamZip.async({ file: file });
            const index = file.lastIndexOf('/'), name = file.substring(index + 1);
            this.zip.on('entry', (entry) => callback(entry.name));
            await this.zip.extract(`${name.replace('.zip', '')}/`, root);
            await this.zip.close();
        } catch (error) {
            vscode.window.showErrorMessage($r('unzipToolsFailed', error));
        } finally {
            this.zip = undefined;
        }
    }

    async abort() {
        if (this.zip) {
            await this.zip.close();
        }
    }

    async config(toolsPath:string) {
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