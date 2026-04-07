const iconv = require('iconv-lite');

module.exports = (content, encoding = 'gbk') =>
    iconv.decode(Buffer.isBuffer(content) ? content : Buffer.from(content), encoding).toString('binary');
