import { targetInfo } from "./targetInfo";
import { buildOption } from "./buildOption";
import { buildOptionSet } from "./buildOptionSet";

export interface moduleProfile {
    apiType: string;
    buildOption?: buildOption;
    buildOptionSet?: buildOptionSet;
    targets: targetInfo[];
}