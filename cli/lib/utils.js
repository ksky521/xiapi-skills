const isWeekday = date => {
    const t = new Date(date).getDay();
    return t >= 1 && t <= 5;
};
// 交易时间配置
const TRADING_HOURS = {
    MORNING_START: 570, // 9:30 (分钟)
    MORNING_END: 690, // 11:30
    AFTERNOON_START: 780, // 13:00
    AFTERNOON_END: 900 // 15:00
};
const isTradingTime = date => {
    const t = new Date(date);
    const n = 60 * t.getHours() + t.getMinutes();
    return (
        (n >= TRADING_HOURS.MORNING_START && n <= TRADING_HOURS.MORNING_END) ||
        (n >= TRADING_HOURS.AFTERNOON_START && n <= TRADING_HOURS.AFTERNOON_END)
    );
};

const isTradingNow = e => {
    const t = new Date();
    return !(!isWeekday(t) || !isTradingTime(t) || (null != e && e > 0 && t.valueOf() - e > 6e5));
};
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
const formatThsVolumeTime = e => {
    let t;
    let n;
    let r;
    let l;
    let a;
    let s;
    let i = (null == e || null == (t = e.charts) ? void 0 : t.point_list) || [];
    let o = (null == e || null == (n = e.charts) ? void 0 : n.header) || [];
    let c = null;
    let d = null;
    let u = null;
    let h = null;
    let m = o.find(e => 'turnover' === e.key || '当日成交额' === e.name);
    c = null != (r = null == m ? void 0 : m.val) ? r : null;
    const p = o.find(e => 'turnover_change' === e.key || '较昨日变动' === e.name);
    d = null != (l = null == p ? void 0 : p.val) ? l : null;
    const f = o.find(e => 'predict_turnover' === e.key || '预测全天成交额' === e.name);
    if (((u = null != (a = null == f ? void 0 : f.val) ? a : null), i.length > 0)) {
        const e = i[i.length - 1];
        e && (h = null != (s = e[0]) ? s : null);
    }
    return {
        currentTurnover: c,
        changeAmount: d,
        predictTurnover: u,
        dataTimestamp: h
    };
};
module.exports = {
    isWeekday,
    isTradingTime,
    isTradingNow,
    formatThsVolumeTime,
    getSecid
};
