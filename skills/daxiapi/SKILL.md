---
name: daxiapi
description: 当用户需要获取A股市场数据、板块分析、个股动量排名、市场温度、估值水平等金融数据时，调用大虾皮(daxiapi.com) API接口获取数据。支持市场宽度分析、行业相对强度、风格轮动判断，适用于自下向上选股策略。
metadata:
    category: 金融分析
    tags: [大虾皮, daxiapi, 金融分析, 股票, 市场热力图, 动量, 估值, 风格轮动]
    compatibility: [Linux, macOS, Windows]
    version: 1.0.0
    author: daxiapi team
    maintainer: daxiapi team
---

# 大虾皮 API Skill

大虾皮(daxiapi.com)提供专业的A股量化数据API服务，本skill指导如何正确调用这些接口。

## 何时使用（When）

当用户请求以下数据时，触发此 skill：

- 市场数据：主流指数、市场温度、风格轮动、估值水平
- 板块数据：行业板块、概念板块、板块热力图
- 个股数据：个股详情、动量排名、K线数据
- 涨跌停：涨停池、跌停池

## 如何执行（How）

### 方式一：CLI 命令行工具（推荐）

**重要：** 始终使用 `npx` 确保获取最新版本：

```bash
# 使用最新版本（推荐）
npx daxiapi-cli@latest market temp
npx daxiapi-cli@latest sector bk
npx daxiapi-cli@latest stock 000001

# 或全局安装后使用
npm install -g daxiapi-cli
daxiapi market temp
```

**配置 Token：**

```bash
# 方式一：环境变量（推荐）
export DAXIAPI_TOKEN=YOUR_TOKEN

# 方式二：CLI 配置
npx daxiapi-cli@latest config set token YOUR_TOKEN
```

**常用命令：**

| 命令                                                   | 说明                 |
| ------------------------------------------------------ | -------------------- |
| `npx daxiapi-cli@latest market`                        | 市场概览（主流指数） |
| `npx daxiapi-cli@latest market temp`                   | 市场温度分析         |
| `npx daxiapi-cli@latest market style`                  | 市场风格分析         |
| `npx daxiapi-cli@latest market value`                  | 市场估值数据         |
| `npx daxiapi-cli@latest sector`                        | 板块热力图           |
| `npx daxiapi-cli@latest sector bk`                     | 行业板块数据         |
| `npx daxiapi-cli@latest sector stocks --code <bkCode>` | 板块个股排名         |
| `npx daxiapi-cli@latest sector top`                    | 热门股票             |
| `npx daxiapi-cli@latest sector gn`                     | 热门概念             |
| `npx daxiapi-cli@latest stock <codes...>`              | 查询个股（支持多个） |
| `npx daxiapi-cli@latest kline <code>`                  | 获取K线数据          |
| `npx daxiapi-cli@latest zdt`                           | 涨停池               |
| `npx daxiapi-cli@latest secid <code>`                  | 代码转换             |

### 方式二：HTTP 请求

**认证方式：** `Authorization: Bearer YOUR_TOKEN`

```bash
# cURL 示例
curl -H "Authorization: Bearer YOUR_TOKEN" https://daxiapi.com/coze/get_index_data
```

```javascript
// JavaScript Fetch
const response = await fetch('https://daxiapi.com/coze/get_index_data', {
    headers: {Authorization: 'Bearer YOUR_TOKEN'}
});
```

**限流规则：**

- 每日上限：1000次
- 每分钟上限：10次
- 超限时返回 429 状态码

## 输出结果（What）

所有 API 返回统一格式：

```json
{
    "errCode": 0,
    "errMsg": "OK",
    "data": { ... }
}
```

**错误码：**

- `0` - 成功
- `401` - 认证失败（Token无效或非VIP）
- `404` - API不存在
- `429` - 请求频率超限
- `500` - 服务器错误

## 核心指标速览

### 动量指标

| 指标     | 说明                           | 使用场景                  |
| -------- | ------------------------------ | ------------------------- |
| **CS**   | 收盘价跟20日EMA均线的乖离率   | 入场阈值5-15，止损阈值<-5 |
| **SM**   | 中期动量（EMA20与EMA60乖离率） | 值>0表示多头排列          |
| **RPS**  | 相对强度（全市场排名百分比）   | RPS>80为强势股            |
| **SCTR** | 当前股票在市场股票中的排名     | 找出强于70%的股票          |

### 市场温度指标

| 指标         | 定义             | 关键阈值                     |
| ------------ | ---------------- | ---------------------------- |
| **估值温度** | 市盈率历史百分位 | <20低估，>70高估             |
| **恐贪指数** | 市场贪婪恐惧程度 | 0-10极度恐惧，90-100极度贪婪 |
| **趋势温度** | 股价高于MA60占比 | <20低迷，>80过热             |

### 风格轮动指标

| 指标               | 解读               |
| ------------------ | ------------------ |
| **大小盘波动差值** | >0小盘强，<0大盘强 |

## 可用API概览

| API类别 | 功能描述 | 详细说明 |
| ------- | ------- | ------- |
| **市场数据类** | 主流指数、市场温度、风格轮动、估值水平 | `references/api-reference.md#市场数据类` |
| **板块/概念类** | 行业板块热力图、行业数据、个股排名、热门概念 | `references/api-reference.md#板块概念类` |
| **个股查询类** | 股票搜索、个股详情、概念内个股、代码转换 | `references/api-reference.md#个股查询类` |
| **K线数据类** | 股票K线数据 | `references/api-reference.md#K线数据类` |
| **涨跌停类** | 涨停跌停股票池 | `references/api-reference.md#涨跌停类` |

## 数据更新频率

- **K线、热力图、个股数据**：每日收盘后更新
- **市场恐慌指数等汇总信息**：每日更新

## 注意事项

1. **Token安全**：API Token应在服务端使用，避免在前端代码中暴露
2. **限流策略**：高频请求会触发限流，建议合理控制请求频率
3. **数据延迟**：部分数据可能存在延迟，不构成投资建议
4. **CLI版本**：始终使用 `npx daxiapi-cli@latest` 确保获取最新版本

## 参考资料

- **API 参考文档**：`references/api-reference.md` - 详细API参数说明
- **字段说明**：`references/field-descriptions.md` - 专用名词和字段详细说明
- **市场分析框架**：`references/market-analysis.md` - 综合分析方法
- **市场风格分析**：`references/market-style-analysis.md` - 大小盘波动差值详解
- **市场温度分析**：`references/market-temp-analysis.md` - 四大温度指标详解
- **行业热力图分析**：`references/sector-heatmap-analysis.md` - 四维度分析方法
