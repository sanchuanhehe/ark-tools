import * as vscode from 'vscode';
import { resNode } from '../resNode';
import { moduleDetail } from "./moduleDetail";

export interface moduleResource {
    name: string;
    detail?: moduleDetail;
    colors: Array<resNode>;
    strings: Array<resNode>;
    medias: Array<string>;
    files: Array<vscode.Uri>;
}