#!/usr/bin/env node

const {program} = require('commander');
const package = require('../package.json');

program
    .name('daxiapi')
    .alias('dxp')
    .version(package.version)
    .description('大虾皮金融数据API命令行工具');

require('../commands/config')(program);
require('../commands/market')(program);
require('../commands/sector')(program);
require('../commands/stock')(program);
require('../commands/kline')(program);
require('../commands/zdt')(program);
require('../commands/secid')(program);
require('../commands/search')(program);

program.parse(process.argv);
