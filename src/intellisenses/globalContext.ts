import * as fs from 'fs';
import { std } from './std';
import * as path from 'path';
import * as vscode from 'vscode';
import { moduleName } from '../models/moduleName';

export class globalContext {
    private static _instance: globalContext;
    static get instance() {
        if (!this._instance) {
            this._instance = new globalContext();
        }
        return this._instance;
    }

    private importModules: moduleName[] = [];
    private constructor() {
        vscode.workspace.onDidChangeConfiguration(() => this.loadExtend());
    }

    initialize() {
        for (let k of std) {
            this._root.push(k.root);
        }
        this.importModules = std;
        this.loadExtend();
    }

    private loadExtend() {
        try {
            let config = vscode.workspace.getConfiguration("arktsTools.intellisenses");
            let modulesPath = config.inspect<string>('modulesPath')?.globalValue ?? '';
            if (typeof modulesPath !== 'undefined' && modulesPath !== '') {
                let files = fs.readdirSync(modulesPath);
                files = files.filter((i) => i.startsWith('ets_role_') && i.endsWith('.json'));
                if (files && files.length > 0) {
                    let root: string[] = [], modules: moduleName[] = [];
                    for (let file of files) {
                        try {
                            let fp = path.join(modulesPath, file);
                            const jsonContent = fs.readFileSync(fp, 'utf8');
                            let obj: moduleName[] = JSON.parse(jsonContent);
                            for (let k of obj) {
                                if (k.digit > 0 && typeof k.root !== 'undefined' && k.libs.length > 0) {
                                    root.push(k.root);
                                    modules.push(k);
                                }
                            }
                        } catch (e) {
                            vscode.window.showErrorMessage(`Load Extend Modules Role [${file}] Failed! Please check reference file! Error Message: [${e}]`);
                        }
                    }
                    this._root.push(...root);
                    this.importModules.push(...modules);
                }
            }
        } catch (err) {
            vscode.window.showErrorMessage(`Load intellisenses modulesInfo Failed, ${err}`);
        }
    }

    getModules(ns: string, digit: number = 1, fns: string) {
        let arr: string[] = [];
        if (this.importModules) {
            let nameSpace = this.importModules.find((i) => i.digit === digit && i.root === ns.toLowerCase());
            if (nameSpace) {
                arr = nameSpace.libs.filter((i) => i.includes(fns));
            }
        }
        return arr;
    }

    private readonly _root: string[] = [];

    get root() {
        return this._root;
    }
}