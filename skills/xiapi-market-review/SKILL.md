---
name: xiapi-market-review
description: A 股市场全面复盘。整合指数表现、板块热力图、涨跌停、风格轮动、市场温度分析，生成综合报告。
---

# 市场复盘 Skill

对当天 A 股市场进行全面复盘，整合多个分析维度生成综合报告。

## 何时使用（When）

当用户询问"今天市场怎么样"、"市场分析"、"市场复盘"时触发。

## 如何执行（How）

### 工作流程

本 skill 整合以下分析：

| 步骤 | 分析内容 | 调用 Skill/命令 |
|-----|---------|----------------|
| 1 | 市场主流指数表现 | `daxiapi market` |
| 2 | 板块热力图分析 | `xiapi-heatmap-analysis` |
| 3 | 大小盘风格分析 | `xiapi-style-rotation` |
| 4 | 市场温度分析 | `xiapi-market-temperature` |
| 5 | 涨跌停分析 | `xiapi-price-limit-analysis` |
| 6 | 热门股票分析 | `xiapi-top-stocks` |

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

## 输出结果（What）

输出包含：
- 市场概览（指数表现）
- 市场温度分析
- 大小盘风格分析
- 板块热力图分析
- 涨跌停分析
- 总结与投资建议

## 注意事项

- 结论先行，不预测市场，学会应对市场
- 禁止绝对化表述，禁止贬低散户
- 报告末尾标注：该报告使用大虾皮(daxiapi.com)数据 +AI 生成，投资需谨慎
