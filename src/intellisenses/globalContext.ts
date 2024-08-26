import * as fs from 'fs';
import { std } from './std';
import * as path from 'path';
import * as vscode from 'vscode';
import { $r, fileToJsonSync } from '../utils';
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
        for (const k of std) {
            this._root.push(k.root);
        }
        this.importModules = std;
        this.loadExtend();
    }

    private loadExtend() {
        try {
            const config = vscode.workspace.getConfiguration("arktsTools");
            const modulesPath = config.inspect<string>('intellisensesModulesPath')?.globalValue ?? '';
            if (typeof modulesPath !== 'undefined' && modulesPath !== '') {
                const files = fs.readdirSync(modulesPath).filter((i) => i.startsWith('ets_role_') && i.endsWith('.json'));
                if (files && files.length > 0) {
                    const root: string[] = [], modules: moduleName[] = [];
                    for (const file of files) {
                        try {
                            const fp = path.join(modulesPath, file);
                            const obj: moduleName[] = fileToJsonSync(fp);
                            for (const k of obj) {
                                if (k.digit > 0 && typeof k.root !== 'undefined' && k.libs.length > 0) {
                                    root.push(k.root);
                                    modules.push(k);
                                }
                            }
                        } catch (e) {
                            vscode.window.showErrorMessage(`File [${file}] ${$r('intellisensesFailed')} Error Message: [${e}]`);
                        }
                    }
                    this._root.push(...root);
                    this.importModules.push(...modules);
                }
            }
        } catch (err) {
            vscode.window.showErrorMessage($r('intellisensesAllFailed', err));
        }
    }

    getModules(ns: string, digit: number = 1, fns: string) {
        const arr: string[] = [];
        try {
            if (this.importModules) {
                const nameSpace = this.importModules.find((i) => i.digit === digit && i.root === ns.toLowerCase());
                if (nameSpace) {
                    arr.push(...nameSpace.libs.filter((i) => i.includes(fns)));
                }
            }
        } catch (err) {
            console.log(err);
        }
        return arr;
    }

    private readonly _root: string[] = [];

    get root() {
        return this._root;
    }
}