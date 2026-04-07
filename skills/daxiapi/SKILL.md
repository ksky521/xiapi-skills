---
name: daxiapi
description: '大虾皮(daxiapi.com)金融数据API服务入口，负责路由分发到具体分析skill。触发词：A股数据、市场数据、股票分析、板块分析、选股、市场复盘。适用场景：获取A股市场数据时的统一入口，根据用户需求分发到对应的专业skill。不适用场景：非A股市场分析、非金融数据分析、纯技术问答。'
---

# 大虾皮 API 路由 Skill

大虾皮(daxiapi.com)提供专业的A股量化数据API服务，本skill作为统一入口，负责识别用户意图并路由分发到具体分析skill。

## Overview（功能概述）

识别用户的金融数据分析需求，智能匹配并调用对应的专业skill，确保分析质量和效率。如果已有明确的专业skill覆盖用户需求，则直接调用该skill；否则提供通用CLI命令供用户使用。

## When to Use（何时使用）

当用户请求以下数据时，触发此skill进行路由分发：

- A股市场相关数据查询
- 板块、行业分析需求
- 股票筛选和选股需求
- 市场情绪、温度、估值分析
- 风格轮动、大小盘分析

**具体触发词**：A股数据、市场数据、股票分析、板块分析、选股、市场复盘

## When Not to Use（何时不使用）

以下场景不应使用本Skill：

- 非A股市场分析（美股、港股、债券、基金、期货等）
- 非金融数据分析需求
- 纯技术问答或编程问题
- 理论知识讲解（如"什么是EMA"）

## Process（流程主体）

### Step 1: 意图识别与路由分发

**目标**：识别用户的具体需求，匹配对应的专业skill

**路由映射表**：

| 用户需求关键词 | 匹配Skill | 说明 |
|--------------|-----------|------|
| 市场复盘、今天市场怎么样、市场分析、每日复盘 | `xiapi-market-review` | 综合市场复盘 |
| 市场温度、市场估值、恐贪指数、市场情绪 | `xiapi-market-temperature` | 市场温度分析 |
| 大小盘风格、风格轮动、大盘股小盘股、风格切换 | `xiapi-style-rotation` | 风格轮动分析 |
| 板块热力图、行业轮动、热门板块、领涨板块 | `xiapi-heatmap-analysis` | 板块热力图分析 |
| 涨停、跌停、炸板、涨跌停分析 | `xiapi-price-limit-analysis` | 涨跌停分析 |
| 热门股票、领涨股、强势股、涨幅榜 | `xiapi-top-stocks` | 热门股票分析 |
| 股票筛选、选股、VCP形态、RPS强势股、创新高、技术形态 | `xiapi-screener` | 技术形态选股 |
| 红利指数、红利分析、中证红利、红利低波、股息率指数 | `xiapi-dividend-analysis` | 红利指数分析 |

**路由判断流程**：

1. **扫描关键词**：从用户输入中提取关键词
2. **匹配Skill**：根据路由映射表匹配对应skill
3. **直接调用**：找到匹配skill后，直接调用该skill执行分析
4. **无匹配处理**：如无明确匹配，进入Step 2通用处理

**示例**：

```
用户输入："分析一下红利低波指数"
匹配结果：关键词包含"红利低波" → 调用 `xiapi-dividend-analysis`

用户输入："今天涨停板有哪些？"
匹配结果：关键词包含"涨停" → 调用 `xiapi-price-limit-analysis`

用户输入："帮我选一些VCP形态的股票"
匹配结果：关键词包含"VCP形态"、"选股" → 调用 `xiapi-screener`
```

---

### Step 2: 通用处理（无明确匹配时）

**触发条件**：用户需求无法匹配到具体skill

**处理方式**：

1. **提供CLI命令**：直接提供对应的CLI命令供用户使用
2. **说明数据范围**：告知用户该命令能获取的数据类型
3. **引导到相关skill**：如有相关skill，推荐用户使用

**CLI 命令速查表**：

### 配置管理

| 命令 | 说明 | 示例 |
|------|------|------|
| `config set <key> <value>` | 设置配置项 | `daxiapi config set token YOUR_TOKEN` |
| `config get` | 查看所有配置 | `daxiapi config get` |
| `config delete <key>` | 删除配置项 | `daxiapi config delete token` |

### 市场数据

| 命令 | 说明 | 示例 |
|------|------|------|
| `market index` | 获取A股市场主流指数数据（上证指数、深证成指、沪深300、上证50、中证500、创业板指、科创50等） | `daxiapi market index` |
| `market temp` | 获取A股市场温度数据（估值温度、恐贪指数、趋势温度、动量温度等） | `daxiapi market temp` |
| `market style` | 获取A股市场风格数据（大小盘风格轮动） | `daxiapi market style` |
| `market value` | 获取A股主要指数估值数据（PE、PB、估值温度、百分位等） | `daxiapi market value` |

### 板块数据

| 命令 | 说明 | 示例 |
|------|------|------|
| `sector heatmap` | 获取A股板块热力图数据（支持按强度、涨跌幅排序） | `daxiapi sector heatmap --order cs --limit 5` |
| `sector bk` | 获取A股行业板块数据（同花顺分类） | `daxiapi sector bk` |
| `sector stocks` | 获取A股指定板块内股票排名（支持多维度排序） | `daxiapi sector stocks --code BK0428 --order cs` |
| `sector top` | 获取A股热门股票数据（涨幅>7%且IBS>50） | `daxiapi sector top` |
| `sector gn` | 获取A股热门概念板块列表 | `daxiapi sector gn --type ths` |

### 个股数据

| 命令 | 说明 | 示例 |
|------|------|------|
| `stock info <codes...>` | 根据股票代码获取详细信息（支持批量，最多20只） | `daxiapi stock info 000001 600031 300750` |
| `stock gn <gnId>` | 根据概念板块ID获取该概念下的所有股票 | `daxiapi stock gn GN1234 --type ths` |
| `stock pattern <pattern>` | 根据技术形态筛选股票（支持27种形态） | `daxiapi stock pattern vcp` |

**技术形态类型**：
- 强度指标类：`gxl`、`rps`、`sctr`、`csTop3`、`sctrTop3`、`rpsTop3`
- 趋势形态类：`trendUp`、`high_60d`、`newHigh`、`crossMa50`、`crossoverBox`
- 成交量形态类：`fangliang`、`fangliangtupo`
- 涨跌幅排名类：`zdf1dTop3`、`zdf5dTop3`、`zdf10dTop3`、`zdf20dTop3`
- 经典技术形态类：`vcp`、`joc`、`sos`、`spring`、`w`、`lps`、`sos_h1`
- 其他：`ibs`、`shizhiTop3`

### K线数据

| 命令 | 说明 | 示例 |
|------|------|------|
| `kline <code>` | 获取A股股票、指数、板块的K线数据 | `daxiapi kline 000001` |

### 涨跌停数据

| 命令 | 说明 | 示例 |
|------|------|------|
| `zdt` | 获取A股涨跌停股票池数据 | `daxiapi zdt --type zt` |

**类型参数**：
- `zt` - 涨停
- `dt` - 跌停
- `zb` - 炸板

### 代码转换与搜索

| 命令 | 说明 | 示例 |
|------|------|------|
| `secid <code>` | 将各种股票代码格式转换为标准secid格式 | `daxiapi secid 000001` |
| `search <keyword>` | 搜索A股股票或板块（支持模糊查询） | `daxiapi search 平安 --type stock` |

### 红利指数

| 命令 | 说明 | 示例 |
|------|------|------|
| `dividend score` | 获取红利类指数的打分数据 | `daxiapi dividend score -c 2.H30269` |

**常用指数代码**：
- `2.H30269` - 红利低波
- `2.930955` - 红利低波100
- `1.000922` - 中证红利
- `2.932365` - 中证现金流

### 热榜数据

| 命令 | 说明 | 示例 |
|------|------|------|
| `hotrank stock` | 获取A股热股榜数据 | `daxiapi hotrank stock --type hour --list-type normal` |
| `hotrank concept` | 获取A股概念板块热榜数据 | `daxiapi hotrank concept` |
| `hotrank board` | 获取A股行业板块热榜数据 | `daxiapi hotrank board --type industry` |

**热股榜类型**：
- `normal` - 大家都在看
- `skyrocket` - 快速飙升个股
- `trend` - 趋势投资派关注个股
- `value` - 价值派关注个股
- `tech` - 技术派关注个股

### 成交额数据

| 命令 | 说明 | 示例 |
|------|------|------|
| `turnover` | 获取A股市场成交额数据 | `daxiapi turnover` |

### 财报数据

| 命令 | 说明 | 示例 |
|------|------|------|
| `report finance <code>` | 获取指定股票的财务报表数据 | `daxiapi report finance 300014` |

---

### Step 3: Token 配置检查（可选）

**触发条件**：用户首次使用或提示认证失败

**跳过条件**：Token已配置且有效

**执行步骤**：

**步骤 3.1：检查Token配置状态**

```bash
npx daxiapi-cli@latest config get token
```

**步骤 3.2：如未配置，获取Token**

1. 提示用户访问 [daxiapi.com](https://daxiapi.com) 个人主页
2. 开通API Token功能
3. 获取生成的Token

**步骤 3.3：配置Token**

```bash
# 方式一：通过CLI配置（推荐）
npx daxiapi-cli@latest config set token YOUR_TOKEN_FROM_DAXIAPI

# 方式二：设置环境变量
export DAXIAPI_TOKEN=YOUR_TOKEN_FROM_DAXIAPI
```

**步骤 3.4：验证配置**

```bash
npx daxiapi-cli@latest market
```

如返回正常市场数据，则配置成功。

## Quality Checks（质量检查）

### 路由准确性检查

| 检查项 | 说明 | 标准 |
|-------|------|------|
| ✅ 关键词匹配 | 是否正确识别用户意图关键词 | 至少匹配1个关键词 |
| ✅ Skill调用 | 是否调用了正确的skill | skill名称与需求一致 |
| ✅ 降级处理 | 无匹配时是否提供有效方案 | 提供CLI命令或引导 |

### 服务质量检查

| 检查项 | 说明 | 标准 |
|-------|------|------|
| ✅ Token状态 | 是否检查Token配置 | 首次使用时检查 |
| ✅ 错误处理 | 认证失败是否有明确提示 | 提供配置指引 |
| ✅ 用户引导 | 是否提供清晰的使用说明 | 说明数据范围和限制 |

## Common Pitfalls（常见陷阱）

| 陷阱 | 说明 | 避免方法 |
|-----|------|----------|
| 误判意图 | 将单一指标需求误判为综合分析 | 优先匹配具体skill，再考虑综合skill |
| 重复路由 | 在路由skill和具体skill之间循环调用 | 明确区分路由层和执行层职责 |
| 忽略Token | 未检查Token配置直接调用API | 首次使用时强制检查Token状态 |

## Key Principles（重要原则）

1. **精确匹配优先**：优先匹配具体的专业skill，避免泛泛调用
2. **避免重复分析**：不要同时调用多个有重叠功能的skill
3. **降级有方案**：无匹配skill时，提供有效的CLI命令
4. **Token透明**：首次使用时主动检查Token配置状态

## Error Handling（错误处理）

### 路由错误

**错误1：无匹配skill**

- 场景：用户需求无法匹配到任何skill
- 处理：提供相关CLI命令，说明数据范围

**错误2：多skill匹配**

- 场景：用户需求同时匹配多个skill
- 处理：选择最具体的skill，或询问用户具体需求

### 认证错误

**错误3：Token缺失或失效**

```bash
# 错误表现
401 Unauthorized
Authentication failed

# 处理方式
npx daxiapi-cli@latest config get token  # 检查配置
npx daxiapi-cli@latest config set token YOUR_TOKEN  # 重新配置
```

**错误4：请求频率超限**

```bash
# 错误表现
429 Too Many Requests

# 处理方式
等待30-60秒后重试
```

## References

详细文档请参考：

- [API参考](references/api-reference.md) - 详细API参数说明
- [字段说明](references/field-descriptions.md) - 专用名词和字段详细说明

