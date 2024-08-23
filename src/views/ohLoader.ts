import * as fs from 'fs';
import * as vscode from 'vscode';
import { $r, fileToJsonSync } from '../utils';
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
            const obj = fileToJsonSync(this.filePath);
            if (obj.dependencies) {
                const dep: dependencies = obj.dependencies;
                for (const key in dep) {
                    if (dep.hasOwnProperty(key)) {
                        const value = dep[key];
                        this.packages.push({
                            packageName: key,
                            packageVersion: value
                        });
                    }
                }
            }

        } catch (err) {
            vscode.window.showErrorMessage($r('dpLoadFailed', err));
        }
    }

    getPackages(): dependencie[] {
        return this.packages;
    }

    applyNow() {
        const obj = fileToJsonSync(this.filePath);
        delete obj.dependencies;
        const dependencies: dependencies = {};
        this.packages.forEach((item) => {
            dependencies[item.packageName] = item.packageVersion;
        });
        obj.dependencies = dependencies;
        const updatedJsonString = JSON.stringify(obj);
        fs.writeFileSync(this.filePath, updatedJsonString);
    }

    addNode(message: PackageMessage) {
        this.packages.push({
            packageName: message.packageName,
            packageVersion: message.packageVersion
        });
    }

    updateNode(message: PackageMessage) {
        const update = this.packages.find((i) => i.packageName.toLowerCase() === message.packageName.toLowerCase());
        if (update) {
            update.packageVersion = message.packageVersion ?? "";
        }
    }

    rmeoveNode(message: PackageMessage) {
        const index = this.packages.findIndex((i) => i.packageName.toLowerCase() === message.packageName.toLowerCase());
        if (index !== -1) {
            this.packages.splice(index, 1);
        }
    }
}