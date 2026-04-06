---
name: xiapi-dividend-analysis
description: 分析红利类指数投资机会。使用 daxiapi dividend score 获取数据，判断超买超卖状态并给出投资建议。
---

# 红利类指数分析 Skill

分析红利类指数的投资机会，基于打分算法判断超买超卖状态。

## 何时使用（When）

当用户需要分析红利类指数（红利低波、中证红利、中证现金流等）的投资机会时触发。

## 如何执行（How）

### CLI 命令

```bash
# 获取红利类指数打分数据
npx daxiapi-cli@latest dividend score -c <code>

# 常用指数代码：
# 红利低波：2.H30269
# 红利低波100：2.930955
# 中证红利：1.000922
# 中证现金流：2.932365
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
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://daxiapi.com/coze/get_dividend_score?code=2.H30269"
```

## 分析方法

1. **数据获取**：获取红利类指数的打分数据（日期、分数、cs值、rsi值）
2. **趋势分析**：分析最近 60 天的打分走势变化
3. **状态判断**：
   - 分数 < 20：超卖（可考虑抄底）
   - 分数 > 80：超买（需考虑止盈）
   - 20-80：正常状态
4. **投资建议**：根据超买超卖状态和趋势给出建议

## 输出结果（What）

输出包含：
- 指数基本信息（名称、代码、最新日期、最新分数）
- 超买超卖状态判断
- 趋势分析
- 投资建议

## 注意事项

- 分析结果仅供参考，不构成投资建议
- 数据每日收盘后更新
