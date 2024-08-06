import * as fs from 'fs';
import * as vscode from 'vscode';
import { isEmpty } from '../utils';
import { PackageMessage } from "../models/uiMessage";
import { dependencie, dependencies } from "../models/ohosFile";

export class ohLoader {
    private packages: dependencie[] = [];
    private readonly filePath: string;
    constructor(filePath: string) {
        this.filePath = filePath;
    }

    loadFile() {
        try {
            const content = fs.readFileSync(this.filePath, 'utf8');
            const obj = JSON.parse(content);
            if (obj.dependencies) {
                const dep: dependencies = obj.dependencies;
                for (const key in dep) {
                    if (dep.hasOwnProperty(key)) {
                        const value = dep[key];
                        let row: dependencie = { packageName: key };
                        if (value.startsWith('file://')) {
                            row.packagePath = value;
                        } else {
                            row.packageVersion = value;
                        }
                        this.packages.push(row);
                    }
                }
            }

        } catch (err) {
            vscode.window.showErrorMessage(`Load Ohos Package file failed! ${err}`);
        }
    }

    getPackages(): dependencie[] {
        return this.packages;
    }

    applyNow() {
        const content = fs.readFileSync(this.filePath, 'utf8');
        const obj = JSON.parse(content);
        delete obj.dependencies;
        const dependencies: dependencies = {};
        this.packages.forEach((item) => {
            let value = isEmpty(item.packagePath) ? item.packageVersion : item.packagePath;
            dependencies[item.packageName] = value ?? '*';
        });
        obj.dependencies = dependencies;
        const updatedJsonString = JSON.stringify(obj, null, 2);
        fs.writeFileSync(this.filePath, updatedJsonString);
    }

    addNode(message: PackageMessage) {
        if (message.packagePath) {
            this.packages.push({
                packageName: message.packageName,
                packagePath: message.packagePath
            });
        } else {
            this.packages.push({
                packageName: message.packageName,
                packageVersion: message.packageVersion
            });
        }
    }

    updateNode(message: PackageMessage) {
        let update = this.packages.find((i) => i.packageName.toLowerCase() === message.packageName.toLowerCase());
        if (update) {
            if (update.packagePath?.trim() !== '') {
                update.packagePath = message.packagePath;
            } else {
                update.packageVersion = message.packageVersion ?? "";
            }
        }
    }

    rmeoveNode(message: PackageMessage) {
        let index = this.packages.findIndex((i) => i.packageName.toLowerCase() === message.packageName.toLowerCase());
        if (index !== -1) {
            this.packages.splice(index, 1);
        }
    }
}