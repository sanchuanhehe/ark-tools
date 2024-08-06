import fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';
import { isEmpty, objToBuffer } from "../utils";
import { ohPackage } from '../models/ohPackage';
import { appScope } from '../models/appScope/appScope';
import { globalProfile } from '../models/profiles/globalProfile';
import { moduleProfile } from '../models/profiles/moduleProfile';

class projectCreator {
    extensionPath: string = '';
    private appName: string = '';
    private authorName: string = '';
    private projectPath: string = '';

    async name(): Promise<boolean> {
        let appName = await vscode.window.showInputBox({
            prompt: "Enter App name",
            placeHolder: "App Package Name",
        });
        if (!appName) {
            return Promise.resolve(false);
        }
        let authorName = await vscode.window.showInputBox({
            prompt: "Enter Author name",
            placeHolder: "Author Name",
        });
        if (!authorName) {
            return Promise.resolve(false);
        }
        this.appName = appName;
        this.authorName = authorName;
        return Promise.resolve(true);
    }

    async create(projectPath: string): Promise<string> {
        try {
            if (!isEmpty(projectPath)) {
                this.projectPath = projectPath;
                this.global();
                this.appScope();
                this.entry();
            }
            return Promise.resolve(projectPath);
        }
        catch (err) {
            vscode.window.showErrorMessage(`Create Project Failed, ${err}`);
            return Promise.reject(err);
        }
    }

    private async global() {
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
            name: this.appName,
            version: "1.0.0",
            description: 'Please describe the basic information.',
            main: '',
            author: this.authorName,
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
        let har = path.join(this.extensionPath, 'templates', 'app.txt');
        fs.copyFileSync(har, path.join(this.projectPath, 'hvigorfile.ts'),);
        //hvigorw
        let hvigorw = path.join(this.extensionPath, 'templates', 'hvigorw.txt');
        fs.copyFileSync(hvigorw, path.join(this.projectPath, 'hvigorw.bat'));
        hvigorw = path.join(this.extensionPath, 'templates', 'hvigorw');
        fs.copyFileSync(hvigorw, path.join(this.projectPath, 'hvigorw'));
        //hvigor
        let hvigor = path.join(this.projectPath, 'hvigor'),
            config = path.join(this.extensionPath, 'templates', 'config.txt'),
            wrapper = path.join(this.extensionPath, 'templates', 'wrapper.txt');
        await vscode.workspace.fs.createDirectory(vscode.Uri.parse(hvigor));
        fs.copyFileSync(config, path.join(hvigor, 'hvigor-config.json5'));
        fs.copyFileSync(wrapper, path.join(hvigor, 'hvigor-wrapper.js'));
    }

    private async entry() {
        let entry = path.join(this.projectPath, 'entry'), src = path.join(entry, 'src');
        await vscode.workspace.fs.createDirectory(vscode.Uri.parse(entry));
        await vscode.workspace.fs.createDirectory(vscode.Uri.parse(src));
        //build-profile.json5
        let profile: moduleProfile = {
            apiType: 'stageMode',
            targets: [
                { name: "default" },
                { name: "ohosTest" }]
        };
        let profileUri = vscode.Uri.parse(path.join(entry, 'build-profile.json5'));
        await vscode.workspace.fs.writeFile(profileUri, objToBuffer(profile));
        //oh-package.json5
        let pkg: ohPackage = {
            name: 'entry',
            version: "1.0.0",
            description: 'Please describe the basic information.',
            main: '',
            author: this.authorName,
            license: '',
            dependencies: {}
        };
        let packageUri = vscode.Uri.parse(path.join(entry, 'oh-package.json5'));
        await vscode.workspace.fs.writeFile(packageUri, objToBuffer(pkg));
        //hvigorfile.ts
        let har = path.join(this.extensionPath, 'templates', 'hap.txt');
        fs.copyFileSync(har, path.join(entry, 'hvigorfile.ts'));
    }

    private async appScope() {
        let app = path.join(this.projectPath, 'AppScope'), resources = path.join(app, 'resources'),
            base = path.join(resources, 'base'), element = path.join(base, 'element'),
            media = path.join(base, 'media');
        await vscode.workspace.fs.createDirectory(vscode.Uri.parse(app));
        await vscode.workspace.fs.createDirectory(vscode.Uri.parse(resources));
        await vscode.workspace.fs.createDirectory(vscode.Uri.parse(base));
        await vscode.workspace.fs.createDirectory(vscode.Uri.parse(element));
        await vscode.workspace.fs.createDirectory(vscode.Uri.parse(media));
        let af = path.join(app, 'app.json5');
        let content: appScope = {
            app: {
                bundleName: `com.${this.authorName.trim()}.${this.appName.trim()}`,
                vendor: this.authorName.trim(),
                versionCode: 1000000,
                versionName: '1.0.0',
                icon: "$media:app_icon",
                label: "$string:app_name"
            }
        };
        await vscode.workspace.fs.writeFile(vscode.Uri.parse(af), objToBuffer(content));
        let bs = path.join(element, 'string.json'), bc = path.join(element, 'color.json');
        await vscode.workspace.fs.writeFile(vscode.Uri.parse(bs), objToBuffer({
            string: [{
                name: 'app_name',
                value: this.appName
            },
            {
                name: "module_desc",
                value: this.appName
            },
            {
                name: "EntryAbility_desc",
                value: this.appName
            },
            {
                name: "EntryAbility_label",
                value: this.appName
            }]
        }));
        await vscode.workspace.fs.writeFile(vscode.Uri.parse(bc), objToBuffer({
            color: [{
                name: 'start_window_background',
                value: '#FFFFFF'
            }]
        }));
    }
}
export default new projectCreator();