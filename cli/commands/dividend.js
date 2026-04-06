const config = require('../lib/config');
const api = require('../lib/api');
const {handleError} = require('../lib/error');
const {output} = require('../lib/output');

module.exports = function (program) {
    const dividendCmd = program.command('dividend');

    dividendCmd
        .command('score')
        .description(
            '获取红利类指数的打分数据，包括红利低波、红利低波100、中证红利、中证现金流等指数的打分情况。可用于判断红利类指数的超买超卖状态和投资机会。'
        )
        .option('-c, --code <code>', '指数代码，例如：2.H30269（红利低波）、2.930955（红利低波100）、1.000922（中证红利）、2.932365（中证现金流）', '2.H30269')
        .action(async (options) => {
            try {
                const token = config.getToken();
                if (!token) {
                    const error = new Error('未配置 API Token');
                    error.response = {status: 401};
                    throw error;
                }

                const data = await api.getDividendScore(token, options.code);
                output(data);
            } catch (error) {
                handleError(error);
                process.exit(1);
            }
        });
};
