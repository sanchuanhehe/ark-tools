import { client } from "../client";
import { denpenciesContent } from "../models/ohAjaxResult";

export class denpenciesLoader {
    static async query(keywords: string): Promise<denpenciesContent[]> {
        return await client.query(keywords);
    }

    static async load(page: number): Promise<denpenciesContent[]> {
        return await client.load(page);
    }

    static get denpencies() {
        return client.denpencies;
    }
}