import * as fs from 'fs';
import { $r } from '../utils';
import * as JSON5 from 'json5';
import * as vscode from 'vscode';
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
            const obj = JSON5.parse(content);
            if (obj.dependencies) {
                const dep: dependencies = obj.dependencies;
                for (const key in dep) {
                    if (dep.hasOwnProperty(key)) {
                        const value = dep[key];
                        let row: dependencie = {
                            packageName: key,
                            packageVersion: value
                        };
                        this.packages.push(row);
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
        const content = fs.readFileSync(this.filePath, 'utf8');
        const obj = JSON5.parse(content);
        delete obj.dependencies;
        const dependencies: dependencies = {};
        this.packages.forEach((item) => {
            dependencies[item.packageName] = item.packageVersion;
        });
        obj.dependencies = dependencies;
        const updatedJsonString = JSON5.stringify(obj, null, 2);
        fs.writeFileSync(this.filePath, updatedJsonString);
    }

    addNode(message: PackageMessage) {
        this.packages.push({
            packageName: message.packageName,
            packageVersion: message.packageVersion
        });
    }

    updateNode(message: PackageMessage) {
        let update = this.packages.find((i) => i.packageName.toLowerCase() === message.packageName.toLowerCase());
        if (update) {
            update.packageVersion = message.packageVersion ?? "";
        }
    }

    rmeoveNode(message: PackageMessage) {
        let index = this.packages.findIndex((i) => i.packageName.toLowerCase() === message.packageName.toLowerCase());
        if (index !== -1) {
            this.packages.splice(index, 1);
        }
    }
}