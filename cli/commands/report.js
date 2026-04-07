const api = require('../lib/api');
const {handleError, createParameterError} = require('../lib/error');
const {encode} = require('../lib/output');

module.exports = function (program) {
    const reportCmd = program
        .command('report')
        .description('获取A股个股财报数据，包括主要财务指标、盈利能力、偿债能力等，用于基本面分析。');

    reportCmd
        .command('finance <code>')
        .description(
            '获取指定股票的财务报表数据，包括报告期、营业收入、净利润、每股收益、净资产收益率等核心财务指标。数据来源于同花顺，可用于个股基本面分析和财务健康评估。'
        )
        .action(async code => {
            try {
                if (!code) {
                    throw createParameterError(
                        '参数无效',
                        ["参数 'code' 不能为空"],
                        ['daxiapi report finance 300014', 'daxiapi report finance 600036']
                    );
                }

                const data = await api.getFinanceReportDetail(code);
                console.log('```toon\n' + encode(data) + '\n```');
            } catch (error) {
                handleError(error);
                process.exit(1);
            }
        });
};
