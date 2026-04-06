const config = require('../lib/config');
const api = require('../lib/api');
const {handleError} = require('../lib/error');
const {output} = require('../lib/output');

module.exports = function (program) {
    const marketCmd = program.command('market');

    marketCmd
        .command('index')
        .description(
            '获取A股市场主流指数数据，包括上证指数、深证成指、沪深300、上证50、中证500、创业板指、科创50等指数的强度值和多日涨跌幅。可用于市场风格判断、趋势分析、强弱排名、板块轮动分析和投资决策辅助。'
        )
        .action(async () => {
            try {
                const token = config.getToken();
                if (!token) {
                    const error = new Error('未配置 API Token');
                    error.response = {status: 401};
                    throw error;
                }

                const data = await api.getMarketData(token);
                output(data);
            } catch (error) {
                handleError(error);
                process.exit(1);
            }
        });

    marketCmd
        .command('temp')
        .description(
            '获取A股市场温度数据，包括估值温度、恐贪指数、趋势温度、动量温度等核心指标。可用于判断市场整体情绪、风险水平、趋势强度和动量状态，为投资决策提供参考。'
        )
        .action(async () => {
            try {
                const token = config.getToken();
                if (!token) {
                    const error = new Error('未配置 API Token');
                    error.response = {status: 401};
                    throw error;
                }

                const data = await api.getMarketTemp(token);
                output(data);
            } catch (error) {
                handleError(error);
                process.exit(1);
            }
        });

    marketCmd
        .command('style')
        .description(
            '获取A股市场风格数据，计算中证500(小盘)与沪深300(大盘)的涨跌幅差值。当差值为正时表示小盘强于大盘，为负时表示大盘强于小盘，可用于判断市场风格偏向和风格轮动趋势。'
        )
        .action(async () => {
            try {
                const token = config.getToken();
                if (!token) {
                    const error = new Error('未配置 API Token');
                    error.response = {status: 401};
                    throw error;
                }

                const data = await api.getMarketStyle(token);
                output(data);
            } catch (error) {
                handleError(error);
                process.exit(1);
            }
        });

    marketCmd
        .command('value')
        .description(
            '获取A股主要指数估值数据，包括市盈率(PE)、市净率(PB)、估值温度、PE百分位、PB百分位等核心估值指标。支持对红利类指数的特殊估值计算，可用于判断指数当前估值水平和投资价值。'
        )
        .action(async () => {
            try {
                const token = config.getToken();
                if (!token) {
                    const error = new Error('未配置 API Token');
                    error.response = {status: 401};
                    throw error;
                }

                const data = await api.getMarketValueData(token);
                output(data);
            } catch (error) {
                handleError(error);
                process.exit(1);
            }
        });
};
