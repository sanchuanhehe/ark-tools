import * as vscode from 'vscode';
import path, { join } from 'path';
import { context } from './context';
import { fileInfo } from '../../models/fileInfo';

export class pathCompletionItem {
    static async create(context: context) {
        try {
            const workspace = vscode.workspace.getWorkspaceFolder(context.document.uri);
            const rootPath = workspace?.uri.fsPath;
            const index = context.document.uri.fsPath.lastIndexOf('/'), fileName = context.document.uri.fsPath.substring(index + 1);
            const path = this.getPathOfFolderToLookupFiles(context.document.uri.fsPath, context.fromString, rootPath);
            const childrenOfPath = await this.getChildrenOfPath(path, fileName);
            return [...childrenOfPath.map((child) => this.createPathCompletionItem(child))];
        } catch (err) {
            console.log(err);
            return [];
        }
    }

    private static createPathCompletionItem(fileInfo: fileInfo): vscode.CompletionItem {
        const fileName = fileInfo.file, index = fileName.lastIndexOf("."),
            insertText = index !== -1 ? fileName.substring(0, index) : fileName;
        return {
            label: fileName,
            insertText: insertText,
            kind: fileInfo.isFile ? vscode.CompletionItemKind.File : vscode.CompletionItemKind.Folder
        };
    }

    private static getPathOfFolderToLookupFiles(fileName: string, text: string | undefined, rootPath?: string): string {
        const normalizedText = path.normalize(text || "");
        const isPathAbsolute = normalizedText.startsWith(path.sep);
        const rootFolder = isPathAbsolute ? rootPath || "" : path.dirname(fileName);
        const pathEntered = normalizedText;
        return path.join(rootFolder, pathEntered);
    }

    private static async getChildrenOfPath(path: string, fileName: string) {
        try {
            const files = (await vscode.workspace.fs.readDirectory(vscode.Uri.file(path))).map((fileTuble) => fileTuble[0]);
            const fileInfoList: fileInfo[] = [];
            for (const file of files) {
                const fileStat = await vscode.workspace.fs.stat(vscode.Uri.file(join(path, file)));
                if (!file.endsWith(fileName)) {
                    if (fileStat.type === vscode.FileType.File) {
                        if (file.endsWith('.ets') || file.endsWith('.ts')) {
                            fileInfoList.push({
                                file,
                                isFile: true,
                                documentExtension: this.getDocumentExtension(file, fileStat)
                            });
                        }
                    } else {
                        fileInfoList.push({
                            file,
                            isFile: false,
                            documentExtension: this.getDocumentExtension(file, fileStat)
                        });
                    }
                }
            }
            return fileInfoList;
        } catch (error) {
            return [];
        }
    }

    private static getDocumentExtension(file: string, fileStat: vscode.FileStat) {
        if (fileStat.type !== vscode.FileType.File) {
            return undefined;
        }
        const fragments = file.split(".");
        return fragments[fragments.length - 1];
    }
}