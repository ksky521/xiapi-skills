function getSecid(code) {
    code = String(code);
    if (code.indexOf('.') !== -1) {
        const parts = code.split('.');
        const stockCode = parts[0];
        const suffix = parts[1].toUpperCase();
        if (suffix === 'SH') {
            return `1.${stockCode}`;
        } else if (suffix === 'SZ') {
            return `0.${stockCode}`;
        }
        return code;
    }
    if (code[0] === 'B' && code[1] === 'K') {
        return '90.' + code;
    }
    if (code.length < 6) {
        return '90.BK' + ('0000' + code).slice(-4);
    }
    if (code[0] === '6' || code[0] === '5') {
        return `1.${code}`;
    }
    if (code[0].toLowerCase() === 's') {
        return code.replace(/^sh/i, '1.').replace(/^sz/i, '0.');
    }
    return `0.${code}`;
}

module.exports = {
    getSecid
};