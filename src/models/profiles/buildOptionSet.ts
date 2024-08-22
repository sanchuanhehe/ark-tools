export interface buildOptionSet {
    name: string;
    nativeLib: nativeLib;
}

export interface nativeLib {
    debugSymbol: debugSymbol;
}

export interface debugSymbol {
    strip: boolean;
    exclude: string[];
}