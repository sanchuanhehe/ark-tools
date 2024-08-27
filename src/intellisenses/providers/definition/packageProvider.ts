import * as vscode from 'vscode';
import { createContext } from '../../utils/createContext';
import { definitionProvider } from '../base/definitionProvider';

export const packageProvider: definitionProvider = {
  selector: {
    scheme: "file",
    language: "arkts"
  },
  provider: {
    provideDefinition
  }
};

const def = vscode.Uri.file('.'), pos = new vscode.Position(0, 0);
function provideDefinition(document: vscode.TextDocument, position: vscode.Position): vscode.Location {
  const context = createContext(document, position);
  const { textFullLine } = context;
  if (textFullLine.trim().startsWith('import')) {
    let destPath = '';
    return new vscode.Location(vscode.Uri.file(destPath), pos);
  }
  return new vscode.Location(def, pos);
}