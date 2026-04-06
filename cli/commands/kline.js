const config = require('../lib/config');
const api = require('../lib/api');
const {handleError, createParameterError} = require('../lib/error');
const {output} = require('../lib/output');

module.exports = function (program) {
    program
        .command('kline <code>')
        .description(
            '获取A股股票、指数、板块的K线数据，支持股票代码、指数代码、板块代码。默认返回上证指数(000001)的K线，可指定K线条数(1-500，默认60)。返回开盘价、收盘价、最高价、最低价、成交量等K线数据，可用于技术分析和趋势判断。'
        )
        .action(async code => {
            try {
                const token = config.getToken();
                if (!token) {
                    const error = new Error('未配置 API Token');
                    error.response = {status: 401};
                    throw error;
                }

                if (!code) {
                    throw createParameterError('参数无效', ["参数 'code' 不能为空"], ['daxiapi kline 000001']);
                }

                const data = await api.getKline(token, code);
                output(data);
            } catch (error) {
                handleError(error);
                process.exit(1);
            }
        });
};
