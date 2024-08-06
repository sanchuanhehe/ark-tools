import { targetInfo } from "./targetInfo";

export interface moduleInfo {
    name: string;
    srcPath: string;
    targets: targetInfo[];
}