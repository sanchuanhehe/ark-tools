import { deviceType } from "./module";
import { abilityDetail } from "./abilityDetail";

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