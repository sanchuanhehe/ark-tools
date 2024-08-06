import { appDetail } from "./appDetail";
import { moduleInfo } from "./moduleInfo";


export interface globalProfile {
    app: appDetail;
    modules: moduleInfo[];
}