const api = require('../lib/api');
const {handleError} = require('../lib/error');
const {encode} = require('../lib/output');

module.exports = function (program) {
    const turnoverCmd = program
        .command('turnover')
        .description('获取A股市场成交额数据，对比当日与上一交易日成交额变化。')
        .action(async () => {
            try {
                const data = await api.getTurnoverData();
                console.log(encode(data));
            } catch (error) {
                handleError(error);
                process.exit(1);
            }
        });
};
