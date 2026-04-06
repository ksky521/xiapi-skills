# CLI测试用例说明文档

## 概述

本文档提供了大虾皮CLI工具的完整测试用例，用于验证所有CLI接口的功能正确性。

## 测试范围

### 1. 配置命令测试
- ✅ 设置Token
- ✅ 获取Token
- ✅ 设置baseUrl
- ✅ 获取baseUrl

### 2. 市场数据命令测试
- ✅ `market index` - 获取市场指数数据
- ✅ `market temp` - 获取市场温度数据
- ✅ `market style` - 获取市场风格数据
- ✅ `market value` - 获取市场估值数据

### 3. 板块数据命令测试
- ✅ `sector heatmap` - 获取板块热力图
  - 测试参数: `--order` (cs, zdf)
- ✅ `sector bk` - 获取行业板块数据
- ✅ `sector stocks` - 获取板块内股票
  - 测试参数: `--code` (BK0428, 0428, 881155)
  - 测试参数: `--order` (cs, zdf, sm, cg, cr)
- ✅ `sector top` - 获取热门股票数据
- ✅ `sector gn` - 获取热门概念板块
  - 测试参数: `--type` (ths, dfcf)

### 4. 股票数据命令测试
- ✅ `stock info` - 获取股票信息
  - 测试参数: 单个代码、多个代码、116格式
- ✅ `stock gn` - 获取概念股票
  - 测试参数: `--type` (ths, dfcf)
- ✅ `stock pattern` - 获取形态股票
  - 测试参数: vcp, rps, sctr, gxl, trendUp, high_60d, newHigh, fangliang, zdf1dTop3

### 5. K线数据命令测试
- ✅ `kline` - 获取K线数据
  - 测试参数: 上证指数、深证成指、沪深300、创业板指、个股、板块

### 6. 涨跌停数据命令测试
- ✅ `zdt` - 获取涨跌停数据
  - 测试参数: `--type` (zt, dt, zb)

### 7. 代码转换命令测试
- ✅ `secid` - 代码转换
  - 测试参数: 6位数字、sh前缀、sz前缀、BK格式、纯数字板块

### 8. 搜索命令测试
- ✅ `search` - 搜索股票/板块
  - 测试参数: 关键词、拼音、`--type` (bk)

### 9. 红利类指数命令测试
- ✅ `dividend score` - 获取红利类指数打分
  - 测试参数: `-c` (2.H30269, 2.930955, 1.000922, 2.932365)

### 10. 错误处理测试
- ✅ 无效的zdt类型
- ✅ 无效的gn类型
- ✅ 无效的股票代码
- ✅ 无效的形态类型
- ✅ 无效的板块代码

## 使用方法

### 1. 准备工作

确保已经安装了Node.js和npm，并且已经全局安装了daxiapi-cli：

```bash
cd /Users/theo/www/git/spider-utils/spiders/muyang/xiapi-skills/cli
npm link
```

### 2. 运行测试

```bash
node test_cli.js <your_token>
```

其中 `<your_token>` 是您的大虾皮网站会员后台获取的API Token。

### 3. 查看测试报告

测试完成后，会生成两个输出：

1. **控制台输出**：实时显示测试进度和结果
2. **JSON报告**：保存在 `test_report.json` 文件中

### 4. 测试报告内容

测试报告包含以下信息：

```json
{
  "timestamp": "2026-04-06T...",
  "summary": {
    "total": 60,
    "passed": 58,
    "failed": 2,
    "passRate": "96.67%"
  },
  "results": [
    {
      "name": "测试名称",
      "command": "执行的命令",
      "status": "PASS/FAIL",
      "output": "输出内容（前200字符）"
    }
  ]
}
```

## 测试用例详细说明

### 1. 配置命令测试

#### 1.1 设置Token
```bash
daxiapi config set token <your_token>
```
**预期结果**: Token设置成功

#### 1.2 获取Token
```bash
daxiapi config get token
```
**预期结果**: 显示已设置的Token

### 2. 市场数据命令测试

#### 2.1 获取市场指数数据
```bash
daxiapi market index
```
**预期结果**: 返回上证指数、深证成指、沪深300等主流指数数据

#### 2.2 获取市场温度数据
```bash
daxiapi market temp
```
**预期结果**: 返回估值温度、恐贪指数、趋势温度、动量温度等指标

#### 2.3 获取市场风格数据
```bash
daxiapi market style
```
**预期结果**: 返回大小盘风格差值数据

#### 2.4 获取市场估值数据
```bash
daxiapi market value
```
**预期结果**: 返回主要指数的PE、PB、估值温度等数据

### 3. 板块数据命令测试

#### 3.1 获取板块热力图
```bash
daxiapi sector heatmap
daxiapi sector heatmap --order cs
daxiapi sector heatmap --order zdf
```
**预期结果**: 返回板块热力图数据，支持按CS或涨跌幅排序

#### 3.2 获取行业板块数据
```bash
daxiapi sector bk
```
**预期结果**: 返回所有行业板块的涨跌幅、CS强度等数据

#### 3.3 获取板块内股票
```bash
daxiapi sector stocks --code BK0428
daxiapi sector stocks --code 0428
daxiapi sector stocks --code 881155
daxiapi sector stocks --code BK0428 --order cs
daxiapi sector stocks --code BK0428 --order zdf
daxiapi sector stocks --code BK0428 --order sm
daxiapi sector stocks --code BK0428 --order cg
daxiapi sector stocks --code BK0428 --order cr
```
**预期结果**: 返回板块内股票排名，支持多种代码格式和排序方式

#### 3.4 获取热门股票数据
```bash
daxiapi sector top
```
**预期结果**: 返回当日涨幅>7%且IBS>50的强势股

#### 3.5 获取热门概念板块
```bash
daxiapi sector gn --type ths
daxiapi sector gn --type dfcf
```
**预期结果**: 返回热门概念板块列表，支持同花顺和东方财富数据源

### 4. 股票数据命令测试

#### 4.1 获取股票信息
```bash
daxiapi stock info 000001
daxiapi stock info 000001 600031 300750
daxiapi stock info 116.000001
```
**预期结果**: 返回股票详细信息，支持单个、多个和116格式代码

#### 4.2 获取概念股票
```bash
daxiapi stock gn 881155 --type ths
daxiapi stock gn BK0428 --type dfcf
```
**预期结果**: 返回概念板块内的所有股票

#### 4.3 获取形态股票
```bash
daxiapi stock pattern vcp
daxiapi stock pattern rps
daxiapi stock pattern sctr
daxiapi stock pattern gxl
daxiapi stock pattern trendUp
daxiapi stock pattern high_60d
daxiapi stock pattern newHigh
daxiapi stock pattern fangliang
daxiapi stock pattern zdf1dTop3
```
**预期结果**: 返回符合指定技术形态的股票列表

### 5. K线数据命令测试

#### 5.1 获取不同代码的K线
```bash
daxiapi kline 000001
daxiapi kline 399001
daxiapi kline 000300
daxiapi kline 399006
daxiapi kline 600031
daxiapi kline BK0428
```
**预期结果**: 返回对应的K线数据

### 6. 涨跌停数据命令测试

#### 6.1 获取不同类型的涨跌停数据
```bash
daxiapi zdt --type zt
daxiapi zdt --type dt
daxiapi zdt --type zb
```
**预期结果**: 返回涨停、跌停或炸板股票列表

### 7. 代码转换命令测试

#### 7.1 转换不同格式的代码
```bash
daxiapi secid 000001
daxiapi secid sh000001
daxiapi secid sz000001
daxiapi secid BK0428
daxiapi secid 428
```
**预期结果**: 返回标准的secid格式

### 8. 搜索命令测试

#### 8.1 搜索股票和板块
```bash
daxiapi search 平安
daxiapi search pa
daxiapi search 银行 --type bk
```
**预期结果**: 返回匹配的股票或板块列表

### 9. 红利类指数命令测试

#### 9.1 获取不同指数的打分
```bash
daxiapi dividend score -c 2.H30269
daxiapi dividend score -c 2.930955
daxiapi dividend score -c 1.000922
daxiapi dividend score -c 2.932365
```
**预期结果**: 返回红利类指数的打分数据

### 10. 错误处理测试

#### 10.1 测试无效参数
```bash
daxiapi zdt --type invalid
daxiapi sector gn --type invalid
daxiapi stock info invalid
daxiapi stock pattern invalid
daxiapi sector stocks --code invalid
```
**预期结果**: 返回错误信息，测试应该失败

## 测试注意事项

1. **Token有效性**: 确保提供的Token是有效的，否则大部分测试会失败
2. **网络连接**: 测试需要网络连接，确保网络畅通
3. **API限制**: 部分接口可能有频率限制，测试时注意间隔
4. **数据时效性**: 某些接口的数据在非交易时间可能为空或异常
5. **测试时间**: 完整测试大约需要5-10分钟

## 测试结果分析

### 通过标准
- 所有接口返回正确的数据结构
- 参数验证正常工作
- 错误处理符合预期

### 失败分析
如果测试失败，请检查：
1. Token是否有效
2. 网络连接是否正常
3. API服务是否可用
4. 参数格式是否正确

## 持续集成

可以将测试脚本集成到CI/CD流程中：

```yaml
# .github/workflows/test.yml
name: CLI Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '17'
      - run: npm install
      - run: node test_cli.js ${{ secrets.DAXIAPI_TOKEN }}
```

## 总结

本测试套件覆盖了CLI工具的所有主要功能，包括：
- ✅ 60+个测试用例
- ✅ 所有命令和子命令
- ✅ 所有参数组合（除了limit/lmt参数）
- ✅ 错误处理和边界情况
- ✅ Token验证和权限检查

通过运行这些测试，可以确保CLI工具的功能完整性和稳定性。
