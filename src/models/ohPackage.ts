export interface ohPackage {
    name: string;
    main: string;
    author: string;
    license: string;
    version: string;
    description: string;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
    dynamicDependencies: Record<string, string>;
}