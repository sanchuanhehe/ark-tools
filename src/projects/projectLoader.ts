import * as vscode from 'vscode';
import { fileToJson } from '../utils';
import { globalData } from '../globalData';
import { resNode } from '../models/resNode';
import { module } from '../models/modules/module';
import { projectBuilder } from './projectBuilder';
import { context } from '../intellisenses/utils/context';
import { globalProfile } from '../models/profiles/globalProfile';
import { moduleResource } from '../models/modules/moduleResource';

class projectLoader {
    private builder: projectBuilder | undefined;
    private _profile: globalProfile | undefined;
    private readonly _ctxs: Map<context, string>;
    private readonly _modules: Map<string, moduleResource>;
    private projectPath: vscode.Uri = vscode.Uri.parse('./');

    get globalProfile() {
        return this._profile;
    }

    constructor() {
        this._ctxs = new Map();
        this._modules = new Map();
    }

    getProjectModule(ctx: context | string) {
        if (typeof ctx === 'string') {
            return this._modules.get(ctx);
        } else {
            let name = this._ctxs.get(ctx);
            if (name) {
                return this._modules.get(name);
            } else {
                let index = ctx.document.uri.fsPath.lastIndexOf(process.platform === 'win32' ? '\\' : '/');
                let path = ctx.document.uri.fsPath.substring(0, index);
                let module = this._profile?.modules.find((i) => path.endsWith(i.srcPath.replace('./', '')));
                return this._modules.get(module?.name ?? '');
            }
        }
    }

    async build() {
        if (this.builder) {
            await this.builder.check();
            await this.builder.build();
        } else {
            vscode.window.showErrorMessage(`Try Loading Project, Please build it later... `);
            await this.tryLoad();
        }
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
                this.loadAppScope();
                for (let module of this.globalProfile.modules) {
                    let name = await this.loadModule(module.srcPath);
                    this.loadMedias(name, module.srcPath);
                    this.loadResources(name, module.srcPath);
                    this.loadPathIntellisenses(name, module.srcPath);
                }
                this.builder = new projectBuilder(projectPath);
            } else {
                vscode.window.showErrorMessage(`Load Project Done, but it sense none modules? `);
            }
            return Promise.resolve(true);
        } catch (err) {
            vscode.window.showErrorMessage(`Load Project Failed, ${err}`);
            return Promise.reject(err);
        }
    }

    private async loadAppScope() {
        let module: moduleResource = {
            files: [],
            colors: [],
            medias: [],
            strings: [],
            name: 'appScope'
        };
        let medias = vscode.Uri.joinPath(this.projectPath, 'AppScope', 'resources', 'base', 'media');
        for (let file of await vscode.workspace.fs.readDirectory(medias)) {
            if ((file[0].endsWith('png') || file[0].endsWith('jpg') || file[0].endsWith('jpeg')) && file[1] === vscode.FileType.File) {
                let idx = file[0].lastIndexOf('.');
                module.medias.push(file[0].substring(0, idx));
            }
        }
        let resources = vscode.Uri.joinPath(this.projectPath, 'AppScope', 'resources', 'base', 'element');
        for (let file of await vscode.workspace.fs.readDirectory(resources)) {
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
        this._modules?.set('appScope', module);
    }

    async loadModule(modulePath: string) {
        let module = vscode.Uri.joinPath(this.projectPath, modulePath, 'src', 'main', 'module.json5');
        let profile: module = await fileToJson(module);
        let resource: moduleResource = {
            files: [],
            colors: [],
            medias: [],
            strings: [],
            detail: profile.module,
            name: profile.module.name
        };
        this._modules?.set(resource.name, resource);
        return resource.name;
    }

    private async loadMedias(name: string, modulePath: string) {
        let module = this._modules?.get(name);
        if (module) {
            let resources = vscode.Uri.joinPath(this.projectPath, modulePath, 'src', 'main', 'resources', 'base', 'media');
            let files = await vscode.workspace.fs.readDirectory(resources);
            for (let file of files) {
                if ((file[0].endsWith('png') || file[0].endsWith('jpg') || file[0].endsWith('jpeg')) && file[1] === vscode.FileType.File) {
                    let idx = file[0].lastIndexOf('.');
                    module.medias.push(file[0].substring(0, idx));
                }
            }
        }
    }

    private async loadResources(name: string, modulePath: string) {
        let module = this._modules?.get(name);
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
        let module = this._modules?.get(name);
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