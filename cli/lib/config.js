const Conf = require('conf');

const schema = {
    token: {
        type: 'string',
        description: 'API Token'
    },
    baseUrl: {
        type: 'string',
        default: 'https://daxiapi.com',
        description: 'API基础URL'
    }
};

const config = new Conf({ 
    projectName: 'daxiapi-cli',
    schema 
});

function getToken() {
    return process.env.DAXIAPI_TOKEN || config.get('token');
}

function get(key) {
    return config.get(key);
}

function set(key, value) {
    config.set(key, value);
}

function getAll() {
    return {
        token: getToken() ? '******' + getToken().slice(-4) : undefined,
        baseUrl: config.get('baseUrl')
    };
}

function del(key) {
    config.delete(key);
}

module.exports = {
    getToken,
    get,
    set,
    getAll,
    delete: del
};
