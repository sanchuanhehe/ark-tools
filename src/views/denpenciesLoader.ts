import { dependencie } from "../models/ohosFile";

export class denpenciesLoader {
    static query(keywords: string): Promise<dependencie[]> {
        return Promise.resolve([]);
    }

    static load(page: number): Promise<dependencie[]> {
        return Promise.resolve([]);
    }
}