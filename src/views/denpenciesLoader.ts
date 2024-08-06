import { client } from "../client";
import { denpenciesContent } from "../models/ohAjaxResult";

export class denpenciesLoader {
    static query(keywords: string): Promise<denpenciesContent[]> {
        return client.query(keywords);
    }

    static load(page: number): Promise<denpenciesContent[]> {
        return client.load(page);
    }

    static get denpencies() {
        return client.denpencies;
    }
}