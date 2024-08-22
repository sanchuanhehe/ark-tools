import fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';
import { globalData } from '../globalData';
import moduleCreator from './moduleCreator';
import { ohPackage } from '../models/ohPackage';
import { appScope } from '../models/appScope/appScope';
import { globalProfile } from '../models/profiles/globalProfile';
import { createDirectories, isEmpty, objToBuffer } from "../utils";

class projectCreator {
    private projectPath: string = '';

    async create(projectPath: string): Promise<string> {
        try {
            if (!isEmpty(projectPath)) {
                let appName = await vscode.window.showInputBox({
                    prompt: "Enter App name",
                    placeHolder: "App Package Name",
                });
                let authorName = await vscode.window.showInputBox({
                    prompt: "Enter Author name",
                    placeHolder: "Author Name",
                });
                if (appName && authorName) {
                    this.projectPath = projectPath;
                    globalData.projectPath = vscode.Uri.parse(projectPath);
                    this.global(appName, authorName);
                    this.appScope(appName, authorName);
                    moduleCreator.createModule('entry', appName, authorName, 'entry');
                    return Promise.resolve(projectPath);
                }
            }
            return Promise.reject(`Create Project Failed`);
        }
        catch (err) {
            vscode.window.showErrorMessage(`Create Project Failed, ${err}`);
            return Promise.reject(err);
        }
    }

    private async global(appName: string, authorName: string) {
        //build-profile.json5
        let profile: globalProfile = {
            app: {
                signingConfigs: [],
                products: [{
                    name: "default",
                    signingConfig: "default",
                    compileSdkVersion: 11,
                    compatibleSdkVersion: 10,
                    runtimeOS: "OpenHarmony",
                }],
                buildModeSet: [
                    { name: "debug" },
                    { name: "release" }]
            },
            modules: [{
                name: 'entry',
                srcPath: './entry',
                targets: [{
                    name: "default",
                    applyToProducts: [
                        "default"
                    ]
                }]
            }]
        };
        let profileUri = vscode.Uri.parse(path.join(this.projectPath, 'build-profile.json5'));
        await vscode.workspace.fs.writeFile(profileUri, objToBuffer(profile));
        //oh-package.json5
        let pkg: ohPackage = {
            name: appName,
            version: "1.0.0",
            description: 'Please describe the basic information.',
            main: '',
            author: authorName,
            license: '',
            dependencies: {
            },
            devDependencies: {
                "@ohos/hypium": "1.0.13",
                "@ohos/hamock": "1.0.0"
            }
        };
        let packageUri = vscode.Uri.parse(path.join(this.projectPath, 'oh-package.json5'));
        await vscode.workspace.fs.writeFile(packageUri, objToBuffer(pkg));
        //hvigorfile.ts
        let har = path.join(globalData.extensionPath, 'templates', 'project', 'app.txt');
        fs.copyFileSync(har, path.join(this.projectPath, 'hvigorfile.ts'),);
        //hvigorw
        let hvigorw = path.join(globalData.extensionPath, 'templates', 'project', 'hvigorw.txt');
        fs.copyFileSync(hvigorw, path.join(this.projectPath, 'hvigorw.bat'));
        hvigorw = path.join(globalData.extensionPath, 'templates', 'project', 'hvigorw');
        fs.copyFileSync(hvigorw, path.join(this.projectPath, 'hvigorw'));
        //hvigor
        let hvigor = path.join(this.projectPath, 'hvigor'),
            config = path.join(globalData.extensionPath, 'templates', 'project', 'config.txt'),
            wrapper = path.join(globalData.extensionPath, 'templates', 'project', 'wrapper.txt');
        await vscode.workspace.fs.createDirectory(vscode.Uri.parse(hvigor));
        fs.copyFileSync(config, path.join(hvigor, 'hvigor-config.json5'));
        fs.copyFileSync(wrapper, path.join(hvigor, 'hvigor-wrapper.js'));
    }

    private async appScope(appName: string, authorName: string) {
        let app = path.join(this.projectPath, 'AppScope'), resources = path.join(app, 'resources'),
            base = path.join(resources, 'base'), element = path.join(base, 'element'),
            media = path.join(base, 'media');
        createDirectories([app, resources, base, element, media]);
        let af = path.join(app, 'app.json5');
        let content: appScope = {
            app: {
                bundleName: `com.${authorName.trim()}.${appName.trim()}`,
                vendor: authorName.trim(),
                versionCode: 1000000,
                versionName: '1.0.0',
                icon: "$media:app_icon",
                label: "$string:app_name"
            }
        };
        await vscode.workspace.fs.writeFile(vscode.Uri.parse(af), objToBuffer(content));
        let bs = path.join(element, 'string.json'), bc = path.join(element, 'color.json'),
            icon = path.join(media, 'app_icon.png');
        await vscode.workspace.fs.writeFile(vscode.Uri.parse(bs), objToBuffer({
            string: [{
                name: 'app_name',
                value: appName
            },
            {
                name: "module_desc",
                value: appName
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
        fs.copyFileSync(path.join(globalData.extensionPath, 'templates', 'media', 'app_icon.png'), icon);
    }
}
export default new projectCreator();