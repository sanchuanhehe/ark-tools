import * as vscode from 'vscode';
import { globalData } from '../globalData';
import { resNode } from '../models/resNode';
import { fileToJson, isEmpty } from '../utils';
import { ohPackage } from '../models/ohPackage';
import { module } from '../models/modules/module';
import { projectBuilder } from './projectBuilder';
import { appScope } from '../models/appScope/appScope';
import { context } from '../intellisenses/utils/context';
import { moduleProfile } from '../models/profiles/moduleProfile';
import { globalProfile } from '../models/profiles/globalProfile';
import { moduleResource } from '../models/modules/moduleResource';

class projectLoader {
    private _appName = '';
    private _entries: string[] = [];
    private _scope: appScope | undefined;
    private builder: projectBuilder | undefined;
    private _profile: globalProfile | undefined;
    private readonly _ctxs: Map<context, string>;
    private _path: vscode.Uri = vscode.Uri.parse('./');
    private readonly _modules: Map<string, moduleResource>;

    get globalProfile() {
        return this._profile;
    }

    get appName() {
        return this._appName;
    }

    get appScope() {
        return this._scope;
    }

    get projectPath() {
        return this._path;
    }

    get moduleEntries() {
        return this._entries;
    }

    constructor() {
        this._ctxs = new Map();
        this._modules = new Map();
    }

    tryGetAuthor() {
        let author = '';
        for (let value of this._modules.values()) {
            let ret = value.package?.author;
            if (ret && !isEmpty(ret)) {
                author = ret;
            }
        }
        return author;
    }

    getProjectModule(ctx: context | string) {
        if (typeof ctx === 'string') {
            return this._modules.get(ctx);
        } else {
            let name = this._ctxs.get(ctx);
            if (name) {
                return this._modules.get(name);
            } else {
                let filePath = ctx.document.uri.fsPath,
                    index = filePath.includes('src') ? filePath.lastIndexOf('src') :
                        filePath.lastIndexOf(process.platform === 'win32' ? '\\' : '/'),
                    path = filePath.substring(0, index);
                if (path.endsWith('/')) {
                    path = path.substring(0, path.length - 1);
                }
                let module = this._profile?.modules.find((i) => path.endsWith(i.srcPath.replace('./', '')));
                return this._modules.get(module?.name ?? '');
            }
        }
    }

    async build(fileUri: vscode.Uri) {
        if (this.builder) {
            await this.builder.check();
            await this.builder.build(fileUri);
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

    onChangeInit() {
        vscode.workspace.onDidDeleteFiles((e) => {
            for (let file of e.files) {
                if (file.fsPath.includes('resources')) {

                }
            }
        });
        vscode.workspace.onDidCreateFiles((e) => {
            for (let file of e.files) {
                if (file.fsPath.includes('resources')) {

                }
            }
        });
        vscode.workspace.onDidRenameFiles((e) => {
            for (let file of e.files) {
                if (file.newUri.fsPath.includes('resources')) {

                }
            }
        });
    }

    async load(projectPath: vscode.Uri): Promise<boolean> {
        try {
            this._path = projectPath;
            let profile = vscode.Uri.joinPath(this.projectPath, 'build-profile.json5');
            this._profile = await fileToJson(profile);
            if (typeof this.globalProfile?.modules !== 'undefined') {
                this.loadAppScope();
                for (let module of this.globalProfile.modules) {
                    let name = await this.loadModule(module.srcPath);
                    this.loadMedias(name, module.srcPath);
                    this.loadResources(name, module.srcPath);
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
        let app = vscode.Uri.joinPath(this.projectPath, 'AppScope', 'app.json5');
        this._scope = await fileToJson(app);
        this._appName = this._scope?.app.label.trim() ?? '';
        if (this._appName.startsWith('$string:')) {
            let index = this._appName.indexOf(':');
            this._appName = this._appName.substring(index);
        }
        let module: moduleResource = {
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
        if (module.detail?.type === 'entry') {
            this._entries.push(module.detail.name);
        }
        this._modules?.set('appScope', module);
    }

    async loadModule(modulePath: string) {
        let pack = vscode.Uri.joinPath(this.projectPath, modulePath, 'oh-package.json5');
        let profile = vscode.Uri.joinPath(this.projectPath, modulePath, 'build-profile.json5');
        let module = vscode.Uri.joinPath(this.projectPath, modulePath, 'src', 'main', 'module.json5');
        let m: module = await fileToJson(module), mp: moduleProfile = await fileToJson(profile),
            pkg: ohPackage = await fileToJson(pack);
        let resource: moduleResource = {
            colors: [],
            medias: [],
            strings: [],
            package: pkg,
            detail: m.module,
            moduleProfile: mp,
            name: m.module.name,
            modulePath: vscode.Uri.joinPath(this.projectPath, modulePath)
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
}
export default new projectLoader();