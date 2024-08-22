export interface ohPackage {
    name: string;
    main: string;
    author: string;
    license: string;
    version: string;
    types?: string;
    description: string;
    packageType?: string;
    dependencies: Record<string, string>;
    devDependencies?: Record<string, string>;
    dynamicDependencies?: Record<string, string>;
}