---
name: xiapi-top-stocks
description: 分析热门股票和板块资金流向。使用 daxiapi sector top 获取各板块领涨股。
---

# 热门股票分析 Skill

分析今日市场表现较好的股票，识别热门股票和板块资金流向。

## 何时使用（When）

当用户需要分析热门股票、领涨股、板块资金流向时触发。

## 如何执行（How）

### CLI 命令

```bash
npx daxiapi-cli@latest sector top
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
curl -H "Authorization: Bearer YOUR_TOKEN" https://daxiapi.com/coze/get_sector_top
```

## 分析方法

1. 获取各板块领涨股数据
2. 统计各行业/概念领涨股票数量
3. 分析领涨股上涨强度和持续性
4. 分析板块资金流向
5. 识别核心炒作题材

## 输出结果（What）

输出包含：
- 领涨板块分布表格
- 热门股票列表
- 热点概念分析
- 市场热点总结

## 注意事项

- 数据每日收盘后更新
- 分析结果仅供参考，不构成投资建议
