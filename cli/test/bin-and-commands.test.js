const test = require('node:test');
const assert = require('node:assert/strict');

const {
    loadWithMocks,
    createProgramMock,
    getCommand,
    captureConsole,
    createExitStub,
    projectPath
} = require('./helpers');

function createSharedMocks(overrides = {}) {
    const apiCalls = [];
    const outputCalls = [];
    const errorCalls = [];
    const configState = {
        token: 'token-123',
        all: {token: '******0123', baseUrl: 'https://daxiapi.com'}
    };

    const api = {
        getDividendScore: async (...args) => {
            apiCalls.push(['getDividendScore', ...args]);
            return {code: args[1], scores: [{date: '2024-01-01', score: 88, cs: '1.20', rsi: '60.00'}]};
        },
        getStockRank: async (...args) => {
            apiCalls.push(['getStockRank', ...args]);
            return [{code: '000001', name: '平安银行'}];
        },
        getPlateRank: async (...args) => {
            apiCalls.push(['getPlateRank', ...args]);
            return [{code: 'BK0428', name: '银行'}];
        },
        getKline: async (...args) => {
            apiCalls.push(['getKline', ...args]);
            return [{date: '2024-01-01', close: 10.2}];
        },
        getMarketData: async (...args) => {
            apiCalls.push(['getMarketData', ...args]);
            return [{code: '000001', name: '上证指数'}];
        },
        getMarketTemp: async (...args) => {
            apiCalls.push(['getMarketTemp', ...args]);
            return {temperature: 55};
        },
        getMarketStyle: async (...args) => {
            apiCalls.push(['getMarketStyle', ...args]);
            return {style: 'small-cap'};
        },
        getMarketValueData: async (...args) => {
            apiCalls.push(['getMarketValueData', ...args]);
            return [{code: '000922', pe: 12.3}];
        },
        getFinanceReportDetail: async (...args) => {
            apiCalls.push(['getFinanceReportDetail', ...args]);
            return [{报告期: '2024Q1', 营收: '100亿'}];
        },
        queryStockData: async (...args) => {
            apiCalls.push(['queryStockData', ...args]);
            return [{code: '000001', name: '平安银行', type: 'stock'}];
        },
        getSectorData: async (...args) => {
            apiCalls.push(['getSectorData', ...args]);
            return [{name: '银行', cs: 12.3, zdf: 1.2}];
        },
        getBkData: async (...args) => {
            apiCalls.push(['getBkData', ...args]);
            return [{name: '银行', zdf: 1.2}];
        },
        getSectorRankStock: async (...args) => {
            apiCalls.push(['getSectorRankStock', ...args]);
            return [{code: '000001', name: '平安银行', cs: 12.3}];
        },
        getTopStocks: async (...args) => {
            apiCalls.push(['getTopStocks', ...args]);
            return [{code: '300750', name: '宁德时代'}];
        },
        getGnHot: async (...args) => {
            apiCalls.push(['getGnHot', ...args]);
            return [{name: '人工智能', qd: 80}];
        },
        getStockData: async (...args) => {
            apiCalls.push(['getStockData', ...args]);
            return [{code: '000001', name: '平安银行', zdf: 1.2}];
        },
        getGainianStock: async (...args) => {
            apiCalls.push(['getGainianStock', ...args]);
            return [{code: '300750', name: '宁德时代'}];
        },
        getPatternStocks: async (...args) => {
            apiCalls.push(['getPatternStocks', ...args]);
            return [{code: '000001', name: '平安银行', pattern: args[1]}];
        },
        getTurnoverData: async (...args) => {
            apiCalls.push(['getTurnoverData', ...args]);
            return {当前成交额: '1.20万亿', 是否正在盘中交易: '否'};
        },
        getZdtPool: async (...args) => {
            apiCalls.push(['getZdtPool', ...args]);
            return [{code: '000001', type: args[1]}];
        }
    };

    const mocks = {
        '../lib/config': {
            getToken: () => configState.token,
            set: (key, value) => {
                configState[key] = value;
            },
            getAll: () => configState.all,
            delete: key => {
                configState.deleted = key;
            }
        },
        '../lib/api': api,
        '../lib/error': {
            handleError: error => {
                errorCalls.push(error);
            },
            createParameterError: (message, details, examples) => {
                const error = new Error(message);
                error.details = details;
                error.examples = examples;
                return error;
            }
        },
        '../lib/output': {
            output: data => {
                outputCalls.push(data);
            },
            encode: data => JSON.stringify(data)
        },
        '../lib/utils': {
            getSecid: code => ({input: code, secid: `secid:${code}`})
        },
        ...overrides
    };

    return {mocks, apiCalls, outputCalls, errorCalls, configState};
}

function assertExitError(error) {
    assert.match(String(error.message), /process\.exit:1/);
    return true;
}

test('bin/index registers all commands and parses argv', () => {
    const program = createProgramMock();
    const invoked = [];
    const commandModules = {};

    ['config', 'market', 'sector', 'stock', 'kline', 'zdt', 'secid', 'search', 'dividend', 'hotrank', 'turnover', 'report'].forEach(
        name => {
            commandModules[`../commands/${name}`] = currentProgram => {
                invoked.push({name, currentProgram});
            };
        }
    );

    loadWithMocks(projectPath('bin', 'index.js'), {
        commander: {program},
        '../package.json': {version: '9.9.9'},
        ...commandModules
    });

    assert.equal(program.commandName, 'daxiapi');
    assert.equal(program.aliasValue, 'dxp');
    assert.equal(program.versionValue, '9.9.9');
    assert.deepEqual(
        invoked.map(item => item.name),
        ['config', 'market', 'sector', 'stock', 'kline', 'zdt', 'secid', 'search', 'dividend', 'hotrank', 'turnover', 'report']
    );
    assert.ok(invoked.every(item => item.currentProgram === program));
    assert.ok(Array.isArray(program.parsedArgv));
});

test('config command handles set/get/delete and validation errors', async t => {
    const {mocks, errorCalls, configState} = createSharedMocks();
    const program = createProgramMock();
    loadWithMocks(projectPath('commands', 'config.js'), mocks)(program);

    const log = captureConsole('log');
    t.after(() => log.restore());

    await getCommand(program, 'config set').actionFn('token', 'abc');
    await getCommand(program, 'config get').actionFn();
    await getCommand(program, 'config delete').actionFn('token');

    assert.equal(configState.token, 'abc');
    assert.equal(configState.deleted, 'token');
    assert.equal(log.calls[0][0], '✓ token 已设置');
    assert.equal(log.calls[1][0], JSON.stringify(configState.all, null, 2));
    assert.equal(log.calls[2][0], '✓ token 已删除');

    const exitStub = createExitStub();
    t.after(() => exitStub.restore());

    assert.throws(() => getCommand(program, 'config set').actionFn('', ''), assertExitError);
    assert.throws(() => getCommand(program, 'config delete').actionFn(''), assertExitError);
    assert.equal(errorCalls.length, 2);
    assert.equal(exitStub.calls.length, 2);
});

test('dividend command validates token and outputs score payload', async t => {
    const {mocks, apiCalls, outputCalls, errorCalls, configState} = createSharedMocks();
    const program = createProgramMock();
    loadWithMocks(projectPath('commands', 'dividend.js'), mocks)(program);

    await getCommand(program, 'dividend score').actionFn({code: '2.H30269'});
    assert.deepEqual(apiCalls[0], ['getDividendScore', 'token-123', '2.H30269']);
    assert.deepEqual(outputCalls[0], {code: '2.H30269', scores: [{date: '2024-01-01', score: 88, cs: '1.20', rsi: '60.00'}]});

    configState.token = '';
    const exitStub = createExitStub();
    t.after(() => exitStub.restore());
    await assert.rejects(() => getCommand(program, 'dividend score').actionFn({code: '2.H30269'}), assertExitError);
    assert.equal(errorCalls.length, 1);
});

test('hotrank commands format toon output and handle failures', async t => {
    const {mocks, apiCalls, errorCalls} = createSharedMocks();
    const program = createProgramMock();
    loadWithMocks(projectPath('commands', 'hotrank.js'), mocks)(program);

    const log = captureConsole('log');
    t.after(() => log.restore());

    await getCommand(program, 'hotrank stock').actionFn({type: 'day', listType: 'trend'});
    await getCommand(program, 'hotrank concept').actionFn();
    await getCommand(program, 'hotrank board').actionFn({type: 'industry'});

    assert.deepEqual(apiCalls.slice(0, 3), [
        ['getStockRank', 'day', 'trend'],
        ['getPlateRank', 'concept'],
        ['getPlateRank', 'industry']
    ]);
    assert.equal(log.calls[0][0], '```toon\n[{"code":"000001","name":"平安银行"}]\n```');
    assert.equal(log.calls[1][0], '```toon\n[{"code":"BK0428","name":"银行"}]\n```');
    assert.equal(log.calls[2][0], '```toon\n[{"code":"BK0428","name":"银行"}]\n```');

    const failing = createSharedMocks({
        '../lib/api': {
            ...createSharedMocks().mocks['../lib/api'],
            getStockRank: async () => {
                throw new Error('boom');
            },
            getPlateRank: async () => {
                throw new Error('plate boom');
            }
        }
    });
    const failingProgram = createProgramMock();
    loadWithMocks(projectPath('commands', 'hotrank.js'), failing.mocks)(failingProgram);
    const exitStub = createExitStub();
    t.after(() => exitStub.restore());
    await assert.rejects(() => getCommand(failingProgram, 'hotrank stock').actionFn({type: 'hour', listType: 'normal'}), assertExitError);
    await assert.rejects(() => getCommand(failingProgram, 'hotrank concept').actionFn(), assertExitError);
    await assert.rejects(() => getCommand(failingProgram, 'hotrank board').actionFn({type: 'industry'}), assertExitError);
    assert.equal(failing.errorCalls.length, 3);
    assert.equal(exitStub.calls.length, 3);
    assert.equal(errorCalls.length, 0);
});

test('kline command checks token and code before requesting data', async t => {
    const {mocks, apiCalls, outputCalls, errorCalls, configState} = createSharedMocks();
    const program = createProgramMock();
    loadWithMocks(projectPath('commands', 'kline.js'), mocks)(program);

    await getCommand(program, 'kline').actionFn('000001');
    assert.deepEqual(apiCalls[0], ['getKline', 'token-123', '000001']);
    assert.deepEqual(outputCalls[0], [{date: '2024-01-01', close: 10.2}]);

    const exitStub = createExitStub();
    t.after(() => exitStub.restore());

    await assert.rejects(() => getCommand(program, 'kline').actionFn(''), assertExitError);
    configState.token = '';
    await assert.rejects(() => getCommand(program, 'kline').actionFn('000001'), assertExitError);
    assert.equal(errorCalls.length, 2);
});

test('market commands call corresponding API methods with structured data', async t => {
    const {mocks, apiCalls, outputCalls, errorCalls, configState} = createSharedMocks();
    const program = createProgramMock();
    loadWithMocks(projectPath('commands', 'market.js'), mocks)(program);

    await getCommand(program, 'market index').actionFn();
    await getCommand(program, 'market temp').actionFn();
    await getCommand(program, 'market style').actionFn();
    await getCommand(program, 'market value').actionFn();

    assert.deepEqual(apiCalls, [
        ['getMarketData', 'token-123'],
        ['getMarketTemp', 'token-123'],
        ['getMarketStyle', 'token-123'],
        ['getMarketValueData', 'token-123']
    ]);
    assert.deepEqual(outputCalls, [
        [{code: '000001', name: '上证指数'}],
        {temperature: 55},
        {style: 'small-cap'},
        [{code: '000922', pe: 12.3}]
    ]);

    configState.token = '';
    const exitStub = createExitStub();
    t.after(() => exitStub.restore());
    await assert.rejects(() => getCommand(program, 'market index').actionFn(), assertExitError);
    await assert.rejects(() => getCommand(program, 'market temp').actionFn(), assertExitError);
    await assert.rejects(() => getCommand(program, 'market style').actionFn(), assertExitError);
    await assert.rejects(() => getCommand(program, 'market value').actionFn(), assertExitError);
    assert.equal(errorCalls.length, 4);
});

test('report command wraps finance detail as toon output and validates code', async t => {
    const {mocks, apiCalls, errorCalls} = createSharedMocks();
    const program = createProgramMock();
    loadWithMocks(projectPath('commands', 'report.js'), mocks)(program);

    const log = captureConsole('log');
    t.after(() => log.restore());

    await getCommand(program, 'report finance').actionFn('300014');
    assert.deepEqual(apiCalls[0], ['getFinanceReportDetail', '300014']);
    assert.equal(log.calls[0][0], '```toon\n[{"报告期":"2024Q1","营收":"100亿"}]\n```');

    const exitStub = createExitStub();
    t.after(() => exitStub.restore());
    await assert.rejects(() => getCommand(program, 'report finance').actionFn(''), assertExitError);
    assert.equal(errorCalls.length, 1);
});

test('search and secid commands validate data formatting', async t => {
    const shared = createSharedMocks();
    const searchProgram = createProgramMock();
    loadWithMocks(projectPath('commands', 'search.js'), shared.mocks)(searchProgram);
    await getCommand(searchProgram, 'search').actionFn('平安', {type: 'bk'});
    assert.deepEqual(shared.apiCalls[0], ['queryStockData', 'token-123', '平安', 'bk']);
    assert.deepEqual(shared.outputCalls[0], [{code: '000001', name: '平安银行', type: 'stock'}]);

    const secidShared = createSharedMocks();
    const secidProgram = createProgramMock();
    loadWithMocks(projectPath('commands', 'secid.js'), secidShared.mocks)(secidProgram);
    await getCommand(secidProgram, 'secid').actionFn('BK0428');
    assert.deepEqual(secidShared.outputCalls[0], {input: 'BK0428', secid: 'secid:BK0428'});

    const exitStub = createExitStub();
    t.after(() => exitStub.restore());
    await assert.rejects(() => getCommand(searchProgram, 'search').actionFn('', {type: 'stock'}), assertExitError);
    await assert.rejects(() => getCommand(secidProgram, 'secid').actionFn(''), assertExitError);
});

test('sector commands cover each subcommand and invalid type branch', async t => {
    const {mocks, apiCalls, outputCalls, errorCalls, configState} = createSharedMocks();
    const program = createProgramMock();
    loadWithMocks(projectPath('commands', 'sector.js'), mocks)(program);

    await getCommand(program, 'sector heatmap').actionFn({order: 'zdf', limit: 8});
    await getCommand(program, 'sector bk').actionFn();
    await getCommand(program, 'sector stocks').actionFn({code: 'BK0428', order: 'sm'});
    await getCommand(program, 'sector top').actionFn();
    await getCommand(program, 'sector gn').actionFn({type: 'ths'});

    assert.deepEqual(apiCalls, [
        ['getSectorData', 'token-123', 'zdf', 8],
        ['getBkData', 'token-123'],
        ['getSectorRankStock', 'token-123', 'BK0428', 'sm'],
        ['getTopStocks', 'token-123'],
        ['getGnHot', 'token-123', 'ths']
    ]);
    assert.deepEqual(outputCalls, [
        [{name: '银行', cs: 12.3, zdf: 1.2}],
        [{name: '银行', zdf: 1.2}],
        [{code: '000001', name: '平安银行', cs: 12.3}],
        [{code: '300750', name: '宁德时代'}],
        [{name: '人工智能', qd: 80}]
    ]);

    const exitStub = createExitStub();
    t.after(() => exitStub.restore());
    await assert.rejects(() => getCommand(program, 'sector gn').actionFn({type: 'bad'}), assertExitError);

    configState.token = '';
    await assert.rejects(() => getCommand(program, 'sector heatmap').actionFn({order: 'cs', limit: 5}), assertExitError);
    await assert.rejects(() => getCommand(program, 'sector bk').actionFn(), assertExitError);
    await assert.rejects(() => getCommand(program, 'sector stocks').actionFn({code: 'BK0428', order: 'cs'}), assertExitError);
    await assert.rejects(() => getCommand(program, 'sector top').actionFn(), assertExitError);
    await assert.rejects(() => getCommand(program, 'sector gn').actionFn({type: 'ths'}), assertExitError);
    assert.equal(errorCalls.length, 6);
});

test('stock commands validate info, gn and pattern branches', async t => {
    const {mocks, apiCalls, outputCalls, errorCalls, configState} = createSharedMocks();
    const program = createProgramMock();
    loadWithMocks(projectPath('commands', 'stock.js'), mocks)(program);

    await getCommand(program, 'stock info').actionFn(['000001', '600031']);
    await getCommand(program, 'stock gn').actionFn('BK0428', {type: 'dfcf'});
    await getCommand(program, 'stock pattern').actionFn('vcp');

    assert.deepEqual(apiCalls, [
        ['getStockData', 'token-123', ['000001', '600031']],
        ['getGainianStock', 'token-123', 'BK0428', 'dfcf'],
        ['getPatternStocks', 'token-123', 'vcp']
    ]);
    assert.deepEqual(outputCalls, [
        [{code: '000001', name: '平安银行', zdf: 1.2}],
        [{code: '300750', name: '宁德时代'}],
        [{code: '000001', name: '平安银行', pattern: 'vcp'}]
    ]);

    const exitStub = createExitStub();
    t.after(() => exitStub.restore());
    await assert.rejects(() => getCommand(program, 'stock info').actionFn([]), assertExitError);
    await assert.rejects(() => getCommand(program, 'stock gn').actionFn('', {type: 'ths'}), assertExitError);
    await assert.rejects(() => getCommand(program, 'stock gn').actionFn('BK0428', {type: 'bad'}), assertExitError);
    await assert.rejects(() => getCommand(program, 'stock pattern').actionFn(''), assertExitError);
    await assert.rejects(() => getCommand(program, 'stock pattern').actionFn('unknown'), assertExitError);

    configState.token = '';
    await assert.rejects(() => getCommand(program, 'stock info').actionFn(['000001']), assertExitError);
    await assert.rejects(() => getCommand(program, 'stock gn').actionFn('BK0428', {type: 'ths'}), assertExitError);
    await assert.rejects(() => getCommand(program, 'stock pattern').actionFn('vcp'), assertExitError);
    assert.equal(errorCalls.length, 8);
});

test('turnover and zdt commands expose formatted payloads and errors', async t => {
    const turnoverShared = createSharedMocks();
    const turnoverProgram = createProgramMock();
    loadWithMocks(projectPath('commands', 'turnover.js'), turnoverShared.mocks)(turnoverProgram);

    const log = captureConsole('log');
    t.after(() => log.restore());
    await getCommand(turnoverProgram, 'turnover').actionFn();
    assert.equal(log.calls[0][0], '```toon\n{"当前成交额":"1.20万亿","是否正在盘中交易":"否"}\n```');

    const zdtShared = createSharedMocks();
    const zdtProgram = createProgramMock();
    loadWithMocks(projectPath('commands', 'zdt.js'), zdtShared.mocks)(zdtProgram);
    await getCommand(zdtProgram, 'zdt').actionFn({type: 'dt'});
    assert.deepEqual(zdtShared.outputCalls[0], [{code: '000001', type: 'dt'}]);

    const exitStub = createExitStub();
    t.after(() => exitStub.restore());
    await assert.rejects(() => getCommand(zdtProgram, 'zdt').actionFn({type: 'bad'}), assertExitError);

    const failingTurnover = createSharedMocks({
        '../lib/api': {
            ...createSharedMocks().mocks['../lib/api'],
            getTurnoverData: async () => {
                throw new Error('turnover failed');
            }
        }
    });
    const failingTurnoverProgram = createProgramMock();
    loadWithMocks(projectPath('commands', 'turnover.js'), failingTurnover.mocks)(failingTurnoverProgram);
    await assert.rejects(() => getCommand(failingTurnoverProgram, 'turnover').actionFn(), assertExitError);
    assert.equal(failingTurnover.errorCalls.length, 1);
    assert.equal(zdtShared.errorCalls.length, 1);
});
