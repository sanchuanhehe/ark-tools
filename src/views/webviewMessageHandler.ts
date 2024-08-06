import * as vscode from 'vscode';
import { client } from '../client';
import { ohLoader } from './ohLoader';
import { dependencie } from '../models/ohosFile';
import { denpenciesLoader } from './denpenciesLoader';
import { PackageMessage, UIMessage } from '../models/uiMessage';

export default class WebviewMessageHandler {
    private readonly loader: ohLoader;
    private _needApply = false;
    private readonly disposables: vscode.Disposable[] = [];
    get needApply() {
        return this._needApply;
    }

    public constructor(private readonly webview: vscode.Webview, pgFilePath: string) {
        this.webview.onDidReceiveMessage((message: UIMessage) => {
            this.handleMessage(message);
        }, null, this.disposables);
        this.loader = new ohLoader(pgFilePath);
        this.readToml(pgFilePath);
    }

    private readToml(pgFilePath: string) {
        this.loader.loadFile();
        let packages: dependencie[] = this.loader.getPackages();
        this.webview.postMessage({ command: 'dependencies', data: { packages, pgFilePath } });
    }

    applySave() {
        this.loader.applyNow();
        this._needApply = false;
    }

    private handleMessage(message: UIMessage): void {
        switch (message.command) {
            case 'apply': {
                this.applySave();
                break;
            }
            case 'search': {
                let keywords = message.data.toString();
                denpenciesLoader.query(keywords).then((denpencies) => {
                    if (denpencies) {
                        let page_count = client.page_count ?? 0;
                        this.webview.postMessage({ command: 'search', data: { denpencies, page_count } });
                    }
                });
                break;
            }
            case 'next': {
                let page = parseInt(message.data);
                denpenciesLoader.load(page).then((denpencies) => {
                    if (denpencies) {
                        this.webview.postMessage({ command: 'next', data: { denpencies } });
                    }
                });
                break;
            }
            case 'install-package': {
                let pm = message as PackageMessage;
                this.loader.addNode(pm);
                this._needApply = true;
                break;
            }
            case 'update-package': {
                let pm = message as PackageMessage;
                this.loader.updateNode(pm);
                this._needApply = true;
                break;
            }
            case 'remove-package': {
                let pm = message as PackageMessage;
                this.loader.rmeoveNode(pm);
                this._needApply = true;
                break;
            }
        }
    }

    public dispose(): void {
        while (this.disposables.length) {
            const disposable = this.disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}