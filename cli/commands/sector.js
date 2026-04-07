const config = require('../lib/config');
const api = require('../lib/api');
const {handleError, createParameterError} = require('../lib/error');
const {output} = require('../lib/output');

module.exports = function (program) {
    const sectorCmd = program
        .command('sector')
        .description(
            '获取A股板块热力图、行业板块、概念板块、板块内个股排名等多维度板块数据，用于板块轮动分析与热点追踪。'
        );

    sectorCmd
        .command('heatmap')
        .description('获取A股板块热力图数据（同花顺分类），支持按强度(cs)、涨跌幅(zdf)等多个维度排序，可查询1-30天数据。返回板块强度热力图、涨跌幅热力图、箱体突破板块统计、强度与均线交叉板块等信息。可用于板块轮动分析、强势板块识别和热点追踪。')
        .option('--order <field>', '排序字段', 'cs')
        .option('--limit <num>', '数量限制', 5)
        .action(async options => {
            try {
                const token = config.getToken();
                if (!token) {
                    const error = new Error('未配置 API Token');
                    error.response = {status: 401};
                    throw error;
                }

                const data = await api.getSectorData(token, options.order, options.limit);
                output(data);
            } catch (error) {
                handleError(error);
                process.exit(1);
            }
        });

    sectorCmd
        .command('bk')
        .description('获取A股行业板块数据（同花顺分类），包括行业名称、今日涨幅、5日涨幅、20日涨幅、CS强度、CS均线、强度指标(QD)等核心数据。数据按今日涨幅降序排列，可用于板块轮动分析、强势板块识别和行业配置参考。')
        .action(async () => {
            try {
                const token = config.getToken();
                if (!token) {
                    const error = new Error('未配置 API Token');
                    error.response = {status: 401};
                    throw error;
                }

                const data = await api.getBkData(token);
                output(data);
            } catch (error) {
                handleError(error);
                process.exit(1);
            }
        });

    sectorCmd
        .command('stocks')
        .description('获取A股指定板块内股票排名，支持BK0428、0428、881155等多种板块代码格式。支持按强度(cs)、涨跌幅(zdf)、市值(sm)、成交额(cg)、换手率(cr)、SCTR排名等多种维度排序。返回板块内前20只股票的详细数据，可用于板块内强势股筛选和个股分析。')
        .requiredOption('--code <bkCode>', '板块代码')
        .option('--order <field>', '排序字段', 'cs')
        .action(async options => {
            try {
                const token = config.getToken();
                if (!token) {
                    const error = new Error('未配置 API Token');
                    error.response = {status: 401};
                    throw error;
                }

                const data = await api.getSectorRankStock(token, options.code, options.order);
                output(data);
            } catch (error) {
                handleError(error);
                process.exit(1);
            }
        });

    sectorCmd
        .command('top')
        .description('获取A股热门股票数据，筛选当日涨幅>7%且IBS>50的强势股，按板块分组展示每个板块内强度排名前10的股票。返回股票名称、代码、涨幅、5/10/20日涨跌幅、所属板块、概念等信息，可用于短线热点追踪和强势股挖掘。')
        .action(async () => {
            try {
                const token = config.getToken();
                if (!token) {
                    const error = new Error('未配置 API Token');
                    error.response = {status: 401};
                    throw error;
                }

                const data = await api.getTopStocks(token);
                output(data);
            } catch (error) {
                handleError(error);
                process.exit(1);
            }
        });

    sectorCmd
        .command('gn')
        .description('获取A股热门概念板块列表，支持同花顺(ths)和东方财富(dfcf)两个数据源。按板块内涨幅7%以上股票个数降序排序，返回前20个概念板块的名称、今日涨幅、7%+股票数、5/10/20日涨幅、强度指标(QD)、CS强度等信息。可用于概念板块热度分析和热点追踪。')
        .option('--type <type>', '数据源类型 (dfcf|ths)', 'ths')
        .action(async options => {
            try {
                const token = config.getToken();
                if (!token) {
                    const error = new Error('未配置 API Token');
                    error.response = {status: 401};
                    throw error;
                }

                if (!['dfcf', 'ths'].includes(options.type)) {
                    throw createParameterError(
                        '参数无效',
                        ["参数 'type' 必须是 dfcf 或 ths"],
                        ['daxiapi sector gn --type ths', 'daxiapi sector gn --type dfcf']
                    );
                }

                const data = await api.getGnHot(token, options.type);
                output(data);
            } catch (error) {
                handleError(error);
                process.exit(1);
            }
        });
};
