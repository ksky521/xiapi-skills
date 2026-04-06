---
name: xiapi-style-rotation
description: 分析 A 股大小盘风格轮动。使用 daxiapi market style 获取大小盘波动差值，判断风格偏向。
---

# 大小盘风格轮动分析 Skill

分析 A 股市场大小盘风格轮动情况，判断市场风格偏向。

## 何时使用（When）

当用户需要分析大小盘风格、风格轮动、大盘股 vs 小盘股时触发。

## 如何执行（How）

### CLI 命令

```bash
npx daxiapi-cli@latest market style
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
curl -H "Authorization: Bearer YOUR_TOKEN" https://daxiapi.com/coze/get_market_style
```

## 分析方法

### 大小盘波动差值

计算中证2000（小盘）与沪深300（大盘）的涨跌幅差值：

| 差值情况 | 含义 |
|---------|------|
| 差值 > 0 | 小盘股强于大盘股，游资更积极 |
| 差值 < 0 | 大盘股强于小盘股，机构更积极 |
| 差值 ≈ ±10% | 可能出现均值回归，风格切换信号 |

### 分析步骤

1. 获取最新大小盘波动差值
2. 分析最近 20 日差值变化趋势
3. 判断当前风格偏向
4. 预测风格切换可能性
5. 给出投资建议

## 输出结果（What）

输出包含：
- 最新大小盘波动差值
- 变化趋势分析
- 当前风格判断
- 投资建议（大盘股/小盘股配置方向）

## 注意事项

- 不推荐具体个股和仓位
- 基于"模糊的正确"原则
- 数据每日收盘后更新
