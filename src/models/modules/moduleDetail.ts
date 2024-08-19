import { deviceType } from "./module";
import { abilityDetail } from "./abilityDetail";

export interface moduleDetail {
    name: string;
    type: moduleType;
    description: string;
    mainElement: string;
    deviceTypes: deviceType[];
    requestPermissions: string;
    deliveryWithInstall: boolean;
    installationFree: boolean;
    pages: string;
    abilities: abilityDetail[];
}
export type moduleType = 'shared' | 'entry' | 'har' | 'feature';