const api = require('../lib/api');
const {handleError} = require('../lib/error');
const {output, encode} = require('../lib/output');

module.exports = function (program) {
    const hotrankCmd = program.command('hotrank');

    hotrankCmd
        .command('stock')
        .description('获取A股热股榜数据，支持不同时间维度和榜单类型。可用于发现市场热点、跟踪资金流向、识别强势个股。')
        .option(
            '-t, --type <type>',
            '时间类型：hour(1小时) 或 day(24小时)，仅对 normal 和 skyrocket 榜单有效，默认为 hour',
            'hour'
        )
        .option(
            '-l, --list-type <listType>',
            '榜单类型：normal(默认，大家都在看)、skyrocket(快速飙升个股)、trend(趋势投资派关注个股)、value(价值派关注个股)、tech(技术派关注个股)',
            'normal'
        )
        .action(async options => {
            try {
                const data = await api.getStockRank(options.type, options.listType);
                console.log(encode(data));
            } catch (error) {
                handleError(error);
                process.exit(1);
            }
        });

    hotrankCmd
        .command('concept')
        .description(
            '获取A股概念板块热榜数据，展示当前市场热门概念板块排名。可用于把握市场热点、识别题材轮动、辅助主题投资决策。'
        )
        .action(async () => {
            try {
                const data = await api.getPlateRank('concept');
                console.log(encode(data));
            } catch (error) {
                handleError(error);
                process.exit(1);
            }
        });

    hotrankCmd
        .command('board')
        .description(
            '获取A股行业板块热榜数据，展示当前市场热门行业板块排名。可用于分析行业轮动、把握板块机会、辅助行业配置决策。'
        )
        .option('-t, --type <type>', '板块类型：industry(行业) 或其他类型', 'industry')
        .action(async options => {
            try {
                const data = await api.getPlateRank(options.type);
                console.log(encode(data));
            } catch (error) {
                handleError(error);
                process.exit(1);
            }
        });
};
