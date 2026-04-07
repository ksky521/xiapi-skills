class S {
    constructor(startTime, base_fileds = [4, 4, 4, 4, 1, 1, 1, 3, 2, 2, 2, 2, 2, 2, 2, 4, 2, 1]) {
        let endTime;
        if (startTime && startTime > 10000000) {
            endTime = startTime + 3600 * 3;
        } else {
            const now = new Date();
            const date = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
            const s = Date.parse(`${date} ${now.getHours()}:03:23`) / 1000;
            startTime = parseInt(s, 10);
            endTime = parseInt(s + 3600 * 3, 10);
        }
        const data = {
            0: 33554944,
            1: startTime,
            2: endTime,
            3: 3086956040,
            4: 7,
            5: 10,
            6: 0,
            7: 0,
            8: 0,
            9: 0,
            10: 0,
            11: 0,
            12: 0,
            13: 4064,
            14: 0,
            15: 0,
            16: 0,
            17: 3
        };
        for (let n = 0, t = base_fileds.length; t > n; n++) {
            this[n] = data[n];
        }
        this.base_fileds = base_fileds;
    }
    random() {
        return (Math.random() * parseInt(4294967295, 10)) >>> 0;
    }
    toBuffer() {
        for (var r = this.base_fileds, n = [], t = -1, e = 0, a = r.length; a > e; e++) {
            for (let u = this[e], f = r[e], d = (t += f); (n[d] = u & parseInt('11111111', 2)), --f != 0; ) {
                --d;
                u >>= parseInt(10, 8);
            }
        }
        return n;
    }
    getSession() {
        let r = this.toBuffer();
        return this.encode(r);
    }
    encode(r) {
        let n = T(r);
        let t = [2, n];
        P(r, 0, t, 2, n);
        return N(t);
    }

    decodeBuffer(r) {
        let n = dr;
        let t = this.base_fileds;
        let e = 0;
        n = B;
        for (let a = 0, o = t.length; o > a; a++) {
            let i = t[a];
            let u = 0;
            do {
                u = (u << parseInt(1000, 2)) + r[e++];
            } while (--i > 0);
            this[a] = u >>> 0;
        }
    }
    strhash(t) {
        for (var o = 0, i = 0, u = t.length; u > i; i++) {
            ((o = (o << 5) - o + t.charCodeAt(i)), (o >>>= 0));
        }
        return o;
    }
    updateServerTime(stime, ua) {
        // """更新服务器时间"""
        const ts = parseInt(Date.now() / 1000, 10);
        const random = parseInt(this.random(), 10);
        this[0] = random;
        this[1] = parseInt(stime, 10);
        this[2] = ts;
        this[3] = this.strhash(ua);
        return this.getSession();
    }
}

function T(r) {
    for (var n = 0, t = 0, e = r.length; e > t; t++) {
        n = (n << 5) - n + r[t];
    }
    return n & 255;
}

function P(r, n, t, e, a) {
    for (let f = r.length; f > n; ) {
        t[e++] = r[n++] ^ (a & 255);
        a = ~(a * parseInt(203, 8));
    }
}

function N(r) {
    const S = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    for (var E = 0, A = r.length, b = []; A > E; ) {
        let B = (r[E++] << parseInt('10000', 2)) | (r[E++] << 8) | r[E++];
        b.push(
            S.charAt(B >> parseInt('10010', 2)),
            S.charAt((B >> parseInt('14', 8)) & parseInt('77', 8)),
            S.charAt((B >> 6) & parseInt('3f', 16)),
            S.charAt(B & parseInt('3f', 16))
        );
    }
    return b.join('');
}
const s = new S();

const getHeader = (options = {}) => {
    let headers = {
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7',
        Pragma: 'no-cache',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        'Cache-Control': 'no-cache',
        'Upgrade-Insecure-Requests': '1',
        Referer: 'https://basic.10jqka.com.cn/601633',
        'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
        ...options
    };
    const ss = s.updateServerTime(parseInt(Date.now() / 1000, 10), headers['User-Agent']);
    headers.Cookie = `v=${ss}`;
    return headers;
};
module.exports = {
    getHeader
};
// const s = new S();
// console.log(s.getSession());
// AnR2o5Q9lSuShAFn00OHkARhQznmTZg32nEsew7VAP-CeRsjNl1oxyqB_Apd
// AkhKJwjh3Gs-RbDvsuvGsWTNGrVa8az7jlWAfwL5lEO23epHqgF8i95lUA9Q
// 2,0,2,0,93,140,24,229,93,140,122,126,183,255,54,8,7,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,15,224,0,0,0,0,0,0,0,1,3
// 2,0,2,0,93,140,24,229,93,140,123,170,183,255,54,8,7,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,15,224,0,0,0,0,0,0,0,1,3
// 2,0,2,0,93,140,24,229,93,140,123,44,183,255,54,8,7,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,15,224,0,0,0,0,0,0,0,1,3
// 2,0,2,0,93,140,24,229,93,140,124,95,183,255,54,8,7,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,15,224,0,0,0,0,0,0,0,1,3
