const config = require('../lib/config');
const api = require('../lib/api');
const {handleError, createParameterError} = require('../lib/error');
const {output} = require('../lib/output');

module.exports = function(program) {
    const stockCmd = program.command('stock');

    stockCmd
        .command('info')
        .description('根据股票代码获取A股详细信息，支持多个代码用逗号分隔（最多20只），支持6位数字代码和116.xxx格式。返回股票名称、代码、涨跌幅、CS强度、SCTR排名、所属板块、概念、市值、成交额等详细数据。可用于个股分析和多只股票对比。')
        .argument('<codes...>', '股票代码（支持多个）')
        .action(async (codes) => {
            try {
                const token = config.getToken();
                if (!token) {
                    const error = new Error('未配置 API Token');
                    error.response = {status: 401};
                    throw error;
                }

                if (!codes || codes.length === 0) {
                    throw createParameterError(
                        '参数无效',
                        ["参数 'codes' 不能为空"],
                        [
                            'daxiapi stock info 000001',
                            'daxiapi stock info 000001 600031 300750'
                        ]
                    );
                }

                const data = await api.getStockData(token, codes);
                output(data);
            } catch (error) {
                handleError(error);
                process.exit(1);
            }
        });

    stockCmd
        .command('gn <gnId>')
        .description('根据概念板块ID获取该概念下的所有股票数据，支持同花顺(881155)和东方财富(BK0428)两种格式的板块ID。自动根据ID格式选择数据源，返回股票名称、代码、涨跌幅、CS强度、SCTR排名等详细信息，最多返回300只股票。可用于概念板块成分股分析和板块内股票筛选。')
        .option('--type <type>', '数据源类型 (dfcf|ths)', 'ths')
        .action(async (gnId, options) => {
            try {
                const token = config.getToken();
                if (!token) {
                    const error = new Error('未配置 API Token');
                    error.response = {status: 401};
                    throw error;
                }

                if (!gnId) {
                    throw createParameterError(
                        '参数无效',
                        ["参数 'gnId' 不能为空"],
                        ['daxiapi stock gn GN1234']
                    );
                }

                if (!['dfcf', 'ths'].includes(options.type)) {
                    throw createParameterError(
                        '参数无效',
                        ["参数 'type' 必须是 dfcf 或 ths"],
                        [
                            'daxiapi stock gn GN1234 --type ths',
                            'daxiapi stock gn GN1234 --type dfcf'
                        ]
                    );
                }

                const data = await api.getGainianStock(token, gnId, options.type);
                output(data);
            } catch (error) {
                handleError(error);
                process.exit(1);
            }
        });
};
