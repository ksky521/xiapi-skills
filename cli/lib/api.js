const axios = require('axios');
const config = require('./config');
const request = require('./request');
const {formatThsVolumeTime, isTradingNow} = require('./utils');
const {calculateScores} = require('./dividendUtils');
const getFinanceReportDetail = require('./caibao');

const BASE_URL = config.get('baseUrl') || 'https://daxiapi.com';

function createClient(token) {
    return axios.create({
        baseURL: `${BASE_URL}/coze`,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        timeout: 30000
    });
}

async function get(client, path) {
    const {data} = await client.get(path);
    if (data.errCode !== 0) {
        const error = new Error(data.errMsg || `API Error: ${data.errCode}`);
        error.response = {status: data.errCode};
        throw error;
    }
    return data.data;
}

async function post(client, path, body = {}) {
    const {data} = await client.post(path, body);
    if (data.errCode !== 0) {
        const error = new Error(data.errMsg || `API Error: ${data.errCode}`);
        error.response = {status: data.errCode};
        throw error;
    }
    return data.data;
}

async function getMarketData(token) {
    const client = createClient(token);
    return get(client, '/get_index_data');
}

async function getMarketTemp(token) {
    const client = createClient(token);
    return get(client, '/get_market_temp');
}

async function getMarketStyle(token) {
    const client = createClient(token);
    return get(client, '/get_market_style');
}

async function getMarketValueData(token) {
    const client = createClient(token);
    return get(client, '/get_market_value_data');
}

async function getBkData(token) {
    const client = createClient(token);
    return get(client, '/get_bk_data');
}

async function getSectorData(token, orderBy = 'cs', limit = 5) {
    const client = createClient(token);
    return post(client, '/get_sector_data', {orderBy, lmt: limit});
}

async function getSectorRankStock(token, sectorCode, orderBy = 'cs') {
    const client = createClient(token);
    return post(client, '/get_sector_rank_stock', {sectorCode, orderBy});
}

async function getTopStocks(token) {
    const client = createClient(token);
    return post(client, '/get_top_stocks', {});
}

async function getGnHot(token, type = 'ths') {
    const client = createClient(token);
    return post(client, '/get_gn_hot', {type});
}

async function getStockData(token, codes) {
    const client = createClient(token);
    return post(client, '/get_stock_data', {code: codes});
}

async function getGainianStock(token, gnId, type = 'ths') {
    const client = createClient(token);
    return post(client, '/get_gainian_stock', {gnId, type});
}

async function getKline(token, code) {
    const client = createClient(token);
    return post(client, '/get_kline', {code});
}

async function getZdtPool(token, type = 'zt') {
    const client = createClient(token);
    return post(client, '/get_zdt_pool', {type});
}

async function getSecId(token, code) {
    const client = createClient(token);
    return post(client, '/get_sec_id', {code});
}
async function getCompassData(token, ) {
    const client = createClient(token);
    return get(client, '/get_market_compass');
}

async function queryStockData(token, q, type = 'stock') {
    const client = createClient(token);
    return post(client, '/query_stock_data', {q, type});
}

async function getPatternStocks(token, pattern) {
    const client = createClient(token);
    return post(client, '/get_pattern_stocks', {pattern});
}

async function getDividendScore(token, code) {
    if (!token || typeof token !== 'string') {
        throw new Error('Invalid token: token must be a non-empty string');
    }
    if (!code || typeof code !== 'string') {
        throw new Error('Invalid code: code must be a non-empty string');
    }

    let rawData = await axios.get(`${BASE_URL}/sk/${code}.json`);
    if (!rawData.data) {
        throw new Error('Failed to get kline data');
    }
    const klineData = rawData.data;
    const klines = klineData.k || '';
    const scores = calculateScores(
        klines.split(';').map(a => {
            const [date, open, close, high, low, volume] = a.split(',');
            return {date, close: Number(close), open: Number(open), high, low, vol: Number(volume)};
        })
    );
    const recentScores = scores.slice(-60);

    return {
        code: code,
        name: klineData.name || '未知指数',
        scores: recentScores.map(item => ({
            date: item.date,
            score: item.totalScore,
            cs: item.cs != null ? item.cs.toFixed(2) : null,
            rsi: item.rsi != null ? item.rsi.toFixed(2) : null
        }))
    };
}

async function getStockRank(type = 'hour', listType = 'normal') {
    try {
        const params = {stock_type: 'a', list_type: listType};

        if (listType === 'normal' || listType === 'skyrocket') {
            params.type = type;
        } else {
            params.type = 'day';
        }
        const response = await request.get('/fuyao/hot_list_data/out/hot_list/v1/stock', params);
        const data = extractData(response, 'stock_list');

        return data.map(a => {
            const result = {
                code: a.code,
                name: a.name,
                涨跌幅: a.rise_and_fall,
                讨论热度: a.rate,
                热榜变化: a.hot_rank_chg,
                排名: a.display_order != null ? a.display_order : a.order != null ? a.order : 0
            };

            if (listType === 'normal' || listType === 'skyrocket') {
                result.上涨原因 = a.analyse_title;
                result.上涨分析 = a.analyse
                    ?.split('\n')
                    .map(line => {
                        if (line.includes('免责声明')) {
                            return '';
                        }
                        return line.trim();
                    })
                    .filter(line => line !== '')
                    .join('\n');
            }

            return result;
        });
    } catch (err) {
        console.error('[getStockRank] 获取热股榜数据失败:', err);
        throw err;
    }
}

async function getPlateRank(type = 'concept') {
    try {
        const response = await request.get('/fuyao/hot_list_data/out/hot_list/v1/plate', {type});
        const data = extractData(response, 'plate_list');

        return data.map(d => {
            return {
                code: d.code,
                name: d.name,
                涨跌幅: d.rise_and_fall,
                对应etf涨跌幅: d.etf_rise_and_fall,
                热榜涨跌幅: d.hot_rank_chg,
                热榜标签: d.hot_tag,
                对应etf代码: d.etf_product_id,
                讨论热度: d.rate,
                对应etf名称: d.etf_name,
                tag: d.tag,
                排名: d.display_order != null ? d.display_order : d.order != null ? d.order : 0
            };
        });
    } catch (err) {
        console.error('[getPlateRank] 获取板块热榜数据失败:', err);
        throw err;
    }
}

function extractData(response, listKey) {
    if (response && response.data && response.data[listKey] && Array.isArray(response.data[listKey])) {
        return response.data[listKey];
    }
    if (Array.isArray(response)) {
        return response;
    }
    console.warn('[extractData] 未知的数据格式:', response);
    return [];
}

async function getTurnoverData(type = 'day') {
    try {
        const minuteData = await getTurnoverDataByMinute();

        const data = await request.get('/fuyao/market_analysis_api/chart/v1/get_chart_data', {
            chart_key: 'turnover_day'
        });

        if (data && data.status_code === 0 && data.data && data.data.charts) {
            const charts = data.data.charts;
            const pointList = charts.point_list;

            if (!pointList || pointList.length < 2) {
                throw new Error('数据不足');
            }

            const latest = pointList[pointList.length - 1];
            const previous = pointList[pointList.length - 2];

            const currentTurnover = latest[1];
            const prevTurnover = previous[1];
            const diff = currentTurnover - prevTurnover;
            const currentYi = currentTurnover / 100000000;
            const currentWanYi = (currentYi / 10000).toFixed(2);
            const diffYi = (Math.abs(diff) / 100000000).toFixed(2);
            const formattedData = {
                当前成交额: currentWanYi + '万亿',
                变化量: (diff > 0 ? '增加' : '减少') + diffYi + '亿',
                较上日: diff > 0 ? '增加' : '减少'
            };
            const isTrading = minuteData.isTrading;
            const rs = {};
            minuteData.header.forEach((item, index) => {
                rs[item.name] = item.val;
            });

            if (isTrading) {
                return {
                    是否正在盘中交易: isTrading ? '是' : '否',
                    ...rs,
                    minuteData
                };
            }
            return {
                ...formattedData,
                是否正在盘中交易: isTrading ? '是' : '否',
                ...rs,
                minuteData
            };
        }

        throw new Error('数据格式错误');
    } catch (err) {
        console.error('[getTurnoverData] 获取成交额数据失败:', err);
        throw err;
    }
}

async function getTurnoverDataByMinute() {
    try {
        const data = await request.get('/fuyao/market_analysis_api/chart/v1/get_chart_data', {
            chart_key: 'turnover_minute'
        });

        if (data && data.status_code === 0 && data.data && data.data.charts) {
            const charts = data.data.charts;
            const e = formatThsVolumeTime(data.data);
            const isTrading = isTradingNow(e.dataTimestamp);
            return {
                isTrading,
                name: charts.name,
                time: charts.mtime,
                header: charts.header,
                point_key_list: charts.point_key_list,
                point_list: charts.point_list,
                lines: charts.lines,
                x_label_list: charts.x_label_list
            };
        }

        throw new Error('数据格式错误');
    } catch (err) {
        console.error('[getTurnoverDataByMinute] 获取成交额数据失败:', err);
        throw err;
    }
}

function normalizeHttps(url) {
    if (!url) {
        return '';
    }
    return String(url).replace(/^http:\/\//, 'https://');
}

async function getNewsSentiment(secid, pageSize = 20) {
    const response = await axios.get('https://np-listapi.eastmoney.com/comm/web/getListInfo', {
        params: {
            client: 'web',
            biz: 'web_voice',
            mTypeAndCode: secid,
            pageSize,
            type: 1,
            req_trace: '3d4e684212bee1464c1b44611236955b',
        },
    });

    const payload = response.data || {};
    const list = payload.data?.list || [];
    return {
        pageIndex: payload.data?.page_index || 1,
        pageSize: payload.data?.page_size || pageSize,
        total: payload.data?.totle_hits || 0,
        list: list.map((item) => ({
            title: item.Art_Title,
            showTime: item.Art_ShowTime,
            artCode: item.Art_Code,
            url: normalizeHttps(item.Art_Url),
            originUrl: normalizeHttps(item.Art_OriginUrl),
        })),
    };
}

async function getNewsNotice(code, pageSize = 20, pageIndex = 1) {
    const response = await axios.get('https://np-anotice-stock.eastmoney.com/api/security/ann', {
        params: {
            sr: -1,
            page_size: pageSize,
            page_index: pageIndex,
            ann_type: 'A',
            client_source: 'web',
            stock_list: code,
            f_node: 0,
            s_node: 0,
        },
    });

    const payload = response.data || {};
    const data = payload.data || {};
    const list = data.list || [];

    return {
        pageIndex: data.page_index || pageIndex,
        pageSize: data.page_size || pageSize,
        total: data.total_hits || 0,
        list: list.map((item) => {
            const stockCode = item.codes?.[0]?.stock_code || code;
            return {
                title: item.title,
                noticeDate: item.notice_date,
                displayTime: item.display_time,
                artCode: item.art_code,
                stockCode,
                url: `https://data.eastmoney.com/notices/detail/${stockCode}/${item.art_code}.html`,
                columns: (item.columns || []).map((column) => column.column_name),
            };
        }),
    };
}

async function getNewsReport(code, pageSize = 25, pageIndex = 1, beginTime = '2026-01-01', endTime) {
    const response = await axios.get('https://reportapi.eastmoney.com/report/list', {
        params: {
            pageNo: pageIndex,
            pageSize,
            code,
            industryCode: '*',
            industry: '*',
            rating: '*',
            ratingchange: '*',
            beginTime,
            endTime,
            fields: '',
            qType: 0,
            sort: 'publishDate,desc',
        },
    });

    const payload = response.data || {};
    const list = payload.data || [];

    return {
        pageIndex: payload.pageNo || pageIndex,
        pageSize: payload.size || pageSize,
        total: payload.hits || 0,
        list: list.map((item) => ({
            title: item.title,
            stockCode: item.stockCode,
            stockName: item.stockName,
            publishDate: item.publishDate,
            orgName: item.orgName,
            rating: item.emRatingName,
            infoCode: item.infoCode,
            predictNextTwoYearEps: item.predictNextTwoYearEps,
            predictNextTwoYearPe: item.predictNextTwoYearPe,
            predictNextYearEps: item.predictNextYearEps,
            predictNextYearPe: item.predictNextYearPe,
            predictThisYearEps: item.predictThisYearEps,
            predictThisYearPe: item.predictThisYearPe,
            predictLastYearEps: item.predictLastYearEps,
            predictLastYearPe: item.predictLastYearPe,
            url: `https://data.eastmoney.com/report/info/${item.infoCode}.html`,
        })),
    };
}

module.exports = {
    getMarketData,
    getMarketTemp,
    getCompassData,
    getMarketStyle,
    getMarketValueData,
    getBkData,
    getSectorData,
    getSectorRankStock,
    getTopStocks,
    getGnHot,
    getStockData,
    getGainianStock,
    getKline,
    getZdtPool,
    getSecId,
    queryStockData,
    getPatternStocks,
    getDividendScore,
    getStockRank,
    getPlateRank,
    getTurnoverData,
    getTurnoverDataByMinute,
    getFinanceReportDetail,
    getNewsSentiment,
    getNewsNotice,
    getNewsReport,
};
