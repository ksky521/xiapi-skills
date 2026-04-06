---
name: xiapi-price-limit-analysis
description: 分析 A 股涨跌停股票。使用 daxiapi zdt 获取数据，识别热门行业、板块和龙头股。
---

# 涨跌停分析 Skill

分析 A 股市场涨跌停股票，识别热门行业和板块。

## 何时使用（When）

当用户需要分析涨停跌停股票、热门行业、龙头股时触发。

## 如何执行（How）

### CLI 命令

```bash
# 获取涨停股票
npx daxiapi-cli@latest zdt --type zt

# 获取跌停股票
npx daxiapi-cli@latest zdt --type dt
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
curl -H "Authorization: Bearer YOUR_TOKEN" https://daxiapi.com/coze/get_zt_stocks
```

## 分析方法

### 关键指标

| 指标 | 说明 |
|-----|------|
| CS | 收盘价与 20 日 EMA 乖离率，代表短期走势强弱 |
| RPS | 欧奈尔相对强度，全市场排名百分比 |

### 分析步骤

1. 获取涨跌停股票数据
2. 排除通用概念（机构重仓、AB股、涨跌停等）
3. 统计各行业/概念涨停数量
4. 基于 CS 和 RPS 分析强势程度
5. 识别龙头股

## 输出结果（What）

输出包含：
- 行业/概念涨停统计表格
- 龙头股识别
- 共性分析和驱动因素

## 注意事项

- 数据每日收盘后更新
- 分析结果仅供参考，不构成投资建议
