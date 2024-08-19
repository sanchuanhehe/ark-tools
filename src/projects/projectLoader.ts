import * as vscode from 'vscode';
import { fileToJson } from '../utils';
import { globalData } from '../globalData';
import { resNode } from '../models/resNode';
import { module } from '../models/modules/module';
import { globalProfile } from '../models/profiles/globalProfile';
import { moduleResource } from '../models/modules/moduleResource';

class projectLoader {
    private _profile: globalProfile | undefined;
    private projectPath: vscode.Uri = vscode.Uri.parse('./');
    private readonly projectModules: Map<string, moduleResource> | undefined;

    get globalProfile() {
        return this._profile;
    }

    constructor() {
        this.projectModules = new Map();
    }

    async tryLoad() {
        let files = await vscode.workspace.findFiles('build-profile.json5', globalData.projectPath.fsPath, 1);
        if (files.length > 0) {
            await this.load(globalData.projectPath);
        }
    }

    async load(projectPath: vscode.Uri): Promise<boolean> {
        try {
            this.projectPath = projectPath;
            let profile = vscode.Uri.joinPath(this.projectPath, 'build-profile.json5');
            this._profile = await fileToJson(profile);
            if (typeof this.globalProfile?.modules !== 'undefined') {
                for (let module of this.globalProfile.modules) {
                    let name = await this.loadModule(module.srcPath);
                    this.loadResources(name, module.srcPath);
                    this.loadPathIntellisenses(name, module.srcPath);
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

    async loadModule(modulePath: string) {
        let module = vscode.Uri.joinPath(this.projectPath, modulePath, 'src', 'main', 'module.json5');
        let profile: module = await fileToJson(module);
        let resource: moduleResource = {
            files: [],
            colors: [],
            strings: [],
            detail: profile.module,
            name: profile.module.name
        };
        this.projectModules?.set(resource.name, resource);
        return resource.name;
    }

    private async loadResources(name: string, modulePath: string) {
        let module = this.projectModules?.get(name);
        if (module) {
            let resources = vscode.Uri.joinPath(this.projectPath, modulePath, 'src', 'main', 'resources', 'base', 'element');
            let files = await vscode.workspace.fs.readDirectory(resources);
            for (let file of files) {
                if (file[0].endsWith('json') && file[1] === vscode.FileType.File) {
                    let content = await fileToJson(vscode.Uri.joinPath(resources, file[0]));
                    if (content) {
                        if (file[0].startsWith('color')) {
                            let arr: resNode[] = content.color;
                            module.colors = arr;
                        } else if (file[0].startsWith('string')) {
                            let arr: resNode[] = content.string;
                            module.strings = arr;
                        }
                    }
                }
            }
        }
    }

    private async loadPathIntellisenses(name: string, modulePath: string) {
        let module = this.projectModules?.get(name);
        if (module) {
            let ets = vscode.Uri.joinPath(this.projectPath, modulePath, 'src', 'main', 'ets');
            let tsFiles = await vscode.workspace.findFiles("**/*.ts", ets.fsPath);
            let etsFiles = await vscode.workspace.findFiles("**/*.ets", ets.fsPath);
            if (tsFiles) {
                module.files.push(...tsFiles);
            }
            if (etsFiles) {
                module.files.push(...etsFiles);
            }
        }
    }
}
export default new projectLoader();