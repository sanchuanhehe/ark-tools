
import path from 'path';
import * as vscode from 'vscode';
import { fileToJson } from '../utils';
import { module } from '../models/modules/module';
import { globalProfile } from '../models/profiles/globalProfile';

class projectLoader {
    private projectPath: string = '';
    private _profile: globalProfile | undefined;
    private readonly projectModules: Map<string, module> | undefined;

    get globalProfile() {
        return this._profile;
    }
    constructor() {
        this.projectModules = new Map();
    }

    async load(projectPath: string): Promise<boolean> {
        try {
            this.projectPath = projectPath;
            let profile = path.join(this.projectPath, 'build-profile.json5');
            this._profile = await fileToJson(profile);
            if (typeof this.globalProfile?.modules !== 'undefined') {
                for (let module of this.globalProfile.modules) {
                    this.loadModules(module.srcPath);
                    this.loadResources(module.srcPath);
                    this.loadPathIntellisenses(module.srcPath);
                }

            } else {
                vscode.window.showErrorMessage(`Load Project Done, but it sense none modules? `);
            }
            return Promise.resolve(true);
        } catch (err) {
            vscode.window.showErrorMessage(`Load Project Failed, ${err}`);
            return Promise.reject(err);
        }
    }

    private async loadModules(modulePath: string) {
        let module = path.join(this.projectPath, modulePath, 'src', 'main', 'module.json5');
        let profile: module = await fileToJson(module);
        this.projectModules?.set(profile.module.name, profile);
    }

    private async loadResources(modulePath: string) {
        let resources = path.join(this.projectPath, modulePath, 'src', 'main', 'resources', 'base', 'element');
        let files = await vscode.workspace.fs.readDirectory(vscode.Uri.parse(resources));
        for (let file of files) {
            if (file[0].endsWith('json') && file[1] === vscode.FileType.File) {
                let filePath = file[0].startsWith(this.projectPath) ? file[0] : path.join(resources, file[0]);
                let stream = await vscode.workspace.fs.readFile(vscode.Uri.parse(filePath));


            }
        }
    }

    private async loadPathIntellisenses(modulePath: string) {
        let ets = path.join(this.projectPath, modulePath, 'src', 'main', 'ets');

    }
}
export default new projectLoader();