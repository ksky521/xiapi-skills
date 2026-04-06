#!/usr/bin/env node

/**
 * CLI接口完整测试用例
 *
 * 测试范围：
 * 1. 所有CLI命令和子命令
 * 2. 所有参数组合（除了limit/lmt参数）
 * 3. 错误处理和边界情况
 * 4. Token验证和权限检查
 *
 * 使用方法：
 * node test_cli.js <your_token>
 */

const {execSync} = require('child_process');
const fs = require('fs');

// 测试配置
const CONFIG = {
    token: process.argv[2],
    testResults: [],
    passCount: 0,
    failCount: 0
};

// 颜色输出
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function runTest(testName, command, expectSuccess = true) {
    try {
        log(`\n测试: ${testName}`, 'cyan');
        log(`命令: daxiapi ${command}`, 'blue');

        const result = execSync(`daxiapi ${command}`, {
            encoding: 'utf-8',
            timeout: 30000,
            env: {
                ...process.env,
                DAXIAPI_TOKEN: CONFIG.token
            },
            stdio: 'pipe'
        });

        if (expectSuccess) {
            log('✅ 通过', 'green');
            CONFIG.passCount++;
            CONFIG.testResults.push({
                name: testName,
                command: command,
                status: 'PASS',
                output: result.substring(0, 200) + '...'
            });
        } else {
            log('❌ 失败（预期失败但成功了）', 'red');
            CONFIG.failCount++;
            CONFIG.testResults.push({
                name: testName,
                command: command,
                status: 'FAIL',
                reason: 'Expected failure but succeeded'
            });
        }

        return true;
    } catch (error) {
        const errorMsg = error.stderr || error.stdout || error.message;

        if (!expectSuccess) {
            log('✅ 通过（预期失败）', 'green');
            CONFIG.passCount++;
            CONFIG.testResults.push({
                name: testName,
                command: command,
                status: 'PASS',
                reason: 'Expected failure'
            });
        } else {
            log(`❌ 失败: ${errorMsg}`, 'red');
            CONFIG.failCount++;
            CONFIG.testResults.push({
                name: testName,
                command: command,
                status: 'FAIL',
                error: errorMsg,
                stdout: error.stdout,
                stderr: error.stderr
            });
        }

        return false;
    }
}

// 验证Token
function validateToken() {
    if (!CONFIG.token) {
        log('错误: 请提供Token参数', 'red');
        log('使用方法: node test_cli.js <your_token>', 'yellow');
        process.exit(1);
    }

    log('\n========================================', 'cyan');
    log('CLI接口完整测试', 'cyan');
    log('========================================', 'cyan');
    log(`Token: ${CONFIG.token.substring(0, 10)}...`, 'blue');
    log(`开始时间: ${new Date().toLocaleString()}`, 'blue');
}

// 测试配置命令
function testConfigCommands() {
    log('\n========================================', 'cyan');
    log('测试配置命令', 'cyan');
    log('========================================', 'cyan');

    // 设置Token
    runTest('设置Token', `config set token ${CONFIG.token}`);

    // 获取Token
    runTest('获取Token', 'config get token');

    // 设置baseUrl
    runTest('设置baseUrl', 'config set baseUrl https://daxiapi.com');

    // 获取baseUrl
    runTest('获取baseUrl', 'config get baseUrl');
}

// 测试市场数据命令
function testMarketCommands() {
    log('\n========================================', 'cyan');
    log('测试市场数据命令', 'cyan');
    log('========================================', 'cyan');

    // market index
    runTest('获取市场指数数据', 'market index');

    // market temp
    runTest('获取市场温度数据', 'market temp');

    // market style
    runTest('获取市场风格数据', 'market style');

    // market value
    runTest('获取市场估值数据', 'market value');
}

// 测试板块数据命令
function testSectorCommands() {
    log('\n========================================', 'cyan');
    log('测试板块数据命令', 'cyan');
    log('========================================', 'cyan');

    // sector heatmap - 测试不同的order参数
    runTest('获取板块热力图（默认排序）', 'sector heatmap');
    runTest('获取板块热力图（按CS排序）', 'sector heatmap --order cs');
    runTest('获取板块热力图（按涨跌幅排序）', 'sector heatmap --order zdf');

    // sector bk
    runTest('获取行业板块数据', 'sector bk');

    // sector stocks - 测试不同的code和order参数
    runTest('获取板块内股票（BK格式）', 'sector stocks --code BK0428');
    runTest('获取板块内股票（纯数字格式）', 'sector stocks --code 0428');
    runTest('获取板块内股票（881155格式）', 'sector stocks --code 881155');
    runTest('获取板块内股票（按CS排序）', 'sector stocks --code BK0428 --order cs');
    runTest('获取板块内股票（按涨跌幅排序）', 'sector stocks --code BK0428 --order zdf');
    runTest('获取板块内股票（按市值排序）', 'sector stocks --code BK0428 --order sm');
    runTest('获取板块内股票（按成交额排序）', 'sector stocks --code BK0428 --order cg');
    runTest('获取板块内股票（按换手率排序）', 'sector stocks --code BK0428 --order cr');

    // sector top
    runTest('获取热门股票数据', 'sector top');

    // sector gn - 测试不同的type参数
    runTest('获取热门概念板块（同花顺）', 'sector gn --type ths');
    runTest('获取热门概念板块（东方财富）', 'sector gn --type dfcf');
}

// 测试股票数据命令
function testStockCommands() {
    log('\n========================================', 'cyan');
    log('测试股票数据命令', 'cyan');
    log('========================================', 'cyan');

    // stock info - 测试单个和多个代码
    runTest('获取单个股票信息', 'stock info 000001');
    runTest('获取多个股票信息', 'stock info 000001 600031 300750');
    runTest('获取股票信息（116格式）', 'stock info 116.000001');

    // stock gn - 测试不同的gnId和type参数
    runTest('获取概念股票（同花顺格式）', 'stock gn 881155 --type ths');
    runTest('获取概念股票（东方财富格式）', 'stock gn BK0428 --type dfcf');

    // stock pattern - 测试不同的形态类型
    const patterns = ['vcp', 'rps', 'sctr', 'gxl', 'trendUp', 'high_60d', 'newHigh', 'fangliang', 'zdf1dTop3'];
    patterns.forEach(pattern => {
        runTest(`获取形态股票（${pattern}）`, `stock pattern ${pattern}`);
    });
}

// 测试K线数据命令
function testKlineCommands() {
    log('\n========================================', 'cyan');
    log('测试K线数据命令', 'cyan');
    log('========================================', 'cyan');

    // 测试不同的代码格式
    runTest('获取K线（上证指数）', 'kline 000001');
    runTest('获取K线（深证成指）', 'kline 399001');
    runTest('获取K线（沪深300）', 'kline 000300');
    runTest('获取K线（创业板指）', 'kline 399006');
    runTest('获取K线（个股）', 'kline 600031');
    runTest('获取K线（板块）', 'kline BK0428');
}

// 测试涨跌停数据命令
function testZdtCommands() {
    log('\n========================================', 'cyan');
    log('测试涨跌停数据命令', 'cyan');
    log('========================================', 'cyan');

    // 测试不同的type参数
    runTest('获取涨停股票', 'zdt --type zt');
    runTest('获取跌停股票', 'zdt --type dt');
    runTest('获取炸板股票', 'zdt --type zb');
}

// 测试代码转换命令
function testSecidCommands() {
    log('\n========================================', 'cyan');
    log('测试代码转换命令', 'cyan');
    log('========================================', 'cyan');

    // 测试不同的代码格式
    runTest('转换代码（6位数字）', 'secid 000001');
    runTest('转换代码（sh前缀）', 'secid sh000001');
    runTest('转换代码（sz前缀）', 'secid sz000001');
    runTest('转换代码（BK格式）', 'secid BK0428');
    runTest('转换代码（纯数字板块）', 'secid 428');
}

// 测试搜索命令
function testSearchCommands() {
    log('\n========================================', 'cyan');
    log('测试搜索命令', 'cyan');
    log('========================================', 'cyan');

    // 测试不同的关键词和type参数
    runTest('搜索股票（关键词）', 'search 平安');
    runTest('搜索股票（拼音）', 'search pa');
    runTest('搜索板块', 'search 银行 --type bk');
}

// 测试红利类指数命令
function testDividendCommands() {
    log('\n========================================', 'cyan');
    log('测试红利类指数命令', 'cyan');
    log('========================================', 'cyan');

    // 测试不同的指数代码
    runTest('获取红利低波打分', 'dividend score -c 2.H30269');
    runTest('获取红利低波100打分', 'dividend score -c 2.930955');
    runTest('获取中证红利打分', 'dividend score -c 1.000922');
    runTest('获取中证现金流打分', 'dividend score -c 2.932365');
}

// 测试错误处理
function testErrorHandling() {
    log('\n========================================', 'cyan');
    log('测试错误处理', 'cyan');
    log('========================================', 'cyan');

    // 测试无效参数
    runTest('无效的zdt类型', 'zdt --type invalid', false);
    runTest('无效的gn类型', 'sector gn --type invalid', false);
    runTest('无效的股票代码', 'stock info invalid', false);
    runTest('无效的形态类型', 'stock pattern invalid', false);
    runTest('无效的板块代码', 'sector stocks --code invalid', false);
}

// 生成测试报告
function generateReport() {
    log('\n========================================', 'cyan');
    log('测试报告', 'cyan');
    log('========================================', 'cyan');

    log(`\n总测试数: ${CONFIG.passCount + CONFIG.failCount}`, 'blue');
    log(`通过: ${CONFIG.passCount}`, 'green');
    log(`失败: ${CONFIG.failCount}`, 'red');
    log(
        `通过率: ${((CONFIG.passCount / (CONFIG.passCount + CONFIG.failCount)) * 100).toFixed(2)}%`,
        CONFIG.failCount === 0 ? 'green' : 'yellow'
    );

    // 保存详细报告
    const reportPath = '/Users/theo/www/git/spider-utils/spiders/muyang/xiapi-skills/cli/test_report.json';
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            total: CONFIG.passCount + CONFIG.failCount,
            passed: CONFIG.passCount,
            failed: CONFIG.failCount,
            passRate: ((CONFIG.passCount / (CONFIG.passCount + CONFIG.failCount)) * 100).toFixed(2) + '%'
        },
        results: CONFIG.testResults
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    log(`\n详细报告已保存到: ${reportPath}`, 'blue');

    // 显示失败的测试
    if (CONFIG.failCount > 0) {
        log('\n失败的测试:', 'red');
        CONFIG.testResults
            .filter(r => r.status === 'FAIL')
            .forEach(r => {
                log(`  - ${r.name}: ${r.error || r.reason}`, 'red');
            });
    }
}

// 主测试流程
function main() {
    validateToken();

    try {
        testConfigCommands();
        testMarketCommands();
        testSectorCommands();
        testStockCommands();
        testKlineCommands();
        testZdtCommands();
        testSecidCommands();
        testSearchCommands();
        testDividendCommands();
        testErrorHandling();
    } catch (error) {
        log(`\n测试过程中发生错误: ${error.message}`, 'red');
        console.error(error);
    } finally {
        generateReport();
    }
}

// 运行测试
main();
