export class globalData {
    private static _extensionPath: string;
    static get extensionPath() {
        return this._extensionPath;
    }
    static set extensionPath(extensionPath: string) {
        this._extensionPath = extensionPath;
    }

    private static _projectPath: string;
    static get projectPath() {
        return this._projectPath;
    }
    static set projectPath(projectPath: string) {
        this._projectPath = projectPath;
    }
}