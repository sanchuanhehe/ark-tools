export type deviceType = 'default' | 'tablet';

export interface module {
    module: moduleDetail;
}
export interface moduleDetail {
    name: string;
    type: string;
    description: string;
    mainElement: string;
    deviceTypes: deviceType[];
    requestPermissions: string;
    deliveryWithInstall: boolean;
    installationFree: boolean;
    pages: string;
    abilities: abilityDetail[];
}
export interface requestPermission {
    name: string;
    usedScene?: Record<string, string>;
    reason?: string;
}
export interface abilityDetail {
    name: string;
    srcEntry: string;
    description: string;
    icon: string;
    label: string;
    startWindowIcon: string;
    startWindowBackground: string;
    exported: boolean;
    skills: skillDetail[];
}
export interface skillDetail {
    entities: string[];
    actions: string[];
}