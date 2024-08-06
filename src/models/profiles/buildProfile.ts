import { appDetail } from "./appDetail";
import { moduleInfo } from "./moduleInfo";


export interface buildProfile {
    app: appDetail;
    modules: moduleInfo[];
}