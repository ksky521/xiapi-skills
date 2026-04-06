const axios = require('axios');
const config = require('./config');

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

async function queryStockData(token, q, type = 'stock') {
    const client = createClient(token);
    return post(client, '/query_stock_data', {q, type});
}


    async function getPatternStocks(token, pattern) {
    const client = createClient(token);
    return post(client, '/get_pattern_stocks', {pattern});
}

module.exports = {
    getMarketData,
    getMarketTemp,
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
    queryStockData,
<<<<<<< HEAD
    getMarketReview
=======
    getPatternStocks
>>>>>>> dc55f8784692feb918084c317fd6708b0b713eae
};
