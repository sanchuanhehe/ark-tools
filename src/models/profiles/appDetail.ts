import { productInfo } from "./productInfo";
import { buildModeInfo } from "./buildModeInfo";
import { signingConfig } from "./signingConfig";

export interface appDetail {
    signingConfigs: signingConfig[];
    products: productInfo[];
    buildModeSet: buildModeInfo[];
}