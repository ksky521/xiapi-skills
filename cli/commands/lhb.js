const config = require('../lib/config');
const api = require('../lib/api');
const {handleError, createParameterError} = require('../lib/error');
const {output} = require('../lib/output');

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

module.exports = function(program) {
    program
        .command('lhb')
        .alias('dragon-tiger-board')
        .description('获取A股龙虎榜数据，支持按交易日期查询全部上榜股票、资金净额、机构参与、上榜原因、行业概念和买方席位摘要。')
        .option('-d, --date <date>', '交易日期，格式 YYYY-MM-DD；不传则返回最新可用交易日')
        .action(async options => {
            try {
                const token = config.getToken();
                if (!token) {
                    const error = new Error('未配置 API Token');
                    error.response = {status: 401};
                    throw error;
                }

                const date = String((options && options.date) || '').trim();
                if (date && !DATE_RE.test(date)) {
                    throw createParameterError(
                        '参数无效',
                        ["参数 'date' 必须是 YYYY-MM-DD 格式"],
                        [
                            'daxiapi lhb --date 2026-06-17',
                            'daxiapi dragon-tiger-board --date 2026-06-17'
                        ]
                    );
                }

                const data = await api.getDragonTigerBoard(token, date);
                output(data);
            } catch (error) {
                handleError(error);
                process.exit(1);
            }
        });
};

