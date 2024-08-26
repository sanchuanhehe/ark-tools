import * as vscode from 'vscode';
import { globalData } from '../globalData';
import { resNode } from '../models/resNode';
import { projectLinter } from './projectLinter';
import { ohPackage } from '../models/ohPackage';
import { module } from '../models/modules/module';
import { projectBuilder } from './projectBuilder';
import codelinterTools from './build/codelinterTools';
import { appScope } from '../models/appScope/appScope';
import { context } from '../intellisenses/utils/context';
import { moduleProfile } from '../models/profiles/moduleProfile';
import { globalProfile } from '../models/profiles/globalProfile';
import { moduleResource } from '../models/modules/moduleResource';
import { $r, fileToJson, hasFile, isEmpty, objToBuffer } from '../utils';

class projectLoader {
    private _appName = '';
    private readonly linter;
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
        this.linter = new projectLinter();
    }

    tryGetAuthor() {
        let author = '';
        for (const value of this._modules.values()) {
            const ret = value.package?.author;
            if (ret && !isEmpty(ret)) {
                author = ret;
            }
        }
        return author;
    }

    executeCodelinter(path: string | vscode.Uri) {
        if (typeof path !== 'string') {
            path = path.fsPath;
        }
        this.linter.execute(path);
    }

    onChangeInit() {
        this.linter.register();
    }

    getProjectModule(ctx: context | string) {
        if (typeof ctx === 'string') {
            return this._modules.get(ctx);
        } else {
            const name = this._ctxs.get(ctx);
            if (name) {
                return this._modules.get(name);
            } else {
                const filePath = ctx.document.uri.fsPath,
                    index = filePath.includes('src') ? filePath.lastIndexOf('src') :
                        filePath.lastIndexOf(process.platform === 'win32' ? '\\' : '/');
                let path = filePath.substring(0, index);
                if (path.endsWith('/')) {
                    path = path.substring(0, path.length - 1);
                }
                const module = this._profile?.modules.find((i) => path.endsWith(i.srcPath.replace('./', '')));
                return this._modules.get(module?.name ?? '');
            }
        }
    }

    async build(fileUri: vscode.Uri) {
        if (this.builder) {
            await this.builder.check();
            await this.builder.build(fileUri);
        } else {
            vscode.window.showErrorMessage($r('buildLater'));
            await this.tryLoad();
        }
    }

    async tryLoad() {
        const files = await vscode.workspace.findFiles('build-profile.json5', globalData.projectPath.fsPath, 1);
        if (files.length > 0) {
            await this.load(globalData.projectPath);
        }
    }

    async load(projectPath: vscode.Uri): Promise<boolean> {
        try {
            this._path = projectPath;
            const profile = vscode.Uri.joinPath(this.projectPath, 'build-profile.json5');
            this._profile = await fileToJson(profile);
            if (typeof this.globalProfile?.modules !== 'undefined') {
                this.loadAppScope();
                for (const module of this.globalProfile.modules) {
                    await this.loadModule(module.srcPath);
                }
                this.builder = new projectBuilder(projectPath);
                this.builder.check();
                if (await codelinterTools.check()) {
                    this.linter.register();
                }
            } else {
                vscode.window.showErrorMessage($r('emptyModules'));
            }
            return Promise.resolve(true);
        } catch (err) {
            vscode.window.showErrorMessage($r('pjLoadFailed', err));
            return Promise.reject(err);
        }
    }

    async updateGlobalProfile() {
        try {
            if (this.globalProfile) {
                const data = objToBuffer(this.globalProfile);
                const profileUri = vscode.Uri.joinPath(this.projectPath, 'build-profile.json5');
                await vscode.workspace.fs.writeFile(profileUri, data);
            }
        } catch (err) {
            vscode.window.showErrorMessage($r('updateProfileFailed', err));
        }
    }

    private async loadAppScope() {
        const app = vscode.Uri.joinPath(this.projectPath, 'AppScope', 'app.json5');
        this._scope = await fileToJson(app);
        this._appName = this._scope?.app.label.trim() ?? '';
        if (this._appName.startsWith('$string:')) {
            const index = this._appName.indexOf(':');
            this._appName = this._appName.substring(index);
        }
        const module: moduleResource = {
            colors: [],
            medias: [],
            strings: [],
            name: 'appScope'
        };
        const medias = vscode.Uri.joinPath(this.projectPath, 'AppScope', 'resources', 'base', 'media');
        if (hasFile(medias)) {
            for (const file of await vscode.workspace.fs.readDirectory(medias)) {
                if ((file[0].endsWith('png') || file[0].endsWith('jpg') || file[0].endsWith('jpeg')) && file[1] === vscode.FileType.File) {
                    const idx = file[0].lastIndexOf('.');
                    module.medias.push(file[0].substring(0, idx));
                }
            }
        }
        const resources = vscode.Uri.joinPath(this.projectPath, 'AppScope', 'resources', 'base', 'element');
        if (hasFile(resources)) {
            for (const file of await vscode.workspace.fs.readDirectory(resources)) {
                if (file[0].endsWith('json') && file[1] === vscode.FileType.File) {
                    const content = await fileToJson(vscode.Uri.joinPath(resources, file[0]));
                    if (content) {
                        if (file[0].startsWith('color')) {
                            const arr: resNode[] = content.color;
                            module.colors = arr;
                        } else if (file[0].startsWith('string')) {
                            const arr: resNode[] = content.string;
                            module.strings = arr;
                        }
                    }
                }
            }
        }
        if (module.detail?.type === 'entry') {
            this._entries.push(module.detail.name);
        }
        this._modules?.set('appScope', module);
    }

    async loadModule(moduleName: string) {
        const pack = vscode.Uri.joinPath(this.projectPath, moduleName, 'oh-package.json5');
        const profile = vscode.Uri.joinPath(this.projectPath, moduleName, 'build-profile.json5');
        const module = vscode.Uri.joinPath(this.projectPath, moduleName, 'src', 'main', 'module.json5');
        const m: module = await fileToJson(module), mp: moduleProfile = await fileToJson(profile),
            pkg: ohPackage = await fileToJson(pack),
            name = m.module.name;
        const resource: moduleResource = {
            colors: [],
            medias: [],
            strings: [],
            package: pkg,
            detail: m.module,
            moduleProfile: mp,
            name: m.module.name,
            modulePath: vscode.Uri.joinPath(this.projectPath, moduleName)
        };
        this._modules?.set(name, resource);
        this.loadMedias(name, moduleName);
        this.loadResources(name, moduleName);
    }

    private async loadMedias(name: string, modulePath: string) {
        const module = this._modules?.get(name);
        if (module) {
            const medias = vscode.Uri.joinPath(this.projectPath, modulePath, 'src', 'main', 'resources', 'base', 'media');
            if (hasFile(medias)) {
                const files = await vscode.workspace.fs.readDirectory(medias);
                for (const file of files) {
                    if ((file[0].endsWith('png') || file[0].endsWith('jpg') || file[0].endsWith('jpeg')) && file[1] === vscode.FileType.File) {
                        const idx = file[0].lastIndexOf('.');
                        module.medias.push(file[0].substring(0, idx));
                    }
                }
            }
        }
    }

    private async loadResources(name: string, modulePath: string) {
        const module = this._modules?.get(name);
        if (module) {
            const resources = vscode.Uri.joinPath(this.projectPath, modulePath, 'src', 'main', 'resources', 'base', 'element');
            if (hasFile(resources)) {
                const files = await vscode.workspace.fs.readDirectory(resources);
                for (const file of files) {
                    if (file[0].endsWith('json') && file[1] === vscode.FileType.File) {
                        const content = await fileToJson(vscode.Uri.joinPath(resources, file[0]));
                        if (content) {
                            if (file[0].startsWith('color')) {
                                const arr: resNode[] = content.color;
                                module.colors = arr;
                            } else if (file[0].startsWith('string')) {
                                const arr: resNode[] = content.string;
                                module.strings = arr;
                            }
                        }
                    }
                }
            }
        }
    }
}
export default new projectLoader();