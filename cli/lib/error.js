const chalk = require('chalk');

const errorMessages = {
    401: {
        title: 'API Token 无效或已过期',
        solutions: [
            '检查 Token 是否正确配置:\n     daxiapi config set token YOUR_TOKEN',
            '或设置环境变量:\n     export DAXIAPI_TOKEN=YOUR_TOKEN',
            'Token 可在 daxiapi.com 用户中心获取'
        ]
    },
    403: {
        title: '无访问权限',
        solutions: [
            '检查您的账户是否有访问该接口的权限',
            '联系管理员开通相关权限',
            '访问 daxiapi.com 了解权限说明'
        ]
    },
    429: {
        title: '请求频率超限',
        solutions: [
            '请稍后重试',
            '检查您的请求频率是否过高',
            '升级账户获取更高配额'
        ]
    },
    500: {
        title: '服务器内部错误',
        solutions: [
            '请稍后重试',
            '如果问题持续，请联系技术支持',
            '访问 daxiapi.com 查看服务状态'
        ]
    }
};

function handleError(error) {
    console.log(chalk.red.bold('\n❌ 错误:'), error.message || error.title);

    const statusCode = error.response?.status || error.statusCode;
    const errorInfo = errorMessages[statusCode];

    if (errorInfo) {
        console.log(chalk.bold('\n解决方法:'));
        errorInfo.solutions.forEach((solution, index) => {
            console.log(`  ${index + 1}. ${solution}`);
        });
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        console.log(chalk.bold('\n解决方法:'));
        console.log('  1. 检查网络连接是否正常');
        console.log('  2. 检查 API 地址是否正确:\n     daxiapi config set baseUrl https://daxiapi.com');
        console.log('  3. 如果使用代理，请检查代理配置');
    } else if (error.details) {
        console.log(chalk.bold('\n详细信息:'));
        error.details.forEach(detail => {
            console.log(`  - ${detail}`);
        });
        if (error.examples) {
            console.log(chalk.bold('\n使用示例:'));
            error.examples.forEach(example => {
                console.log(`  ${example}`);
            });
        }
    }

    console.log('');
}

function createParameterError(message, details, examples) {
    const error = new Error(message);
    error.details = details;
    error.examples = examples;
    return error;
}

module.exports = {
    handleError,
    createParameterError
};
