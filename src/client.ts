import axios from "axios";
import { $r } from "./utils";
import * as vscode from "vscode";
import { ajaxDenpencies, denpenciesContent } from "./models/ohAjaxResult";

export class client {
    private static _keywords: string;
    private static _page_count: number;
    private static _denpencies: denpenciesContent[];
    static get page_count() {
        return this._page_count;
    }
    static get denpencies() {
        return this._denpencies;
    }

    static async query(keywords?: string) {
        try {
            this._keywords = keywords ?? '';
            const url = `https://ohpm.openharmony.cn/ohpmweb/registry/oh-package/openapi/v1/search?condition=${this._keywords}&pageNum=1&pageSize=10&sortedType=relevancy&isHomePage=false`;
            const response = await axios({
                url: url,
                method: 'get',
                headers: {
                    'Origin': 'https://ohpm.openharmony.cn',
                    'Referer': 'https://ohpm.openharmony.cn'
                }
            });
            if (response.status === 200) {
                const data: ajaxDenpencies = response.data.body;
                this._page_count = data.pages;
                this._denpencies = data.rows;
                return data.rows;
            } else {
                vscode.window.showErrorMessage($r('dpLoadFailed', response.data));
                return [];
            }
        } catch (err) {
            vscode.window.showErrorMessage($r('dpLoadFailed', err));
            return [];
        }
    }

    static async load(page_num: number) {
        try {
            if (this._page_count >= page_num) {
                const url = `https://ohpm.openharmony.cn/ohpmweb/registry/oh-package/openapi/v1/search?condition=${this._keywords}&pageNum=${page_num}&pageSize=10&sortedType=relevancy&isHomePage=false`;
                const response = await axios({
                    url: url,
                    method: 'get',
                    headers: {
                        'Origin': 'https://ohpm.openharmony.cn',
                        'Referer': 'https://ohpm.openharmony.cn'
                    }
                });
                if (response.status === 200) {
                    const data: ajaxDenpencies = response.data.body;
                    this._denpencies.push(...data.rows);
                    return data.rows;
                } else {
                    vscode.window.showErrorMessage($r('dpLoadFailed', response.data));
                    return [];
                }
            } else {
                return [];
            }
        } catch (err) {
            vscode.window.showErrorMessage($r('dpLoadFailed', err));
            return [];
        }
    }
}