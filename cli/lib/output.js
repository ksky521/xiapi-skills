const {encode} = require('@toon-format/toon');
function output(data) {
    // 检查是否是dividend score结果
    if (data && data.scores && Array.isArray(data.scores)) {
        console.log(`查询到${data.name || data.code}(${data.code})的最近60个交易日打分情况：`);
        console.log('');
        console.log('```toon');
        console.log('[60]{"日期","分数","cs值","rsi值"}:');

        data.scores.forEach(item => {
            console.log(`  ${item.date},${item.score || '-'},${item.cs || '-'},${item.rsi || '-'}`);
        });

        console.log('```');
    } else {
        console.log(data);
    }
}

module.exports = {
    encode,
    output
};
