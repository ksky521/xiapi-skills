const path = require('path');
const Module = require('module');

function loadWithMocks(modulePath, mocks = {}) {
    const resolved = require.resolve(modulePath);
    delete require.cache[resolved];

    const originalLoad = Module._load;
    Module._load = function(request, parent, isMain) {
        if (Object.prototype.hasOwnProperty.call(mocks, request)) {
            return mocks[request];
        }
        return originalLoad.apply(this, arguments);
    };

    try {
        return require(resolved);
    } finally {
        Module._load = originalLoad;
        delete require.cache[resolved];
    }
}

function extractCommandName(definition) {
    return String(definition).trim().split(/[ <]/)[0];
}

function createCommandNode(name = 'root') {
    return {
        commandName: name,
        descriptionText: '',
        aliasValue: '',
        versionValue: '',
        options: [],
        arguments: [],
        parsedArgv: null,
        actionFn: null,
        subcommands: new Map(),
        command(definition) {
            const child = createCommandNode(extractCommandName(definition));
            child.definition = definition;
            child.parent = this;
            this.subcommands.set(child.commandName, child);
            return child;
        },
        description(text) {
            this.descriptionText = text;
            return this;
        },
        option(flags, description, defaultValue) {
            this.options.push({flags, description, defaultValue, required: false});
            return this;
        },
        requiredOption(flags, description, defaultValue) {
            this.options.push({flags, description, defaultValue, required: true});
            return this;
        },
        argument(definition, description) {
            this.arguments.push({definition, description});
            return this;
        },
        action(fn) {
            this.actionFn = fn;
            return this;
        },
        name(value) {
            this.commandName = value;
            return this;
        },
        alias(value) {
            this.aliasValue = value;
            return this;
        },
        version(value) {
            this.versionValue = value;
            return this;
        },
        parse(argv) {
            this.parsedArgv = argv;
            return this;
        }
    };
}

function createProgramMock() {
    return createCommandNode('root');
}

function getCommand(program, pathParts) {
    const parts = Array.isArray(pathParts) ? pathParts : String(pathParts).split(' ');
    return parts.reduce((node, part) => {
        const child = node.subcommands.get(part);
        if (!child) {
            throw new Error(`Command not found: ${parts.join(' ')}`);
        }
        return child;
    }, program);
}

function captureConsole(method = 'log') {
    const calls = [];
    const original = console[method];
    console[method] = (...args) => {
        calls.push(args);
    };

    return {
        calls,
        restore() {
            console[method] = original;
        }
    };
}

function createExitStub() {
    const calls = [];
    const original = process.exit;
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

function projectPath(...segments) {
    return path.join(__dirname, '..', ...segments);
}

module.exports = {
    loadWithMocks,
    createProgramMock,
    getCommand,
    captureConsole,
    createExitStub,
    projectPath
};
