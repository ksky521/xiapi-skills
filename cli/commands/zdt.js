const config = require('../lib/config');
const api = require('../lib/api');
const {handleError, createParameterError} = require('../lib/error');
const {output} = require('../lib/output');

module.exports = function(program) {
    program
        .command('zdt')
        .description('获取A股涨跌停股票池数据，支持查询涨停(zt)、跌停(dt)、炸板(zb)三类股票。返回股票代码、名称、涨停统计、所属行业、概念、CS强度、SCTR排名等信息，并提供市场整体涨跌停统计。可用于短线热点追踪和市场情绪分析。')
        .option('--type <type>', '类型 (zt|dt|zb)', 'zt')
        .action(async (options) => {
            try {
                const token = config.getToken();
                if (!token) {
                    const error = new Error('未配置 API Token');
                    error.response = {status: 401};
                    throw error;
                }

                if (!['zt', 'dt', 'zb'].includes(options.type)) {
                    throw createParameterError(
                        '参数无效',
                        ["参数 'type' 必须是 zt、dt 或 zb"],
                        [
                            'daxiapi zdt --type zt',
                            'daxiapi zdt --type dt',
                            'daxiapi zdt --type zb'
                        ]
                    );
                }

                const data = await api.getZdtPool(token, options.type);
                output(data);
            } catch (error) {
                handleError(error);
                process.exit(1);
            }
        });
};
