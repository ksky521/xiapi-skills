const test = require('node:test');
const assert = require('node:assert/strict');

const {loadWithMocks, captureConsole, projectPath} = require('./helpers');

test('lib/dividendUtils computes indicators and bounded rolling scores', () => {
    const dividendUtils = require(projectPath('lib', 'dividendUtils.js'));
    const series = Array.from({length: 120}, (_, index) => ({
        date: `2024-01-${String((index % 28) + 1).padStart(2, '0')}`,
        close: 100 + index
    }));

    const ema = dividendUtils.calculateEMA(3, series.slice(0, 4));
    assert.equal(ema.cs.length, 4);
    assert.equal(typeof ema.cs[3], 'number');

    const [ma, maBias] = dividendUtils.calculateMA(3, series.slice(0, 4));
    assert.equal(ma[0], '-');
    assert.equal(maBias[1], '-');
    assert.equal(typeof ma[3], 'number');

    const rsi = dividendUtils.calculateRSI([1, 1, 1, 1, 1, 1], 2);
    assert.deepEqual(rsi.slice(0, 2), [null, null]);
    assert.equal(rsi[2], 50);

    assert.equal(dividendUtils.percentile(50, []), 0);
    assert.equal(dividendUtils.percentile(50, [1, 5, 3]), 3);
    assert.equal(dividendUtils.calculateRollingScore(null, [1, 2, 3], 5, 95), null);
    assert.equal(dividendUtils.calculateRollingScore(10, Array(12).fill(10), 5, 95), 50);
    assert.equal(dividendUtils.calculateRollingScore(1000, [1,2,3,4,5,6,7,8,9,10,11], 5, 95), 100);

    const scores = dividendUtils.calculateScores(series);
    const latest = scores[scores.length - 1];
    assert.equal(scores.length, 120);
    assert.equal(typeof latest.totalScore, 'number');
    assert.equal(typeof latest.scoreMA, 'number');
    assert.ok(latest.totalScore >= 0 && latest.totalScore <= 100);
});

function loadApiModule(overrides = {}) {
    const createCalls = [];
    const clientCalls = [];
    const requestCalls = [];
    const requestResponses = [];
    let axiosGetImpl = async () => ({data: {k: '', name: ''}});

    const axiosMock = {
        create: options => {
            createCalls.push(options);
            return {
                async get(path) {
                    clientCalls.push({method: 'get', path});
                    if (overrides.clientGetError) {
                        throw overrides.clientGetError;
                    }
                    return overrides.clientGetResponse || {data: {errCode: 0, data: {path}}};
                },
                async post(path, body) {
                    clientCalls.push({method: 'post', path, body});
                    if (overrides.clientPostError) {
                        throw overrides.clientPostError;
                    }
                    return overrides.clientPostResponse || {data: {errCode: 0, data: {path, body}}};
                }
            };
        },
        get: (...args) => axiosGetImpl(...args)
    };

    const requestMock = {
        get: async (path, params) => {
            requestCalls.push({path, params});
            if (overrides.requestError) {
                throw overrides.requestError;
            }
            if (requestResponses.length > 0) {
                return requestResponses.shift();
            }
            return overrides.requestResponse || {data: {stock_list: []}};
        }
    };

    const api = loadWithMocks(projectPath('lib', 'api.js'), {
        axios: axiosMock,
        './config': {get: key => (key === 'baseUrl' ? 'https://mocked.example' : undefined)},
        './request': requestMock,
        './utils': {
            formatThsVolumeTime: data => overrides.formattedMinuteData || {dataTimestamp: 1700000000000},
            isTradingNow: () => (overrides.isTradingNow === undefined ? false : overrides.isTradingNow)
        },
        './dividendUtils': {
            calculateScores: input => {
                if (overrides.calculateScores) {
                    return overrides.calculateScores(input);
                }
                return input.map((item, index) => ({
                    ...item,
                    totalScore: index + 1,
                    cs: 1.2345,
                    rsi: 66.789
                }));
            }
        },
        './caibao': async code => [{code, report: 'ok'}]
    });

    return {
        api,
        createCalls,
        clientCalls,
        requestCalls,
        requestResponses,
        setAxiosGet(fn) {
            axiosGetImpl = fn;
        }
    };
}

test('lib/api wraps coze endpoints with expected paths and headers', async () => {
    const {api, createCalls, clientCalls} = loadApiModule();

    await api.getMarketData('token');
    await api.getMarketTemp('token');
    await api.getMarketStyle('token');
    await api.getMarketValueData('token');
    await api.getBkData('token');
    await api.getSectorData('token', 'zdf', 9);
    await api.getSectorRankStock('token', 'BK0428', 'sm');
    await api.getTopStocks('token');
    await api.getGnHot('token', 'dfcf');
    await api.getStockData('token', ['000001']);
    await api.getGainianStock('token', 'BK0428', 'ths');
    await api.getKline('token', '000001');
    await api.getZdtPool('token', 'dt');
    await api.getSecId('token', '000001');
    await api.queryStockData('token', '平安', 'bk');
    await api.getPatternStocks('token', 'vcp');
    await api.getFinanceReportDetail('300014');

    assert.equal(createCalls[0].baseURL, 'https://mocked.example/coze');
    assert.equal(createCalls[0].headers.Authorization, 'Bearer token');
    assert.deepEqual(clientCalls.slice(0, 5), [
        {method: 'get', path: '/get_index_data'},
        {method: 'get', path: '/get_market_temp'},
        {method: 'get', path: '/get_market_style'},
        {method: 'get', path: '/get_market_value_data'},
        {method: 'get', path: '/get_bk_data'}
    ]);
    assert.deepEqual(clientCalls[5], {method: 'post', path: '/get_sector_data', body: {orderBy: 'zdf', lmt: 9}});
    assert.deepEqual(clientCalls[14], {method: 'post', path: '/query_stock_data', body: {q: '平安', type: 'bk'}});
    assert.deepEqual(await api.getFinanceReportDetail('300014'), [{code: '300014', report: 'ok'}]);
});

test('lib/api maps API errCode failures from get and post', async () => {
    const getApi = loadApiModule({clientGetResponse: {data: {errCode: 403, errMsg: 'forbidden'}}}).api;
    await assert.rejects(() => getApi.getMarketData('token'), error => {
        assert.equal(error.message, 'forbidden');
        assert.equal(error.response.status, 403);
        return true;
    });

    const postApi = loadApiModule({clientPostResponse: {data: {errCode: 429, errMsg: 'busy'}}}).api;
    await assert.rejects(() => postApi.getSectorData('token'), error => {
        assert.equal(error.message, 'busy');
        assert.equal(error.response.status, 429);
        return true;
    });
});

test('lib/api getDividendScore validates inputs and output shape', async () => {
    const {api, setAxiosGet} = loadApiModule({
        calculateScores: input =>
            input.map((item, index) => ({
                ...item,
                totalScore: index + 10,
                cs: 1.239,
                rsi: 66.666
            }))
    });

    await assert.rejects(() => api.getDividendScore('', '2.H30269'), /Invalid token/);
    await assert.rejects(() => api.getDividendScore('token', ''), /Invalid code/);

    setAxiosGet(async () => ({
        data: {
            name: '红利低波',
            k: '2024-01-01,1,2,3,0.5,100;2024-01-02,2,3,4,1.5,200'
        }
    }));

    const result = await api.getDividendScore('token', '2.H30269');
    assert.equal(result.code, '2.H30269');
    assert.equal(result.name, '红利低波');
    assert.deepEqual(result.scores, [
        {date: '2024-01-01', score: 10, cs: '1.24', rsi: '66.67'},
        {date: '2024-01-02', score: 11, cs: '1.24', rsi: '66.67'}
    ]);

    setAxiosGet(async () => ({data: null}));
    await assert.rejects(() => api.getDividendScore('token', '2.H30269'), /Failed to get kline data/);
});

test('lib/api getStockRank handles list types and strips disclaimer text', async () => {
    const {api, requestCalls} = loadApiModule({
        requestResponse: {
            data: {
                stock_list: [
                    {
                        code: '000001',
                        name: '平安银行',
                        rise_and_fall: 1.2,
                        rate: '1234',
                        hot_rank_chg: 5,
                        display_order: 1,
                        analyse_title: '上涨原因',
                        analyse: '第一行\n免责声明：仅供参考\n第二行'
                    }
                ]
            }
        }
    });

    const normalRank = await api.getStockRank('hour', 'normal');
    const trendRank = await api.getStockRank('hour', 'trend');
    assert.equal(requestCalls[0].params.type, 'hour');
    assert.equal(requestCalls[1].params.type, 'day');
    assert.equal(normalRank[0].上涨分析, '第一行\n第二行');
    assert.equal(trendRank[0].上涨原因, undefined);
});

test('lib/api getPlateRank and extractData support multiple payload shapes', async () => {
    const warn = captureConsole('warn');
    const {api} = loadApiModule({
        requestResponse: {
            data: {
                plate_list: [
                    {
                        code: 'BK0428',
                        name: '银行',
                        rise_and_fall: 1.23,
                        etf_rise_and_fall: -0.2,
                        hot_rank_chg: 2,
                        hot_tag: '连续上榜',
                        etf_product_id: '510300',
                        rate: '999',
                        etf_name: '银行ETF',
                        tag: '1家涨停',
                        display_order: 3,
                        order: 10
                    }
                ]
            }
        }
    });

    const plateRank = await api.getPlateRank('concept');
    assert.deepEqual(plateRank[0], {
        code: 'BK0428',
        name: '银行',
        涨跌幅: 1.23,
        对应etf涨跌幅: -0.2,
        热榜涨跌幅: 2,
        热榜标签: '连续上榜',
        对应etf代码: '510300',
        讨论热度: '999',
        对应etf名称: '银行ETF',
        tag: '1家涨停',
        排名: 3
    });

    const arrayApi = loadApiModule({requestResponse: [{code: '1'}]}).api;
    assert.deepEqual(await arrayApi.getPlateRank('industry'), [
        {
            code: '1',
            name: undefined,
            涨跌幅: undefined,
            对应etf涨跌幅: undefined,
            热榜涨跌幅: undefined,
            热榜标签: undefined,
            对应etf代码: undefined,
            讨论热度: undefined,
            对应etf名称: undefined,
            tag: undefined,
            排名: 0
        }
    ]);

    const emptyApi = loadApiModule({requestResponse: {foo: 'bar'}}).api;
    assert.deepEqual(await emptyApi.getPlateRank('industry'), []);
    warn.restore();
    assert.ok(warn.calls.length >= 1);
});

test('lib/api turnover helpers validate runtime branches and formatting', async () => {
    const {api, requestResponses} = loadApiModule({
        formattedMinuteData: {dataTimestamp: 1700000000000},
        isTradingNow: false
    });

    requestResponses.push(
        {
            status_code: 0,
            data: {
                charts: {
                    name: '成交额分时',
                    mtime: '10:00',
                    header: [{name: '当日成交额', val: 1000000000000}],
                    point_key_list: ['ts', 'amount'],
                    point_list: [['09:30', 100]],
                    lines: [],
                    x_label_list: ['09:30']
                }
            }
        },
        {
            status_code: 0,
            data: {
                charts: {
                    point_list: [
                        ['2024-01-01', 1000000000000],
                        ['2024-01-02', 1200000000000]
                    ]
                }
            }
        }
    );

    const turnover = await api.getTurnoverData();
    assert.equal(turnover['当前成交额'], '1.20万亿');
    assert.equal(turnover['变化量'], '增加2000.00亿');
    assert.equal(turnover['是否正在盘中交易'], '否');
    assert.equal(turnover.minuteData.name, '成交额分时');

    const tradingApi = loadApiModule({
        formattedMinuteData: {dataTimestamp: 1700000000000},
        isTradingNow: true
    });
    tradingApi.requestResponses.push(
        {
            status_code: 0,
            data: {
                charts: {
                    name: '成交额分时',
                    mtime: '10:30',
                    header: [{name: '当日成交额', val: 123}],
                    point_key_list: [],
                    point_list: [['09:30', 1]],
                    lines: [],
                    x_label_list: []
                }
            }
        },
        {
            status_code: 0,
            data: {
                charts: {
                    point_list: [
                        ['2024-01-01', 1],
                        ['2024-01-02', 2]
                    ]
                }
            }
        }
    );
    const intraday = await tradingApi.api.getTurnoverData();
    assert.equal(intraday['是否正在盘中交易'], '是');
    assert.equal(intraday['当日成交额'], 123);

    const badPointApi = loadApiModule({isTradingNow: false});
    badPointApi.requestResponses.push(
        {
            status_code: 0,
            data: {charts: {header: [], point_list: []}}
        },
        {
            status_code: 0,
            data: {charts: {point_list: [['2024-01-01', 1]]}}
        }
    );
    await assert.rejects(() => badPointApi.api.getTurnoverData(), /数据不足/);

    const badMinuteApi = loadApiModule();
    badMinuteApi.requestResponses.push({status_code: 1});
    await assert.rejects(() => badMinuteApi.api.getTurnoverDataByMinute(), /数据格式错误/);
});

test('lib/api rethrows request failures from hot lists and turnover fetches', async () => {
    const errorLog = captureConsole('error');
    const requestError = new Error('remote down');
    const failingHotApi = loadApiModule({requestError}).api;
    await assert.rejects(() => failingHotApi.getStockRank(), /remote down/);
    await assert.rejects(() => failingHotApi.getPlateRank(), /remote down/);
    await assert.rejects(() => failingHotApi.getTurnoverData(), /remote down/);
    errorLog.restore();
    assert.ok(errorLog.calls.length >= 3);
});
