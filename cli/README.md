# daxiapi-cli

大虾皮金融数据API命令行工具。需要注册 [daxiapi.com](https://daxiapi.com) 并获取 API Token 后才能使用。

> 💡 `daxiapi` 命令也可以使用简写 `dxp`

## 安装

```bash
# 全局安装
npm install -g daxiapi-cli

# 或使用 npx（无需安装，始终使用最新版）
npx daxiapi-cli@latest market index
```

## 配置

首次使用需要配置 API Token（在 daxiapi.com 用户中心申请）：

```bash
# 方式一：配置文件（推荐）
daxiapi config set token YOUR_API_TOKEN

# 方式二：环境变量
export DAXIAPI_TOKEN=YOUR_API_TOKEN
```

### 配置管理命令

```bash
# 查看所有配置
daxiapi config get

# 设置配置项
daxiapi config set token YOUR_API_TOKEN
daxiapi config set baseUrl https://daxiapi.com

# 删除配置项
daxiapi config delete token
```

---

## 命令一览

### 市场数据

```bash
# 主流指数行情（CS强度、多日涨跌幅）
daxiapi market index

# 市场三维结构综合判断（趋势+估值+情绪），推荐优先使用
daxiapi market compass

# 市场温度原始数据（估值温度、恐贪指数、趋势温度、动量温度）
daxiapi market temp

# 大小盘风格轮动（中证2000 vs 沪深300 差值及历史百分位）
daxiapi market style

# 主要指数估值（PE、PB、估值温度、历史百分位）
daxiapi market value
```

---

### 板块数据

```bash
# 板块热力图（按 CS 强度排序，默认展示前5）
daxiapi sector heatmap

# 按涨跌幅排序，展示前10
daxiapi sector heatmap --order zdf --limit 10

# 行业板块列表（今日涨幅、CS强度、CS均线）
daxiapi sector bk

# 板块内个股排名（按 CS 强度排序）
daxiapi sector stocks --code BK0457

# 板块内个股排名（按涨跌幅排序）
daxiapi sector stocks --code BK0457 --order zdf

# 热门股票（当日涨幅>7% 且 IBS>50 的强势股，按板块分组）
daxiapi sector top

# 热门概念板块（同花顺，默认）
daxiapi sector gn

# 热门概念板块（东方财富数据源）
daxiapi sector gn --type dfcf
```

**sector stocks 排序字段**：`cs`（CS强度）、`zdf`（涨跌幅）、`sm`（市值）、`cg`（成交额）、`cr`（换手率）、`sctr`（SCTR排名）

---

### 个股数据

```bash
# 查询单只股票详情
daxiapi stock info 000001

# 批量查询（最多20只，空格或逗号分隔）
daxiapi stock info 000001 600031 300750

# 查询概念板块成分股（同花顺板块ID）
daxiapi stock gn 881273

# 查询概念板块成分股（东方财富板块ID）
daxiapi stock gn BK0428 --type dfcf

# 技术形态选股
daxiapi stock pattern vcp
daxiapi stock pattern rps
daxiapi stock pattern newHigh

# 个股主力资金流向（默认5天）
daxiapi stock capital-flow 600031

# 个股主力资金流向（指定天数，最多30天）
daxiapi stock capital-flow 600031 --days 10
```

#### 技术形态类型（stock pattern）

| 形态代码 | 说明 |
|---------|------|
| **价值指标类** | |
| `gxl` | 高股息率（股息率 > 3%） |
| **强度指标类** | |
| `rps` | RPS > 70（欧奈尔相对强度） |
| `sctr` | SCTR > 70（Stockcharts 综合排名） |
| `rpsTop3` | RPS 行业前三 |
| `csTop3` | CS 强度行业前三 |
| `sctrTop3` | SCTR 行业前三 |
| **趋势形态类** | |
| `trendUp` | K线趋势向上 |
| `high_60d` | 近期创60日新高 |
| `newHigh` | 年度新高附近 |
| `crossMa50` | 上穿 MA50 |
| `crossoverBox` | 价格行为信号K（上穿箱体） |
| `cs_crossover_20` | CS 强度穿过 MA20 |
| **成交量形态类** | |
| `fangliang` | 放量上涨（前日VCP形态，当日放量突破） |
| `fangliangtupo` | 放量突破箱体 |
| **涨跌幅排名类** | |
| `zdf1dTop3` | 1日涨幅行业前三 |
| `zdf5dTop3` | 5日涨幅行业前三 |
| `zdf10dTop3` | 10日涨幅行业前三 |
| `zdf20dTop3` | 20日涨幅行业前三 |
| `shizhiTop3` | 市值行业前三 |
| **经典技术形态类** | |
| `vcp` | VCP 波动收缩形态（股票魔法师） |
| `joc` | Joc 越过小溪（威科夫） |
| `sos` | SOS 强势上涨（威科夫） |
| `sos_h1` | SOS 后出现高1入场点 |
| `spring` | Spring 弹簧形态（威科夫） |
| `w` | SOS 后出现 W 底吸收 |
| `lps` | LPS 最后供应点（威科夫） |
| `ibs` | K线实体较大（放量上涨，收盘超昨日高点） |

---

### 涨跌停

```bash
# 涨停池（默认）
daxiapi zdt

# 跌停池
daxiapi zdt --type dt

# 炸板池
daxiapi zdt --type zb
```

---

### 热榜数据

```bash
# 热股榜（默认：1小时维度，大家都在看）
daxiapi hotrank stock

# 热股榜 - 24小时维度
daxiapi hotrank stock --type day

# 热股榜 - 快速飙升个股
daxiapi hotrank stock --list-type skyrocket

# 热股榜 - 趋势投资派关注
daxiapi hotrank stock --list-type trend

# 热股榜 - 价值派关注
daxiapi hotrank stock --list-type value

# 热股榜 - 技术派关注
daxiapi hotrank stock --list-type tech

# 概念板块热榜
daxiapi hotrank concept

# 行业板块热榜
daxiapi hotrank board
```

**热股榜说明**：`--type`（`hour`/`day`）仅对 `normal` 和 `skyrocket` 榜单有效；`trend`/`value`/`tech` 榜单固定使用日维度。

---

### 成交额

```bash
# 全市场成交额及较昨日变化
daxiapi turnover
```

---

### 红利指数

```bash
# 红利低波指数打分（默认）
daxiapi dividend score

# 指定指数
daxiapi dividend score -c 2.H30269    # 红利低波
daxiapi dividend score -c 2.930955    # 红利低波100
daxiapi dividend score -c 1.000922    # 中证红利
daxiapi dividend score -c 2.932365    # 中证现金流
```

---

### 财报数据

```bash
# 获取个股财务报表数据
daxiapi report finance 300014
daxiapi report finance 600036
```

---

### 新闻数据

```bash
# 个股舆情（内部自动将 code 转为 secid）
daxiapi news sentiment -c 600031

# 指定条数
daxiapi news sentiment -c 600031 -p 20

# 个股公告
daxiapi news notice -c 600031

# 个股公告（翻页）
daxiapi news notice -c 600031 -p 20 -i 2

# 个股研报（指定时间区间）
daxiapi news report -c 600031 -b 2026-01-01 -e 2026-04-09
```

---

### 工具命令

```bash
# 搜索股票（支持名称、拼音缩写）
daxiapi search 平安
daxiapi search 宁德时代

# 搜索板块
daxiapi search 锂电 --type bk

# 代码格式转换（转为标准 secid 格式）
daxiapi secid 000001    # → 0.000001
daxiapi secid 600031    # → 1.600031

# K线数据
daxiapi kline 000001
daxiapi kline 1.600031
```

---

## 全局选项

```bash
# 查看帮助
daxiapi --help
daxiapi market --help
daxiapi stock --help

# 查看版本
daxiapi --version
```

---

## 错误处理

### 认证错误 (401)

```
❌ 错误: API Token 无效或已过期

解决方法:
  1. 检查 Token 是否正确配置:
     daxiapi config get token
  2. 重新配置:
     daxiapi config set token YOUR_TOKEN
  3. 或设置环境变量:
     export DAXIAPI_TOKEN=YOUR_TOKEN
  4. Token 可在 daxiapi.com 用户中心获取
```

### 限流错误 (429)

```
❌ 错误: 请求频率超限

解决方法:
  1. 等待 30-60 秒后重试
  2. 检查请求频率是否过高
```

## 限流规则

- 每日上限：1000 次
- 每分钟上限：10 次
- 超限返回 429 错误

## License

MIT
