export interface UIMessage {
    command: string;
    data: any;
}

export interface PackageMessage extends UIMessage {
    pgFilePath: string;
    packageName: string;
    packagePath?: string;
    packageVersion?: string;
}