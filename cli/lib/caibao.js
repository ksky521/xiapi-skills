// http://basic.10jqka.com.cn/300014/
// const vm = require('vm');

// ?ut=&invt=2&fltt=2&fields=&secid=1.600862&cb=&_=1601168994587
const axios = require('axios');
const picker = require('@ksky521/html-picker');
const iconv = require('./iconv');

const {getHeader} = require('./thsUtils');

const API_URL = 'http://basic.10jqka.com.cn/';

async function getDetail(stockId) {
    const prefix = `${API_URL}${stockId}`;
    const url = `${prefix}/finance.html`;
    const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: getHeader({Referrer: prefix})
    });

    const html = iconv(response.data);
    let rs = {};
    picker(html, {
        data: {
            selector: 'p#main',
            handler($node) {
                rs = JSON.parse($node.html());
            }
        }
    });
    const titles = rs.title;
    const content = rs.report;
    const reports = [];
    for (let index = 0; index < content[0].length; index++) {
        const report = {};
        for (let i = 0; i < titles.length; i++) {
            let title = titles[i];
            if (typeof title === 'string') {
                title = title.trim();
            } else if (Array.isArray(title)) {
                title = title[0];
            }
            if (content[index]) {
                report[title] = content[i][index];
            } else {
                // console.log(report[title]);
            }
        }
        if (Object.keys(report).length > 0) {
            reports.push(report);
        }
    }

    return reports;
}

module.exports = getDetail;
// if (require.main === module) {
//     // getDetail('300014').then(data => console.log(data));
//     // getDetail('600036').then(data => {
//     //     const title = data.title;
//     //     const content = data.simple;
//     //     console.log(data.title[13], content[13]);
//     // });
//     // getDetail('601633').then(data => console.log(data));
// }
