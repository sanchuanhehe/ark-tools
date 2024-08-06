
import path from 'path';
import * as vscode from 'vscode';

export class projectLoader {
    private readonly projectPath: string;
    constructor(projectPath: string) {
        this.projectPath = projectPath;
    }

    async load(): Promise<boolean> {
        try {
            let profile = path.join(this.projectPath, 'build-profile.json5');
            let stat = await vscode.workspace.fs.stat(vscode.Uri.parse(profile));

            return Promise.resolve(true);
        } catch (err) {
            vscode.window.showErrorMessage(`Create Project Failed, ${err}`);
            return Promise.reject(err);
        }
    }

    async createModule() {

    }
}