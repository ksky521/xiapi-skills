const api = require('../lib/api');
const {handleError, createParameterError} = require('../lib/error');
const {encode} = require('../lib/output');
const {getSecid} = require('../lib/utils');

function toPositiveInt(value, fieldName, examples) {
    const number = Number.parseInt(value, 10);
    if (!Number.isInteger(number) || number <= 0) {
        throw createParameterError('参数无效', [`参数 '${fieldName}' 必须是大于0的整数`], examples);
    }
    return number;
}

function validateDate(value, fieldName, examples) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw createParameterError('参数无效', [`参数 '${fieldName}' 必须是 YYYY-MM-DD 格式`], examples);
    }
}

module.exports = function (program) {
    const newsCmd = program.command('news').description('获取个股舆情、公告、研报数据，用于跟踪个股信息面变化。');

    newsCmd
        .command('sentiment')
        .description('获取个股舆情列表。')
        .option('-c, --code <code>', '股票代码（6位），如600031', '600031')
        .option('-p, --page-size <pageSize>', '每页条数，默认20', '20')
        .action(async options => {
            try {
                if (!options.code) {
                    throw createParameterError('参数无效', ["参数 'code' 不能为空"], ['daxiapi news sentiment -c600031 -p20']);
                }

                const secid = getSecid(options.code);
                const pageSize = toPositiveInt(options.pageSize, 'pageSize', ['daxiapi news sentiment -c600031 -p20']);
                const data = await api.getNewsSentiment(secid, pageSize);
                console.log('```toon\n' + encode(data) + '\n```');
            } catch (error) {
                handleError(error);
                process.exit(1);
            }
        });

    newsCmd
        .command('notice')
        .description('获取个股公告列表。')
        .option('-c, --code <code>', '股票代码（6位），如600031', '600031')
        .option('-p, --page-size <pageSize>', '每页条数，默认20', '20')
        .option('-i, --page-index <pageIndex>', '页码，默认1', '1')
        .action(async options => {
            try {
                if (!options.code) {
                    throw createParameterError('参数无效', ["参数 'code' 不能为空"], ['daxiapi news notice -c600031 -p20 -i1']);
                }

                const pageSize = toPositiveInt(options.pageSize, 'pageSize', ['daxiapi news notice -c600031 -p20 -i1']);
                const pageIndex = toPositiveInt(options.pageIndex, 'pageIndex', ['daxiapi news notice -c600031 -p20 -i1']);
                const data = await api.getNewsNotice(options.code, pageSize, pageIndex);
                console.log('```toon\n' + encode(data) + '\n```');
            } catch (error) {
                handleError(error);
                process.exit(1);
            }
        });

    newsCmd
        .command('report')
        .description('获取个股研报列表。')
        .option('-c, --code <code>', '股票代码（6位），如600031', '600031')
        .option('-p, --page-size <pageSize>', '每页条数，默认25', '25')
        .option('-i, --page-index <pageIndex>', '页码，默认1', '1')
        .option('-b, --begin-time <beginTime>', '开始日期，格式 YYYY-MM-DD', '2026-01-01')
        .option('-e, --end-time <endTime>', '结束日期，格式 YYYY-MM-DD')
        .action(async options => {
            try {
                if (!options.code) {
                    throw createParameterError('参数无效', ["参数 'code' 不能为空"], [
                        'daxiapi news report -c600031 -p25 -i1 -b2026-01-01 -e2026-04-08'
                    ]);
                }

                validateDate(options.beginTime, 'beginTime', ['daxiapi news report -b2026-01-01']);
                const endTime = options.endTime || new Date().toISOString().slice(0, 10);
                validateDate(endTime, 'endTime', ['daxiapi news report -e2026-04-08']);

                const pageSize = toPositiveInt(options.pageSize, 'pageSize', ['daxiapi news report -p25']);
                const pageIndex = toPositiveInt(options.pageIndex, 'pageIndex', ['daxiapi news report -i1']);

                const data = await api.getNewsReport(options.code, pageSize, pageIndex, options.beginTime, endTime);
                console.log('```toon\n' + encode(data) + '\n```');
            } catch (error) {
                handleError(error);
                process.exit(1);
            }
        });
};
