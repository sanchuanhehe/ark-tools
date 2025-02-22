import path from 'path';
import * as vscode from 'vscode';
import { globalData } from '../../../globalData';
import { ohPackage } from '../../../models/ohPackage';
import { fileToJsonSync, hasFile } from '../../../utils';
import { createContext } from '../../utils/createContext';
import projectLoader from '../../../projects/projectLoader';
import { definitionProvider } from '../base/definitionProvider';

const modules: [string, vscode.FileType][] = [], pos = new vscode.Position(0, 0);
export const packageProvider: definitionProvider = {
  selector: {
    scheme: "file",
    language: "arkts"
  },
  provider: {
    provideDefinition
  }
};

async function provideDefinition(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.Location | undefined> {
  const mpath = vscode.Uri.joinPath(projectLoader.projectPath, 'oh_modules');
  if (modules.length === 0) {
    const ret = await vscode.workspace.fs.readDirectory(mpath);
    modules.push(...ret);
  }
  const context = createContext(document, position), { textFullLine } = context;
  if (textFullLine.trim().startsWith('import')) {
    const match = textFullLine.trim().replaceAll('\"', '\'').match(/import\s+(\w+)\s+from\s+'([^']+)'|import\s+{([^}]+)}\s+from\s+'([^']+)'/),
      destPath = (match?.[2] || match?.[4])?.trim();
    if (destPath) {
      if (destPath.startsWith('.') && !destPath.startsWith('/')) {
        const index = context.document.uri.fsPath.lastIndexOf('/'),
          root = context.document.uri.fsPath.substring(0, index),
          sourceIndex = destPath.lastIndexOf('/'),
          source = destPath.substring(sourceIndex + 1),
          absoluteFile = path.resolve(root, destPath),
          absoluteIndex = absoluteFile.lastIndexOf('/'),
          absoluteRoot = absoluteFile.substring(0, absoluteIndex);
        let files = await vscode.workspace.fs.readDirectory(vscode.Uri.parse(absoluteRoot));
        for (let file of files) {
          if (file[0].startsWith(source)) {
            const uri = vscode.Uri.parse(path.join(absoluteRoot, file[0]));
            return Promise.resolve(new vscode.Location(uri, pos));
          }
        }
      } else {
        const index = destPath.indexOf('/');
        if (index !== -1) {
          const root = destPath.substring(0, index), name = destPath.substring(index + 1),
            rootPath = vscode.Uri.joinPath(projectLoader.projectPath, 'oh_modules', root);
          if (hasModules(root, modules)) {
            const clds = await vscode.workspace.fs.readDirectory(rootPath);
            if (hasModules(name, clds)) {
              const file = vscode.Uri.joinPath(rootPath, name, 'oh-package.json5'),
                json: ohPackage = fileToJsonSync(file.fsPath);
              return Promise.resolve(new vscode.Location(vscode.Uri.joinPath(rootPath, name, json.main), pos));
            }
          }
        } else {
          if (destPath.indexOf('.') !== -1) {
            const compileSdkVersion = projectLoader.globalProfile?.app.products[0].compileSdkVersion;
            if (compileSdkVersion) {
              if (typeof compileSdkVersion === 'number') {
                const ohosSdk = path.join(globalData.ohosSdkPath, `${compileSdkVersion}`,
                  (context.documentExtension === 'ets' || context.documentExtension === 'ts' ? 'ets' : 'js'),
                  (destPath.startsWith('@kit') ? 'kits' : 'api'), `${destPath}.d.ts`);
                if (hasFile(ohosSdk)) {
                  return Promise.resolve(new vscode.Location(vscode.Uri.parse(ohosSdk), pos));
                }
              } else {
                const sdk = globalData.hosSdkList.get(compileSdkVersion);
                if (sdk) {
                  const hmsSdk = path.join(sdk, 'hms', 'ets', destPath.startsWith('@hms') ? 'api' : 'kits', `${destPath}.d.ts`),
                    ohosSdk = path.join(sdk, 'openharmony', (context.documentExtension === 'ets' || context.documentExtension === 'ts' ? 'ets' : 'js'), (destPath.startsWith('@kit') ? 'kits' : (destPath.startsWith('@arkts') ? 'arkts' : 'api')), `${destPath}.d.ts`);
                  if (hasFile(hmsSdk)) {
                    return Promise.resolve(new vscode.Location(vscode.Uri.parse(hmsSdk), pos));
                  } else if (hasFile(ohosSdk)) {
                    return Promise.resolve(new vscode.Location(vscode.Uri.parse(ohosSdk), pos));
                  }
                }
              }
            }
          } else {
            if (hasModules(destPath, modules)) {
              const file = vscode.Uri.joinPath(mpath, destPath, 'oh-package.json5'),
                json: ohPackage = fileToJsonSync(file.fsPath);
              return Promise.resolve(new vscode.Location(vscode.Uri.joinPath(mpath, destPath, json.main), pos));
            }
          }
        }
      }
    }
  }
  return Promise.resolve(undefined);
}
function hasModules(name: string, source: [string, vscode.FileType][]): boolean {
  let found = false;
  for (const module of source) {
    if (module[0] === name) {
      found = true;
      break;
    }
  }
  return found;
}