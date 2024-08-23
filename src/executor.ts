import * as vscode from "vscode";
import { exec } from "child_process";

export class executor {
    public static runInTerminal(command: string, terminal: string = "arktsTools"): void {
        if (this.terminals[terminal] === undefined) {
            const existTer = this.tryGet(terminal);
            this.terminals[terminal] = typeof existTer !== 'undefined' ? existTer : vscode.window.createTerminal(terminal);
        }
        this.terminals[terminal].show();
        this.terminals[terminal].sendText(command, true);
    }

    public static exec(command: string): Promise<string> {
        return new Promise((resolve, reject) => {
            return exec(command, (error, stdout) => {
                if (error) {
                    reject(error.message);
                } else {
                    resolve(stdout);
                }
            });
        });
    }

    public static disposeTerminal(terminal: string = "arktsTools"): void {
        this.terminals[terminal].dispose();
        delete this.terminals[terminal];
    }

    private static terminals: { [id: string]: vscode.Terminal } = {};

    static tryGet(name: string) {
        const terminals = vscode.window.terminals;
        for (const terminal of terminals) {
            if (terminal.name === name) {
                return terminal;
            }
        }
        return undefined;
    }
}