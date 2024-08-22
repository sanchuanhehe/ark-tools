import fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';
import { globalData } from '../globalData';
import projectLoader from './projectLoader';
import { ohPackage } from '../models/ohPackage';
import { module } from '../models/modules/module';
import { mainPages } from '../models/projects/mainPages';
import { moduleType } from '../models/modules/moduleDetail';
import { moduleProfile } from '../models/profiles/moduleProfile';
import { createDirectories, objToBuffer, textToBuffer } from '../utils';

class moduleCreator {
    async createModule(moduleName: string, appName: string, authorName: string, type: moduleType) {
        try {
            switch (type) {
                case 'entry':
                    await this.createEntryModule(moduleName, appName, authorName);
                    break;
                case 'har':
                    await this.createStaticModule(moduleName, authorName);
                    break;
                case 'shared':
                    await this.createSharedModule(moduleName, authorName);
                    break;
                case 'feature':
                    await this.createFeatureModule(moduleName, appName, authorName);
                    break;
            }
            let targets = projectLoader.globalProfile?.modules[0].targets ?? [];
            projectLoader.globalProfile?.modules.push({
                name: moduleName,
                srcPath: `./${moduleName}`,
                targets: targets
            });
            projectLoader.updateGlobalProfile();
        } catch (err) {
            vscode.window.showErrorMessage(`Failed to create module. ${err}`);
        }
    }

    private async createSharedModule(moduleName: string, authorName: string) {
        let module = path.join(globalData.projectPath.fsPath, moduleName), src = path.join(module, 'src'),
            main = path.join(src, 'main'), resources = path.join(main, 'resources'),
            ets = path.join(main, 'ets'), base = path.join(resources, 'base'),
            element = path.join(base, 'element'), components = path.join(ets, 'components'),
            profi = path.join(base, 'profile'), page = path.join(ets, 'pages');
        await createDirectories([module, src, main, resources, ets, base, element, components, profi, page]);
        //build-profile.json5
        let profile: moduleProfile = {
            buildOption: {},
            apiType: 'stageMode',
            targets: [{ name: "default" }]
        };
        let profileUri = vscode.Uri.parse(path.join(module, 'build-profile.json5'));
        await vscode.workspace.fs.writeFile(profileUri, objToBuffer(profile));
        //oh-package.json5
        let pkg: ohPackage = {
            name: moduleName,
            version: "1.0.0",
            description: 'Please describe the basic information.',
            main: 'Index.ets',
            author: authorName,
            license: 'Apache-2.0',
            packageType: "InterfaceHar",
            dependencies: {}
        };
        let packageUri = vscode.Uri.parse(path.join(module, 'oh-package.json5'));
        await vscode.workspace.fs.writeFile(packageUri, objToBuffer(pkg));
        //Index.ets
        let index = vscode.Uri.parse(path.join(module, 'Index.ets'));
        await vscode.workspace.fs.writeFile(index, new Uint8Array());
        //hvigorfile.ts
        let har = path.join(globalData.extensionPath, 'templates', 'project', 'hsp.txt');
        fs.copyFileSync(har, path.join(module, 'hvigorfile.ts'));
        //element
        let bs = path.join(element, 'string.json');
        await vscode.workspace.fs.writeFile(vscode.Uri.parse(bs), objToBuffer({
            string: [{
                name: "shared_desc",
                value: moduleName
            }]
        }));
        //module
        let moduleInfo: module = {
            module: {
                type: 'shared',
                name: moduleName,
                deliveryWithInstall: true,
                pages: "$profile:main_pages",
                deviceTypes: ['default', 'tablet'],
                description: "$string:shared_desc"
            }
        };
        let modulePath = vscode.Uri.parse(path.join(main, 'module.json5'));
        await vscode.workspace.fs.writeFile(modulePath, objToBuffer(moduleInfo));
        //profile
        let pages = path.join(profi, 'main_pages.json'), obj: mainPages = { src: ['pages/Index'] };
        await vscode.workspace.fs.writeFile(vscode.Uri.parse(pages), objToBuffer(obj));
        //pages
        fs.copyFileSync(path.join(globalData.extensionPath, 'templates', 'project', 'page.txt'), path.join(page, 'Index.ets'));
    }

    private async createStaticModule(moduleName: string, authorName: string) {
        let module = path.join(globalData.projectPath.fsPath, moduleName), src = path.join(module, 'src'),
            main = path.join(src, 'main'), resources = path.join(main, 'resources'),
            ets = path.join(main, 'ets'), base = path.join(resources, 'base'),
            element = path.join(base, 'element'), components = path.join(ets, 'components');
        await createDirectories([module, src, main, resources, ets, base, element, components]);
        //build-profile.json5
        let profile: moduleProfile = {
            apiType: 'stageMode',
            buildOption: {},
            targets: [{ name: "default" }]
        };
        let profileUri = vscode.Uri.parse(path.join(module, 'build-profile.json5'));
        await vscode.workspace.fs.writeFile(profileUri, objToBuffer(profile));
        //oh-package.json5
        let pkg: ohPackage = {
            name: moduleName,
            version: "1.0.0",
            description: 'Please describe the basic information.',
            main: 'Index.ets',
            author: authorName,
            license: 'Apache-2.0',
            dependencies: {}
        };
        let packageUri = vscode.Uri.parse(path.join(module, 'oh-package.json5'));
        await vscode.workspace.fs.writeFile(packageUri, objToBuffer(pkg));
        //Index.ets
        let index = vscode.Uri.parse(path.join(module, 'Index.ets'));
        await vscode.workspace.fs.writeFile(index, new Uint8Array());
        //hvigorfile.ts
        let har = path.join(globalData.extensionPath, 'templates', 'project', 'har.txt');
        fs.copyFileSync(har, path.join(module, 'hvigorfile.ts'));
        //element
        let bs = path.join(element, 'string.json');
        await vscode.workspace.fs.writeFile(vscode.Uri.parse(bs), objToBuffer({
            string: [
                {
                    name: "module_desc",
                    value: moduleName
                }]
        }));
        //module
        let moduleInfo: module = {
            module: {
                type: 'har',
                name: moduleName,
                description: "$string:module_desc",
                deviceTypes: ['default', 'tablet']
            }
        };
        let modulePath = vscode.Uri.parse(path.join(main, 'module.json5'));
        await vscode.workspace.fs.writeFile(modulePath, objToBuffer(moduleInfo));
    }

    private async createFeatureModule(moduleName: string, appName: string, authorName: string) {
        let module = path.join(globalData.projectPath.fsPath, moduleName), src = path.join(module, 'src'),
            main = path.join(src, 'main'), resources = path.join(main, 'resources'),
            ets = path.join(main, 'ets'), cpp = path.join(main, 'cpp'),
            base = path.join(resources, 'base'), profi = path.join(base, 'profile'),
            media = path.join(base, 'media'), element = path.join(base, 'element'),
            ability = path.join(ets, 'applicationability'), page = path.join(ets, 'pages'),
            types = path.join(cpp, 'types'), libapplication = path.join(cpp, 'libapplication');
        await createDirectories([module, src, main, resources, ets, cpp, base, profi, media, element, ability, page, types, libapplication]);
        //build-profile.json5
        let profile: moduleProfile = {
            apiType: 'stageMode',
            buildOption: {
                externalNativeOptions: {
                    path: "./src/main/cpp/CMakeLists.txt"
                }
            },
            buildOptionSet: {
                name: 'release',
                nativeLib: {
                    debugSymbol: {
                        strip: true,
                        exclude: []
                    }
                }
            },
            targets: [{ name: "default" },
            { name: "ohosTest" }]
        };
        let profileUri = vscode.Uri.parse(path.join(module, 'build-profile.json5'));
        await vscode.workspace.fs.writeFile(profileUri, objToBuffer(profile));
        //oh-package.json5
        let pkg: ohPackage = {
            name: moduleName,
            version: "1.0.0",
            description: 'Please describe the basic information.',
            main: '',
            author: authorName,
            license: '',
            dependencies: {
                "libapplication.so": "file:./src/main/cpp/types/libapplication"
            }
        };
        let packageUri = vscode.Uri.parse(path.join(module, 'oh-package.json5'));
        await vscode.workspace.fs.writeFile(packageUri, objToBuffer(pkg));
        //hvigorfile.ts
        let har = path.join(globalData.extensionPath, 'templates', 'project', 'hap.txt');
        fs.copyFileSync(har, path.join(module, 'hvigorfile.ts'));
        //media
        let icon = path.join(globalData.extensionPath, 'templates', 'media', 'icon.png'),
            startIcon = path.join(globalData.extensionPath, 'templates', 'media', 'startIcon.png');
        fs.copyFileSync(icon, path.join(media, 'icon.png'));
        fs.copyFileSync(startIcon, path.join(media, 'startIcon.png'));
        //element
        let bs = path.join(element, 'string.json'), bc = path.join(element, 'color.json');
        await vscode.workspace.fs.writeFile(vscode.Uri.parse(bs), objToBuffer({
            string: [
                {
                    name: "module_desc",
                    value: moduleName
                },
                {
                    name: "EntryAbility_desc",
                    value: appName
                },
                {
                    name: "EntryAbility_label",
                    value: appName
                }]
        }));
        await vscode.workspace.fs.writeFile(vscode.Uri.parse(bc), objToBuffer({
            color: [{
                name: 'start_window_background',
                value: '#FFFFFF'
            }]
        }));
        //profile
        let pages = path.join(profi, 'main_pages.json'), obj: mainPages = { src: ['pages/Index'] };
        await vscode.workspace.fs.writeFile(vscode.Uri.parse(pages), objToBuffer(obj));
        //module
        let moduleInfo: module = {
            module: {
                type: 'feature',
                name: moduleName,
                deliveryWithInstall: true,
                installationFree: false,
                pages: "$profile:main_pages",
                mainElement: 'ApplicationAbility',
                deviceTypes: ['default', 'tablet'],
                description: "$string:module_desc",
                abilities: [{
                    name: 'ApplicationAbility',
                    srcEntry: './ets/applicationability/ApplicationAbility.ets',
                    description: '$string:ApplicationAbility_desc',
                    icon: '$media:icon',
                    label: '$string:ApplicationAbility_label',
                    startWindowIcon: '$media:startIcon',
                    startWindowBackground: '$color:start_window_background',
                    exported: true
                }]
            }
        };
        let modulePath = vscode.Uri.parse(path.join(main, 'module.json5'));
        await vscode.workspace.fs.writeFile(modulePath, objToBuffer(moduleInfo));
        //ability
        fs.copyFileSync(path.join(globalData.extensionPath, 'templates', 'project', 'ability.txt'), path.join(ability, 'ApplicationAbility.ets'));
        //pages
        fs.copyFileSync(path.join(globalData.extensionPath, 'templates', 'project', 'index.txt'), path.join(page, 'Index.ets'));
        //cpp
        fs.copyFileSync(path.join(globalData.extensionPath, 'templates', 'project', 'make.txt'), path.join(cpp, 'CMakeLists.txt'));
        fs.copyFileSync(path.join(globalData.extensionPath, 'templates', 'project', 'hello.txt'), path.join(cpp, 'hello.cpp'));
        //libapplication
        await vscode.workspace.fs.writeFile(vscode.Uri.parse(path.join(libapplication, 'index.d.ts')),
            textToBuffer('export const add: (a: number, b: number) => number;'));
        //oh-package.json5
        let pack: ohPackage = {
            main: '',
            version: '',
            license: '',
            dependencies: {},
            author: authorName,
            types: "./index.d.ts",
            name: 'libapplication.so',
            description: 'Please describe the basic information.'
        };
        await vscode.workspace.fs.writeFile(vscode.Uri.parse(path.join(libapplication, 'oh-package.json5')), objToBuffer(pack));
    }

    private async createEntryModule(moduleName: string, appName: string, authorName: string) {
        let module = path.join(globalData.projectPath.fsPath, moduleName), src = path.join(module, 'src'),
            main = path.join(src, 'main'), resources = path.join(main, 'resources'),
            ets = path.join(main, 'ets'), base = path.join(resources, 'base'),
            profi = path.join(base, 'profile'), media = path.join(base, 'media'),
            element = path.join(base, 'element'), ability = path.join(ets, 'entryability'),
            page = path.join(ets, 'pages');
        await createDirectories([module, src, main, resources, ets, base, profi, media, element, ability, page]);
        //build-profile.json5
        let profile: moduleProfile = {
            apiType: 'stageMode',
            targets: [
                { name: "default" },
                { name: "ohosTest" }]
        };
        let profileUri = vscode.Uri.parse(path.join(module, 'build-profile.json5'));
        await vscode.workspace.fs.writeFile(profileUri, objToBuffer(profile));
        //oh-package.json5
        let pkg: ohPackage = {
            name: moduleName,
            version: "1.0.0",
            description: 'Please describe the basic information.',
            main: '',
            author: authorName,
            license: '',
            dependencies: {}
        };
        let packageUri = vscode.Uri.parse(path.join(module, 'oh-package.json5'));
        await vscode.workspace.fs.writeFile(packageUri, objToBuffer(pkg));
        //hvigorfile.ts
        let har = path.join(globalData.extensionPath, 'templates', 'project', 'hap.txt');
        fs.copyFileSync(har, path.join(module, 'hvigorfile.ts'));
        //media
        let icon = path.join(globalData.extensionPath, 'templates', 'media', 'icon.png'),
            startIcon = path.join(globalData.extensionPath, 'templates', 'media', 'startIcon.png');
        fs.copyFileSync(icon, path.join(media, 'icon.png'));
        fs.copyFileSync(startIcon, path.join(media, 'startIcon.png'));
        //element
        let bs = path.join(element, 'string.json'), bc = path.join(element, 'color.json');
        await vscode.workspace.fs.writeFile(vscode.Uri.parse(bs), objToBuffer({
            string: [
                {
                    name: "module_desc",
                    value: moduleName
                },
                {
                    name: "EntryAbility_desc",
                    value: appName
                },
                {
                    name: "EntryAbility_label",
                    value: appName
                }]
        }));
        await vscode.workspace.fs.writeFile(vscode.Uri.parse(bc), objToBuffer({
            color: [{
                name: 'start_window_background',
                value: '#FFFFFF'
            }]
        }));
        //profile
        let pages = path.join(profi, 'main_pages.json'), obj: mainPages = { src: ['pages/Index'] };
        await vscode.workspace.fs.writeFile(vscode.Uri.parse(pages), objToBuffer(obj));
        //module
        fs.copyFileSync(path.join(globalData.extensionPath, 'templates', 'project', 'module.txt'), path.join(main, 'module.json5'));
        //ability
        fs.copyFileSync(path.join(globalData.extensionPath, 'templates', 'project', 'ability.txt'), path.join(ability, 'EntryAbility.ets'));
        //pages
        fs.copyFileSync(path.join(globalData.extensionPath, 'templates', 'project', 'page.txt'), path.join(page, 'Index.ets'));
    }
}
export default new moduleCreator();