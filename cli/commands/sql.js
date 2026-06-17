const config = require('../lib/config');
const api = require('../lib/api');
const {handleError, createParameterError} = require('../lib/error');
const {output} = require('../lib/output');
const {parseSql} = require('../lib/sql-parser');

module.exports = function (program) {
    const sqlCmd = program
        .command('sql')
        .description(
            '使用 SQL 条件筛选股票，支持自定义条件组合、排序和数量限制。' +
                '支持等于、大于、小于、区间范围、IN枚举、字段间比较等多种条件写法，支持 AND/OR 逻辑组合和括号嵌套。' +
                '返回股票代码、名称、涨跌幅、CS强度、RPS相对强度、SCTR技术排名、所属板块、概念等详细数据。' +
                '可用于量化筛选、技术形态选股和自定义策略分析。'
        );

    sqlCmd
        .argument('<condition>', 'SQL WHERE 条件（支持 ORDER BY 和 LIMIT）')
        .action(async condition => {
            try {
                const token = config.getToken();
                if (!token) {
                    const error = new Error('未配置 API Token');
                    error.response = {status: 401};
                    throw error;
                }

                if (!condition) {
                    throw createParameterError(
                        '参数无效',
                        ["参数 'condition' 不能为空"],
                        [
                            'daxiapi sql "date=\'2026-06-17\' AND isVCP=1"',
                            'daxiapi sql "date=\'2026-06-17\' AND rps_score>70 ORDER BY rps_score DESC LIMIT 20"'
                        ]
                    );
                }

                // 解析 SQL 条件
                const parsed = parseSql(condition);
                if (parsed.error) {
                    throw createParameterError(
                        'SQL 解析失败',
                        [parsed.error],
                        [
                            'daxiapi sql "date=\'2026-06-17\' AND isVCP=1"',
                            'daxiapi sql "date=\'2026-06-17\' AND cs in [0, 15] AND rps_score>70 ORDER BY rps_score DESC LIMIT 10"'
                        ]
                    );
                }

                // 调用服务端接口
                const data = await api.querySqlStocks(
                    token,
                    parsed.conditions,
                    parsed.orderBy,
                    parsed.limit
                );

                output(data);
            } catch (error) {
                handleError(error);
                process.exit(1);
            }
        });
};
