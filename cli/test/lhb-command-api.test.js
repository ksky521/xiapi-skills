const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');

function projectPath(...segments) {
    return path.join(rootDir, ...segments);
}

function loadWithMocks(filePath, mocks) {
    const realLoad = Module._load;
    const resolvedPath = require.resolve(filePath);
    delete require.cache[resolvedPath];

    Module._load = function(request, parent, isMain) {
        if (Object.prototype.hasOwnProperty.call(mocks, request)) {
            return mocks[request];
        }
        return realLoad.apply(this, arguments);
    };

    try {
        return require(resolvedPath);
    } finally {
        Module._load = realLoad;
        delete require.cache[resolvedPath];
    }
}

function createProgramMock() {
    const commands = [];
    function createCommand(name) {
        return {
            name,
            options: [],
            descriptionText: '',
            aliasValue: '',
            actionFn: null,
            description(value) {
                this.descriptionText = value;
                return this;
            },
            alias(value) {
                this.aliasValue = value;
                return this;
            },
            option(...args) {
                this.options.push(args);
                return this;
            },
            action(fn) {
                this.actionFn = fn;
                return this;
            }
        };
    }
    return {
        commands,
        command(name) {
            const command = createCommand(name);
            commands.push(command);
            return command;
        }
    };
}

function createExitStub() {
    const original = process.exit;
    const calls = [];
    process.exit = code => {
        calls.push(code);
        throw new Error(`process.exit:${code}`);
    };
    return {
        calls,
        restore() {
            process.exit = original;
        }
    };
}

test('lib/api exposes getDragonTigerBoard through coze POST endpoint', async () => {
    const clientCalls = [];
    const api = loadWithMocks(projectPath('lib', 'api.js'), {
        axios: {
            create(options) {
                return {
                    options,
                    async get(path) {
                        clientCalls.push({method: 'get', path});
                        return {data: {errCode: 0, data: {path}}};
                    },
                    async post(path, body) {
                        clientCalls.push({method: 'post', path, body});
                        return {data: {errCode: 0, data: {path, body}}};
                    }
                };
            },
            get: async () => ({data: {k: '', name: ''}})
        },
        './config': {get: key => (key === 'baseUrl' ? 'https://mocked.example' : undefined)},
        './request': {get: async () => ({data: {}})},
        './utils': {
            formatThsVolumeTime: data => data,
            isTradingNow: () => false,
            formatSecucode: code => code
        },
        './dividendUtils': {calculateScores: input => input},
        './caibao': async code => [{code}]
    });

    const result = await api.getDragonTigerBoard('token-123', '2026-06-17');

    assert.deepEqual(result, {
        path: '/get_dragon_tiger_board',
        body: {date: '2026-06-17'}
    });
    assert.deepEqual(clientCalls, [
        {method: 'post', path: '/get_dragon_tiger_board', body: {date: '2026-06-17'}}
    ]);
});

test('lhb command validates date and outputs dragon tiger board payload', async t => {
    const apiCalls = [];
    const outputCalls = [];
    const errorCalls = [];
    const configState = {token: 'token-123'};
    const program = createProgramMock();
    const commandModule = loadWithMocks(projectPath('commands', 'lhb.js'), {
        '../lib/config': {getToken: () => configState.token},
        '../lib/api': {
            getDragonTigerBoard: async (...args) => {
                apiCalls.push(args);
                return {date: args[1], items: [{stockCode: '000001'}]};
            }
        },
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
            }
        }
    });

    commandModule(program);
    const command = program.commands.find(item => item.name === 'lhb');
    assert.ok(command);
    assert.equal(command.aliasValue, 'dragon-tiger-board');

    await command.actionFn({date: '2026-06-17'});
    assert.deepEqual(apiCalls[0], ['token-123', '2026-06-17']);
    assert.deepEqual(outputCalls[0], {date: '2026-06-17', items: [{stockCode: '000001'}]});

    const exitStub = createExitStub();
    t.after(() => exitStub.restore());

    await assert.rejects(() => command.actionFn({date: '20260617'}), /process\.exit:1/);
    configState.token = '';
    await assert.rejects(() => command.actionFn({date: '2026-06-17'}), /process\.exit:1/);
    assert.equal(errorCalls.length, 2);
    assert.deepEqual(exitStub.calls, [1, 1]);
});
