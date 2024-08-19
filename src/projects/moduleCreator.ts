
import fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';
import { globalData } from '../globalData';
import { ohPackage } from '../models/ohPackage';
import { mainPages } from '../models/projects/mainPages';
import { createDirectories, objToBuffer } from '../utils';
import { moduleType } from '../models/modules/moduleDetail';
import { moduleProfile } from '../models/profiles/moduleProfile';

export class moduleCreator {
    async createModule(name: string, authorName: string, type: moduleType) {
        switch (type) {
            case 'entry':
                this.createEntryModule(name, authorName);
                break;
        }

    }

    private async createEntryModule(name: string, authorName: string) {
        let module = path.join(globalData.projectPath.fsPath, 'name'), src = path.join(module, 'src'),
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
            name: name,
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
                    value: name
                },
                {
                    name: "EntryAbility_desc",
                    value: name
                },
                {
                    name: "EntryAbility_label",
                    value: name
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