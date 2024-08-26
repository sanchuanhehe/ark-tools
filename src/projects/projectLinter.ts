import * as vscode from 'vscode';
import projectLoader from './projectLoader';
import { resNode } from '../models/resNode';
import { fileToJsonSync, toObject } from '../utils';
import codelinterTools from './build/codelinterTools';

type changeType = 'create' | 'rename' | 'remove';
export class projectLinter {
    private disposables: vscode.Disposable[] = [];

    register() {
        const codelinter = vscode.workspace.getConfiguration("arktsTools"),
            reloadChange = codelinter.inspect<boolean>('codelinterReloadChange')?.globalValue ?? false,
            checkAfterSave = codelinter.inspect<boolean>('codelinterCheckAfterSave')?.globalValue ?? false;
        this.dispose();
        if (reloadChange) {
            this.deleteFiles();
            this.createFiles();
            this.renameFiles();
        }
        if (checkAfterSave) {
            this.checkAfterSave();
        }
    }

    dispose() {
        while (this.disposables.length) {
            const disposable = this.disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }

    private renameFiles() {
        vscode.workspace.onDidRenameFiles(async (e) => {
            for (const file of e.files) {
                if (file.newUri.fsPath.includes('/resources/')) {
                    this.resourceFile('rename', file.oldUri.fsPath, file.newUri.fsPath);
                }
                await this.moduleFolder('rename', file.oldUri.fsPath, file.newUri.fsPath);
            }
        }, null, this.disposables);
    }

    private createFiles() {
        vscode.workspace.onDidCreateFiles(async (e) => {
            for (const file of e.files) {
                if (file.fsPath.includes('/resources/')) {
                    this.resourceFile('create', file.fsPath);
                }
            }
        }, null, this.disposables);
    }

    private deleteFiles() {
        vscode.workspace.onDidDeleteFiles(async (e) => {
            for (const file of e.files) {
                if (file.fsPath.includes('/resources/')) {
                    this.resourceFile('remove', file.fsPath);
                }
                await this.moduleFolder('remove', file.fsPath);
            }
        }, null, this.disposables);
    }

    private async moduleFolder(type: changeType, from: string, to?: string) {
        const index = from.lastIndexOf('/'), name = from.substring(index);
        switch (type) {
            case 'rename': {
                const moduleIndex = projectLoader.globalProfile?.modules.findIndex(i => i.srcPath.endsWith(name));
                if (moduleIndex && moduleIndex !== -1) {
                    const module = projectLoader.globalProfile?.modules[moduleIndex];
                    if (module) {
                        module.srcPath = `.\\${name}`;
                        projectLoader.updateGlobalProfile();
                    }
                }
                break;
            }
            case 'remove': {
                const moduleIndex = projectLoader.globalProfile?.modules.findIndex(i => i.srcPath.endsWith(name));
                if (moduleIndex && moduleIndex !== -1) {
                    projectLoader.globalProfile?.modules.splice(moduleIndex);
                    projectLoader.updateGlobalProfile();
                }
                break;
            }
        }
    }

    private resourceFile(type: changeType, from: string, to?: string) {
        const modulePath = projectLoader.modulePaths.filter(x => x.startsWith(from))?.[0];
        if (modulePath) {
            const index = modulePath.lastIndexOf('/'), name = modulePath.substring(index),
                projectModule = projectLoader.getProjectModule(name);
            if (projectModule) {
                if (/^[^/]+\/resources\/[^/]+\/media\/[^/]+$/.test(from) &&
                    (from.endsWith('png') || from.endsWith('jpg') || from.endsWith('jpeg'))) {
                    const index = from.lastIndexOf('.'), name = from.substring(0, index);
                    switch (type) {
                        case 'create': {
                            projectModule.medias.push(name);
                            break;
                        }
                        case 'rename': {
                            if (to) {
                                const toIdx = to.lastIndexOf('.'), toName = to.substring(0, toIdx),
                                    newIndex = projectModule.medias.indexOf(name);
                                projectModule.medias.splice(newIndex);
                                projectModule.medias.fill(toName, newIndex);
                            }
                            break;
                        }
                        case 'remove': {
                            const index = projectModule.medias.indexOf(name);
                            if (index !== -1) {
                                projectModule.medias.splice(index);
                            }
                            break;
                        }
                    }
                }
                if (/^[^/]+\/resources\/[^/]+\/element\/[^/]+$/.test(from)) {
                    switch (type) {
                        case 'create': {
                            if (from.endsWith('color.json')) {
                                const content = fileToJsonSync(from);
                                const arr: resNode[] = content.color;
                                projectModule.colors = arr;
                            } else if (from.startsWith('string.json')) {
                                const content = fileToJsonSync(from);
                                const arr: resNode[] = content.string;
                                projectModule.strings = arr;
                            }
                            break;
                        }
                        case 'remove': {
                            if (from.endsWith('color.json')) {
                                projectModule.colors = [];
                            } else if (from.startsWith('string.json')) {
                                projectModule.strings = [];
                            }
                            break;
                        }
                    }
                }
            }
        }
    }

    private checkAfterSave() {
        vscode.workspace.onDidSaveTextDocument((e) => {
            if (e.fileName.endsWith('.ts') || e.fileName.endsWith('.ets')) {
                this.execute(e.uri.fsPath);
            }
            if (e.fileName.includes('/resources/')) {
                const modulePath = projectLoader.modulePaths.filter(x => x.startsWith(e.fileName))?.[0];
                if (modulePath) {
                    const index = modulePath.lastIndexOf('/'), name = modulePath.substring(index),
                        projectModule = projectLoader.getProjectModule(name);
                    if (projectModule) {
                        if (e.fileName.endsWith('color.json')) {
                            const content = fileToJsonSync(e.fileName);
                            const arr: resNode[] = content.color;
                            projectModule.colors = arr;
                        } else if (e.fileName.startsWith('string.json')) {
                            const content = fileToJsonSync(e.fileName);
                            const arr: resNode[] = content.string;
                            projectModule.strings = arr;
                        }
                    }
                }
            }
        }, null, this.disposables);
    }

    async execute(path: string) {
        const json = await codelinterTools.exec(path);
        if (json) {
            const obj = toObject(json);
            if (obj) {

            }
        }
    }
}