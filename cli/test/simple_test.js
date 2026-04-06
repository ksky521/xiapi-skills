#!/usr/bin/env node

/**
 * 简单测试脚本 - 验证Token传递是否正常
 */

const { execSync } = require('child_process');

const token = process.argv[2];

if (!token) {
    console.error('错误: 请提供Token参数');
    console.error('使用方法: node simple_test.js <your_token>');
    process.exit(1);
}

console.log('========================================');
console.log('简单测试 - 验证Token传递');
console.log('========================================');
console.log(`Token: ${token.substring(0, 10)}...`);
console.log('');

const tests = [
    { name: '获取市场指数', command: 'market index' },
    { name: '获取K线（上证指数）', command: 'kline 000001' },
    { name: '获取涨停股票', command: 'zdt --type zt' },
    { name: '搜索股票', command: 'search 平安' },
    { name: '获取红利低波打分', command: 'dividend score -c 2.H30269' }
];

let passCount = 0;
let failCount = 0;

tests.forEach(test => {
    try {
        console.log(`\n测试: ${test.name}`);
        console.log(`命令: daxiapi ${test.command}`);
        
        const result = execSync(`daxiapi ${test.command}`, {
            encoding: 'utf-8',
            timeout: 30000,
            env: { 
                ...process.env,
                DAXIAPI_TOKEN: token
            },
            stdio: 'pipe'
        });
        
        console.log('✅ 通过');
        console.log(`输出预览: ${result.substring(0, 100)}...`);
        passCount++;
    } catch (error) {
        console.log('❌ 失败');
        console.log(`错误: ${error.stderr || error.stdout || error.message}`);
        failCount++;
    }
});

console.log('\n========================================');
console.log('测试结果');
console.log('========================================');
console.log(`通过: ${passCount}/${tests.length}`);
console.log(`失败: ${failCount}/${tests.length}`);
