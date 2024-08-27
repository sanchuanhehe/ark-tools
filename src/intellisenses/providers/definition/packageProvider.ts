import * as vscode from 'vscode';
import { fileToJsonSync } from '../../../utils';
import { ohPackage } from '../../../models/ohPackage';
import { createContext } from '../../utils/createContext';
import projectLoader from '../../../projects/projectLoader';
import { definitionProvider } from '../base/definitionProvider';

const modules: [string, vscode.FileType][] = [];
const def = vscode.Uri.file('.'), pos = new vscode.Position(0, 0);

export const packageProvider: definitionProvider = {
  selector: {
    scheme: "file",
    language: "arkts"
  },
  provider: {
    provideDefinition
  }
};

async function provideDefinition(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.Location> {
  const path = vscode.Uri.joinPath(projectLoader.projectPath, 'oh_modules');
  if (modules.length === 0) {
    const ret = await vscode.workspace.fs.readDirectory(path);
    modules.push(...ret);
  }
  const context = createContext(document, position);
  const { textFullLine } = context;
  if (textFullLine.trim().startsWith('import')) {
    const match = textFullLine.trim().replaceAll('\"', '\'').match(/import\s+(\w+)\s+from\s+'([^']+)'|import\s+{([^}]+)}\s+from\s+'([^']+)'/),
      destPath = match?.[2] || match?.[4];
    if (destPath) {
      if (destPath.startsWith('.') && !destPath.startsWith('/')) {
        return Promise.resolve(new vscode.Location(vscode.Uri.file(destPath), pos));
      } else {
        const index = destPath.indexOf('/');
        if (index !== -1) {
          if (destPath.indexOf('.') === -1) {
            const root = destPath.substring(0, index), name = destPath.substring(index + 1),
              path = vscode.Uri.joinPath(projectLoader.projectPath, 'oh_modules', root);
            if (hasModules(root, modules)) {
              const clds = await vscode.workspace.fs.readDirectory(path);
              if (hasModules(name, clds)) {
                const file = vscode.Uri.joinPath(path, name, 'oh-package.json5'),
                  json: ohPackage = fileToJsonSync(file.fsPath);
                return Promise.resolve(new vscode.Location(vscode.Uri.joinPath(path, name, json.main), pos));
              }
            }
          } else {

          }
        } else {
          if (hasModules(destPath, modules)) {
            const file = vscode.Uri.joinPath(path, destPath, 'oh-package.json5'),
              json: ohPackage = fileToJsonSync(file.fsPath);
            return Promise.resolve(new vscode.Location(vscode.Uri.joinPath(path, destPath, json.main), pos));
          }
        }
      }
    }
  }
  return Promise.resolve(new vscode.Location(def, pos));
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