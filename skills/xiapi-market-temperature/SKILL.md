---
name: xiapi-market-temperature
description: 分析 A 股市场温度。使用 daxiapi market temp 获取估值温度、恐贪指数、趋势温度、动量温度，判断市场状态。
---

# 市场温度分析 Skill

分析 A 股市场温度指标，判断市场现状和变化趋势。

## 何时使用（When）

当用户需要分析市场温度、市场估值、情绪分析时触发。

## 如何执行（How）

### CLI 命令

```bash
npx daxiapi-cli@latest market temp
```

### Token 配置

**获取 Token：**
- 登录大虾皮网站（daxiapi.com）
- 进入会员中心 → API 管理 → 获取 API Token

**配置方法：**

**方式一：环境变量（推荐）**
```bash
# Linux/macOS
export DAXIAPI_TOKEN=YOUR_TOKEN_FROM_DAXIAPI

# Windows
set DAXIAPI_TOKEN=YOUR_TOKEN_FROM_DAXIAPI
```

**方式二：CLI 配置**
```bash
npx daxiapi-cli@latest config set token YOUR_TOKEN_FROM_DAXIAPI
npx daxiapi-cli@latest config get token
```

### HTTP API 请求

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" https://daxiapi.com/coze/get_market_temp
```

## 分析方法

### 四大温度指标

| 指标 | 定义 | 关键阈值 |
|-----|------|---------|
| 估值温度 | 市盈率历史百分位 | <20 低估，>70 高估（长期指标） |
| 恐贪指数 | 市场贪婪恐惧程度 | 0-10 极度恐惧，90-100 极度贪婪 |
| 趋势温度 | 股价高于 MA60 占比 | <20 低迷，>80 过热 |
| 动量温度 | 动量值中位数百分位 | <20 偏弱，>80 强势 |

### 分析步骤

1. 获取最新温度数据
2. 分析最近 20 天指标变动趋势
3. 识别买入信号（短期看情绪，长期看估值）
4. 给出投资建议

## 输出结果（What）

输出包含：
- 市场最新数据表格
- 变化趋势分析
- 结论与投资建议

## 注意事项

- 短期看情绪，长期看估值
- 综合多个指标判断，避免单一指标误导
- 数据每日收盘后更新
