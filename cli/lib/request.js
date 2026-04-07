const axios = require('axios');

const API_DOMAINS = {
    JQKA: 'https://dq.10jqka.com.cn'
};

const API_PATHS = {
    HOT_LIST: '/fuyao/hot_list_data/out/hot_list/v1',
    MARKET_ANALYSIS: '/fuyao/market_analysis/data/out/v1'
};

async function get(path, params = {}, options = {}) {
    const domain = options.domain || 'JQKA';
    const baseUrl = API_DOMAINS[domain] || API_DOMAINS.JQKA;
    const url = `${baseUrl}${path}`;

    try {
        const response = await axios.get(url, {
            params,
            timeout: 30000,
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                Referer: 'https://www.10jqka.com.cn/',
                Accept: 'application/json, text/plain, */*'
            }
        });

        return response.data;
    } catch (error) {
        if (error.response) {
            const err = new Error(`HTTP ${error.response.status}: ${error.response.statusText}`);
            err.response = error.response;
            throw err;
        }
        throw error;
    }
}

module.exports = {
    get,
    API_DOMAINS,
    API_PATHS
};
