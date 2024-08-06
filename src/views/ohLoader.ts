import { dependencie } from "../models/ohosFile";
import { PackageMessage } from "../models/uiMessage";

export class ohLoader {
    private readonly pgFilePath: string;
    constructor(pgFilePath: string) {
        this.pgFilePath = pgFilePath;
    }

    loadFile() {

    }

    getPackages(): dependencie[] {
        return [];
    }

    applyNow() {

    }

    addNode(messgae: PackageMessage) {

    }

    updateNode(messgae: PackageMessage) {

    }

    rmeoveNode(messgae: PackageMessage) {

    }
}