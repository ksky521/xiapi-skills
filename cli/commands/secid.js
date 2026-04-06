const config = require('../lib/config');
const api = require('../lib/api');
const {handleError, createParameterError} = require('../lib/error');
const {output} = require('../lib/output');

module.exports = function(program) {
    program
        .command('secid <code>')
        .description('将各种股票代码格式转换为标准secid格式，支持以下格式：6位数字股票代码(000001)、sh/sz前缀(sh000001)、BK开头板块代码(BK0428)、纯数字板块代码(428)。返回标准secid格式，如1.600000(沪市)、0.000001(深市)、90.BK0428(板块)。可用于统一代码格式和K线数据查询。')
        .action(async (code) => {
            try {
                const token = config.getToken();
                if (!token) {
                    const error = new Error('未配置 API Token');
                    error.response = {status: 401};
                    throw error;
                }

                if (!code) {
                    throw createParameterError(
                        '参数无效',
                        ["参数 'code' 不能为空"],
                        ['daxiapi secid 000001']
                    );
                }

                const data = await api.getSecId(token, code);
                output(data);
            } catch (error) {
                handleError(error);
                process.exit(1);
            }
        });
};
