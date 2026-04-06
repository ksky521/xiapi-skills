---
name: xiapi-heatmap-analysis
description: 分析 A 股板块热力图。使用 daxiapi sector heatmap/gn/top 获取数据，识别领涨、上升、反转行业。
---

# 市场板块热力图分析 Skill

分析 A 股市场板块热力图，识别热门行业和板块。

## 何时使用（When）

当用户需要分析板块热力图、行业轮动、热门板块时触发。

## 如何执行（How）

### CLI 命令

```bash
# 获取行业板块热力图
npx daxiapi-cli@latest sector heatmap

# 获取热门概念板块
npx daxiapi-cli@latest sector gn

# 获取各板块领涨股
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
curl -H "Authorization: Bearer YOUR_TOKEN" https://daxiapi.com/coze/get_sector_heatmap
curl -H "Authorization: Bearer YOUR_TOKEN" https://daxiapi.com/coze/get_sector_gn
curl -H "Authorization: Bearer YOUR_TOKEN" https://daxiapi.com/coze/get_sector_top
```

## 分析方法

### CS 指标阈值

- 入场：偏离度适中（5-15），不追高（>15）
- 止损：CS > 0 无需担忧；-5 ~ 0 建议坚守；< -5 建议离场

### 分析步骤

1. **板块热度延续与扩散**：对比今昨领涨板块，判断热度延续性和扩散情况
2. **找领涨行业**：依据动量指标变化确定领涨行业（CS > 5 才可能成为领涨龙头）
3. **找上升行业**：找出连续多日动量上升的行业
4. **找反转行业**：分析底部区域行业的反转可能性

### 输入数据

- CS 热力图表格
- 当日/5日涨跌幅热力图
- CS 大于 20 日均线板块
- CS 大于 5 板块
- 领涨股票表格
- 概念板块数据

## 输出结果（What）

输出包含：
- 今日收评
- 市场热力图分析（领涨/上升/反转板块表格）
- 市场趋势扩散分析
- 总结

## 注意事项

- 仅围绕热力图数据展开分析
- 推荐板块需符合 CS > 0，反转板块需近期 CS 连续 2 次上涨
- 禁止使用绝对化表述，禁止贬低散户
- 数据每日收盘后更新
