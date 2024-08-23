import path from 'path';
import AdmZip from 'adm-zip';
import { hasFile } from '../utils';
import { executor } from '../executor';
import { globalData } from '../globalData';

class tools {
    unZip(file: string) {
        const zip = new AdmZip(file);
        const root = path.join(globalData.extensionPath, 'tools');
        zip.extractAllTo(root, true);
    }

    async config() {
        const root = path.join(globalData.extensionPath, 'tools');
        if (hasFile(root)) {
            switch (process.platform) {
                case 'win32': {
                    executor.runInTerminal(`setx path %path%;${root}`);
                    break;
                }
                case 'linux':
                case 'darwin': {
                    let type = await executor.exec('echo $SHELL');
                    let file = type.includes('/bin/bash') ? '~/.bash_profile' : '~/.zshrc';
                    executor.runInTerminal(`echo "export PATH=${root}/bin:$PATH" > ${file}`);
                    executor.runInTerminal(`source ${file}`);
                    break;
                }
            }
        }
    }
}
export default new tools();