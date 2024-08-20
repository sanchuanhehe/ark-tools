import * as vscode from 'vscode';
import { resNode } from '../resNode';
import { moduleDetail } from "./moduleDetail";
import { moduleProfile } from '../profiles/moduleProfile';

export interface moduleResource {
    name: string;
    detail?: moduleDetail;
    medias: Array<string>;
    colors: Array<resNode>;
    modulePath?: vscode.Uri;
    strings: Array<resNode>;
    files: Array<vscode.Uri>;
    moduleProfile?: moduleProfile;
}