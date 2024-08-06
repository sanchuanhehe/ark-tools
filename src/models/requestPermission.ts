export interface requestPermission {
    name: string;
    usedScene?: Record<string, string>;
    reason?: string;
}