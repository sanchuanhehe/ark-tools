import { skillDetail } from "./skillDetail";

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