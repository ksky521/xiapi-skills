const test = require('node:test');
const assert = require('node:assert/strict');

const {loadWithMocks, captureConsole, projectPath} = require('./helpers');

test('lib/config masks token and respects env override', () => {
    class ConfMock {
        constructor(options) {
            this.options = options;
            this.store = {token: 'persisted-token', baseUrl: 'https://example.com'};
        }
        get(key) {
            return this.store[key];
        }
        set(key, value) {
            this.store[key] = value;
        }
        delete(key) {
            delete this.store[key];
        }
    }

    delete process.env.DAXIAPI_TOKEN;
    const config = loadWithMocks(projectPath('lib', 'config.js'), {conf: ConfMock});
    assert.equal(config.getToken(), 'persisted-token');
    assert.equal(config.get('baseUrl'), 'https://example.com');

    config.set('token', 'new-token');
    assert.equal(config.getToken(), 'new-token');
    assert.deepEqual(config.getAll(), {token: '******oken', baseUrl: 'https://example.com'});

    process.env.DAXIAPI_TOKEN = 'env-token';
    assert.equal(config.getToken(), 'env-token');
    assert.deepEqual(config.getAll(), {token: '******oken', baseUrl: 'https://example.com'});

    config.delete('token');
    delete process.env.DAXIAPI_TOKEN;
    assert.equal(config.getToken(), undefined);
});

test('lib/error prints status, network and parameter guidance', () => {
    const chalk = {
        red: {bold: value => value},
        bold: value => value
    };
    const {handleError, createParameterError} = loadWithMocks(projectPath('lib', 'error.js'), {chalk});
    const log = captureConsole('log');

    handleError({message: '401 error', response: {status: 401}});
    handleError({message: 'network', code: 'ENOTFOUND'});
    handleError(createParameterError('参数无效', ['detail-1'], ['example-1']));
    log.restore();

    const flatLogs = log.calls.map(args => args.join(' ')).join('\n');
    assert.match(flatLogs, /检查 Token 是否正确配置/);
    assert.match(flatLogs, /检查网络连接是否正常/);
    assert.match(flatLogs, /detail-1/);
    assert.match(flatLogs, /example-1/);
});

test('lib/output validates dividend formatting and passthrough output', () => {
    const outputModule = loadWithMocks(projectPath('lib', 'output.js'), {
        '@toon-format/toon': {encode: value => `toon:${JSON.stringify(value)}`}
    });
    assert.equal(outputModule.encode({foo: 'bar'}), 'toon:{"foo":"bar"}');

    const log = captureConsole('log');
    outputModule.output({
        code: '2.H30269',
        name: '红利低波',
        scores: [{date: '2024-01-01', score: 88, cs: '1.11', rsi: '55.00'}]
    });
    outputModule.output({
        code: '2.H30269',
        scores: [{date: '2024-01-02', score: 0, cs: '', rsi: null}]
    });
    outputModule.output({foo: 'bar'});
    log.restore();

    const lines = log.calls.map(call => call[0]);
    assert.equal(lines[0], '查询到红利低波(2.H30269)的最近60个交易日打分情况：');
    assert.ok(lines.includes('```toon'));
    assert.ok(lines.includes('[60]{"日期","分数","cs值","rsi值"}:'));
    assert.ok(lines.includes('  2024-01-01,88,1.11,55.00'));
    assert.ok(lines.includes('查询到2.H30269(2.H30269)的最近60个交易日打分情况：'));
    assert.ok(lines.includes('  2024-01-02,-,-,-'));
    assert.deepEqual(lines[lines.length - 1], {foo: 'bar'});
});

test('lib/request uses default domain, custom domain and maps HTTP errors', async () => {
    const calls = [];
    const axiosMock = {
        get: async (url, options) => {
            calls.push({url, options});
            return {data: {ok: true, url}};
        }
    };
    const request = loadWithMocks(projectPath('lib', 'request.js'), {axios: axiosMock});

    const defaultData = await request.get('/path', {foo: 'bar'});
    const customData = await request.get('/path', {}, {domain: 'UNKNOWN'});
    assert.deepEqual(defaultData, {ok: true, url: 'https://dq.10jqka.com.cn/path'});
    assert.deepEqual(customData, {ok: true, url: 'https://dq.10jqka.com.cn/path'});
    assert.equal(calls[0].options.params.foo, 'bar');
    assert.equal(calls[0].options.headers.Referer, 'https://www.10jqka.com.cn/');

    const failingRequest = loadWithMocks(projectPath('lib', 'request.js'), {
        axios: {
            get: async () => {
                const error = new Error('bad');
                error.response = {status: 502, statusText: 'Bad Gateway'};
                throw error;
            }
        }
    });
    await assert.rejects(() => failingRequest.get('/bad'), /HTTP 502: Bad Gateway/);

    const genericFailure = loadWithMocks(projectPath('lib', 'request.js'), {
        axios: {
            get: async () => {
                throw new Error('offline');
            }
        }
    });
    await assert.rejects(() => genericFailure.get('/offline'), /offline/);
});

test('lib/utils covers trading helpers and secid conversion branches', () => {
    const utils = require(projectPath('lib', 'utils.js'));

    assert.equal(utils.isWeekday('2024-01-08T10:00:00Z'), true);
    assert.equal(utils.isWeekday('2024-01-07T10:00:00Z'), false);
    assert.equal(utils.isTradingTime('2024-01-08T01:35:00Z'), true);
    assert.equal(utils.isTradingTime('2024-01-08T04:00:00Z'), false);

    const RealDate = Date;
    global.Date = class extends RealDate {
        constructor(...args) {
            if (args.length === 0) {
                return new RealDate('2024-01-08T02:00:00Z');
            }
            return new RealDate(...args);
        }
        static now() {
            return new RealDate('2024-01-08T02:00:00Z').valueOf();
        }
    };

    assert.equal(utils.isTradingNow(new RealDate('2024-01-08T01:55:00Z').valueOf()), true);
    assert.equal(utils.isTradingNow(new RealDate('2024-01-08T01:45:00Z').valueOf()), false);
    global.Date = RealDate;

    assert.equal(utils.getSecid('600000'), '1.600000');
    assert.equal(utils.getSecid('000001'), '0.000001');
    assert.equal(utils.getSecid('sh000001'), '1.000001');
    assert.equal(utils.getSecid('SZ000001'), '0.000001');
    assert.equal(utils.getSecid('BK0428'), '90.BK0428');
    assert.equal(utils.getSecid('428'), '90.BK0428');
    assert.equal(utils.getSecid('600000.SH'), '1.600000');
    assert.equal(utils.getSecid('000001.SZ'), '0.000001');
    assert.equal(utils.getSecid('custom.code'), 'custom.code');

    assert.deepEqual(
        utils.formatThsVolumeTime({
            charts: {
                header: [
                    {key: 'turnover', val: 100},
                    {name: '较昨日变动', val: -5},
                    {key: 'predict_turnover', val: 200}
                ],
                point_list: [['09:30', 1], ['10:00', 2]]
            }
        }),
        {
            currentTurnover: 100,
            changeAmount: -5,
            predictTurnover: 200,
            dataTimestamp: '10:00'
        }
    );

    assert.deepEqual(utils.formatThsVolumeTime({}), {
        currentTurnover: null,
        changeAmount: null,
        predictTurnover: null,
        dataTimestamp: null
    });
});

test('lib/thsUtils and lib/iconv expose expected output format', () => {
    const realRandom = Math.random;
    const realNow = Date.now;
    Math.random = () => 0.123456789;
    Date.now = () => 1700000000000;

    const {getHeader} = require(projectPath('lib', 'thsUtils.js'));
    const headers = getHeader({Referer: 'https://custom.example', Foo: 'bar'});
    Math.random = realRandom;
    Date.now = realNow;

    assert.equal(headers.Referer, 'https://custom.example');
    assert.equal(headers.Foo, 'bar');
    assert.match(headers.Cookie, /^v=/);
    assert.match(headers['User-Agent'], /Mozilla/);

    const iconv = loadWithMocks(projectPath('lib', 'iconv.js'), {
        'iconv-lite': {
            decode: (buffer, encoding) => Buffer.from(`${encoding}:${buffer.toString('utf8')}`)
        }
    });
    assert.equal(iconv('hello', 'utf8'), 'utf8:hello');
    assert.equal(iconv(Buffer.from('world'), 'utf8'), 'utf8:world');
});

test('lib/caibao parses finance page payload into row objects', async () => {
    const axiosCalls = [];
    const getDetail = loadWithMocks(projectPath('lib', 'caibao.js'), {
        axios: {
            get: async (url, options) => {
                axiosCalls.push({url, options});
                return {data: Buffer.from('html-content')};
            }
        },
        '@ksky521/html-picker': (html, config) => {
            assert.equal(html, 'decoded-html');
            config.data.handler({
                html() {
                    return JSON.stringify({
                        title: ['报告期', ['营业收入']],
                        report: [
                            ['2024Q1', '2023Q4'],
                            ['100亿', '90亿']
                        ]
                    });
                }
            });
        },
        './iconv': () => 'decoded-html',
        './thsUtils': {getHeader: options => ({Cookie: 'v=token', ...options})}
    });

    const reports = await getDetail('300014');
    assert.equal(axiosCalls[0].url, 'http://basic.10jqka.com.cn/300014/finance.html');
    assert.equal(axiosCalls[0].options.responseType, 'arraybuffer');
    assert.deepEqual(reports, [
        {报告期: '2024Q1', 营业收入: '100亿'},
        {报告期: '2023Q4', 营业收入: '90亿'}
    ]);
});
