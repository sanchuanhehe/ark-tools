import * as vscode from 'vscode';
import { resNode } from '../resNode';
import { ohPackage } from '../ohPackage';
import { moduleDetail } from "./moduleDetail";
import { moduleProfile } from '../profiles/moduleProfile';

export interface moduleResource {
    name: string;
    package?: ohPackage;
    detail?: moduleDetail;
    medias: Array<string>;
    colors: Array<resNode>;
    modulePath?: vscode.Uri;
    strings: Array<resNode>;
    moduleProfile?: moduleProfile;
}