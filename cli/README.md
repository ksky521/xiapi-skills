# daxiapi-cli

大虾皮金融数据API命令行工具。需要注册 daxiapi.com 网站，并且获取API Token之后才能使用。

## 安装

```bash
# 全局安装
npm install -g daxiapi-cli

# 或使用 pnpm
pnpm add -g daxiapi-cli
```

## 配置

首次使用需要配置 API Token（在 daxiapi.com 用户中心申请）：

```bash
# 方式一：配置文件
daxiapi config set token YOUR_API_TOKEN

# 方式二：环境变量
export DAXIAPI_TOKEN=YOUR_API_TOKEN
```

## 使用

### 配置管理

```bash
# 设置Token
daxiapi config set token YOUR_API_TOKEN

# 设置API地址（可选）
daxiapi config set baseUrl https://daxiapi.com

# 查看所有配置
daxiapi config get

# 删除配置
daxiapi config delete token
```

### 市场数据

```bash
# 市场概览（主流指数）
daxiapi market

# 市场温度
daxiapi market temp

# 市场风格
daxiapi market style

# 市场估值
daxiapi market value
```

### 板块数据

```bash
# 板块列表
daxiapi sector

# 指定排序和数量
daxiapi sector --order zdf --limit 10

# 行业板块数据
daxiapi sector bk

# 板块内个股排名
daxiapi sector stocks --code BK0457

# 热门股票（各板块领涨股）
daxiapi sector top

# 热门概念板块
daxiapi sector gn

# 使用同花顺数据源（默认）
daxiapi sector gn --type ths

# 使用东方财富数据源
daxiapi sector gn --type dfcf
```

### 股票数据

```bash
# 搜索股票或板块
daxiapi search 平安
daxiapi search 锂电 --type bk

# 查询单个股票
daxiapi stock info 000001

# 查询多个股票
daxiapi stock info 000001 600031 300750

# 概念股查询
daxiapi stock gn 881273

# 技术形态筛选股票
daxiapi stock pattern vcp
daxiapi stock pattern rps
daxiapi stock pattern newHigh
```

#### 支持的技术形态（pattern）

| 形态代码 | 说明 |
|---------|------|
| **价值指标类** | |
| gxl | 股息率大于3%的股票 |
| **强度指标类** | |
| rps | RPS大于70的股票（欧奈尔RPS指标） |
| sctr | SCTR大于70的股票（Stockcharts Rank相对强度排序） |
| rpsTop3 | RPS行业前三 |
| csTop3 | CS行业前三 |
| sctrTop3 | SCTR行业前三 |
| **趋势形态类** | |
| trendUp | K线趋势向上 |
| high_60d | 大量创60日新高 |
| newHigh | 新高附近 |
| crossMa50 | 上穿MA50 |
| crossoverBox | 价格行为交易法信号K，上穿箱体 |
| cs_crossover_20 | CS穿过MA20 |
| **成交量形态类** | |
| fangliang | 放量上涨（前一天是VCP/3C形态，当天放量突破收盘在高点） |
| fangliangtupo | 放量突破箱体 |
| **涨跌幅排名类** | |
| zdf1dTop3 | 1日涨幅行业前三 |
| zdf5dTop3 | 5日涨幅行业前三 |
| zdf10dTop3 | 10日涨幅行业前三 |
| zdf20dTop3 | 20日涨幅行业前三 |
| shizhiTop3 | 行业市值前三 |
| **经典技术形态类** | |
| vcp | 股魔VCP形态（波动收缩形态） |
| joc | 跨越小溪Joc |
| sos | 强势上涨SOS |
| sos_h1 | SOS之后出现高1入场点 |
| spring | Spring弹簧形态（上涨波段回调后出现spring向上） |
| w | SOS之后出现W底吸收 |
| lps | LPS最后供应点（SOS之后的LPS） |
| ibs | K线实体较大（当日放量上涨收盘超昨日高点，实体长度超当日幅度69%） |
```

### K线数据

```bash
# 获取K线数据
daxiapi kline 000001
```

### 涨跌停

```bash
# 涨停池
daxiapi zdt

# 跌停池
daxiapi zdt --type dt
```

### 成交额

```bash
# 获取A股市场成交额数据
daxiapi turnover
```

### 热榜数据

```bash
# 热股榜（默认：1小时、大家都在看）
daxiapi hotrank stock

# 热股榜 - 24小时维度
daxiapi hotrank stock --type day

# 热股榜 - 快速飙升个股
daxiapi hotrank stock --list-type skyrocket

# 热股榜 - 趋势投资派关注个股
daxiapi hotrank stock --list-type trend

# 热股榜 - 价值派关注个股
daxiapi hotrank stock --list-type value

# 热股榜 - 技术派关注个股
daxiapi hotrank stock --list-type tech

# 概念板块热榜
daxiapi hotrank concept

# 行业板块热榜
daxiapi hotrank board
```

#### 热股榜榜单类型（list-type）

| 榜单类型 | 说明 |
|---------|------|
| normal | 大家都在看（默认） |
| skyrocket | 快速飙升个股 |
| trend | 趋势投资派关注个股 |
| value | 价值派关注个股 |
| tech | 技术派关注个股 |

### 工具

```bash
# 代码转换
daxiapi secid 000001
```

> 💡 提示：`daxiapi` 命令也可以使用简写 `dxp`

## 全局选项

```bash
# 查看帮助
daxiapi --help
daxiapi market --help

# 查看版本
daxiapi --version
```

## 错误处理

CLI 工具提供详细的错误提示和解决建议：

### 认证错误 (401)

```
❌ 错误: API Token 无效或已过期

解决方法:
  1. 检查 Token 是否正确配置:
     daxiapi config set token YOUR_TOKEN

  2. 或设置环境变量:
     export DAXIAPI_TOKEN=YOUR_TOKEN

  3. Token 可在 daxiapi.com 用户中心获取
```

### 限流错误 (429)

```
❌ 错误: 请求频率超限

解决方法:
  1. 请稍后重试
  2. 检查您的请求频率是否过高
  3. 升级账户获取更高配额
```

## 限流规则

- 每日上限：1000次
- 每分钟上限：10次
- 超限返回 429 错误

## License

MIT
