export interface ohAjaxResult {
    code: number;
    body: ajaxDenpencies;
}
export interface ajaxDenpencies {
    total: number;
    pageNum: number;
    pageSize: number;
    rows: denpenciesContent[];
    pages: number;
}
export interface denpenciesContent {
    name: string;
    description: string;
    org: string;
    packageType: string;
    authorName: string;
    authorPicUrl: string;
    latestVersion: string;
    latestPublishTime: string;
    license: string;
    keywords: string[];
    likes: number;
    points: number;
    popularity: number;
}