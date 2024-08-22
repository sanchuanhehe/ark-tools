export interface buildOption {
    externalNativeOptions?: externalNativeOptions;
}

export interface externalNativeOptions {
    path: string;
    arguments?: string;
    cppFlags?: string;
}