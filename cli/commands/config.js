const config = require('../lib/config');
const {handleError, createParameterError} = require('../lib/error');

module.exports = function (program) {
    const configCmd = program.command('config').description('配置管理，添加daxiapi.com接口api_token');

    configCmd
        .command('set <key> <value>')
        .description('设置配置项')
        .action((key, value) => {
            try {
                if (!key || !value) {
                    throw createParameterError(
                        '参数无效',
                        ["参数 'key' 不能为空", "参数 'value' 不能为空"],
                        ['daxiapi config set token YOUR_TOKEN', 'daxiapi config set baseUrl https://daxiapi.com']
                    );
                }

                config.set(key, value);
                console.log(`✓ ${key} 已设置`);
            } catch (error) {
                handleError(error);
                process.exit(1);
            }
        });

    configCmd
        .command('get')
        .description('查看所有配置')
        .action(() => {
            try {
                const allConfig = config.getAll();
                console.log(JSON.stringify(allConfig, null, 2));
            } catch (error) {
                handleError(error);
                process.exit(1);
            }
        });

    configCmd
        .command('delete <key>')
        .description('删除配置项')
        .action(key => {
            try {
                if (!key) {
                    throw createParameterError('参数无效', ["参数 'key' 不能为空"], ['daxiapi config delete token']);
                }

                config.delete(key);
                console.log(`✓ ${key} 已删除`);
            } catch (error) {
                handleError(error);
                process.exit(1);
            }
        });
};
