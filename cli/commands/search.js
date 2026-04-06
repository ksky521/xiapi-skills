const config = require('../lib/config');
const api = require('../lib/api');
const {handleError, createParameterError} = require('../lib/error');
const {output} = require('../lib/output');

module.exports = function (program) {
    program
        .command('search <keyword>')
        .description('搜索A股股票或板块，支持关键词模糊查询（股票名称、拼音缩写等）。支持两种搜索类型：stock(股票)和bk(板块)，默认搜索股票。从东方财富API获取数据，返回代码、名称、类型、拼音等信息，最多返回10条结果。可用于快速查找股票代码和板块信息。')
        .option('-t, --type <type>', '搜索类型：stock（股票）或 bk（板块）', 'stock')
        .action(async (keyword, options) => {
            try {
                const token = config.getToken();
                if (!token) {
                    const error = new Error('未配置 API Token');
                    error.response = {status: 401};
                    throw error;
                }

                if (!keyword) {
                    throw createParameterError(
                        '参数无效',
                        ["参数 'keyword' 不能为空"],
                        ['daxiapi search 平安', 'daxiapi search 锂电 --type bk']
                    );
                }

                const data = await api.queryStockData(token, keyword, options.type);
                output(data);
            } catch (error) {
                handleError(error);
                process.exit(1);
            }
        });
};
