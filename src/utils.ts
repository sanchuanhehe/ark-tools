export function isEmpty(obj: any) {
    if (typeof obj === 'undefined' || obj == null)
        return true;
    if (Number.isNaN(obj))
        return true;
    if (typeof obj === 'string' && obj.trim() === '')
        return true;
    return false;
}

export function objToBuffer(obj: any) {
    let json = JSON.stringify(obj);
    return Buffer.from(json, 'utf8');
}