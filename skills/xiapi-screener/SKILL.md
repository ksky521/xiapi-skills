---
name: xiapi-screener
description: 基于技术形态筛选股票。使用 daxiapi stock pattern 获取 VCP、RPS、新高突破、高股息等股票。
---

# 股票筛选器 Skill

基于技术形态筛选股票，进行智能排序和推荐分析。

## 何时使用（When）

当用户需要基于技术形态选股、筛选 VCP、RPS 强势股、创新高等时触发。

比如用户让：
- 找出高股息的股票
- 筛选 RPS 大于 70 的强势股
- 筛选新高股票
- 筛选上穿箱体的股票

## 如何执行（How）

### CLI 命令

```bash
# 获取指定形态的股票
npx daxiapi-cli@latest stock pattern <pattern_type>

# 常用形态：
# vcp - VCP 波动收缩形态
# rps - RPS 大于 70 的强势股
# newHigh - 创新高股票
# crossoverBox - 上穿箱体
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
  "https://daxiapi.com/coze/get_pattern_stocks?pattern=vcp"
```

## 支持的形态类型

### 强度指标类
- `rps` - RPS 大于 70
- `sctr` - SCTR 大于 70
- `rpsTop3` / `csTop3` / `sctrTop3` - 行业前三

### 趋势形态类
- `trendUp` - 趋势向上
- `newHigh` - 新高附近
- `crossMa50` - 上穿 MA50
- `crossoverBox` - 上穿箱体

### 经典技术形态类
- `vcp` - VCP 波动收缩形态
- `joc` - 跨越小溪
- `sos` - 强势上涨 SOS
- `spring` - Spring 弹簧形态
- `w` - W 底吸收
- `lps` - 最后供应点

完整形态列表详见 `daxiapi/references/field-descriptions.md`

## 分析方法

1. 获取符合形态的股票列表
2. 按动量强度、趋势质量、成交量综合评分
3. 分析行业分布和概念热点
4. 识别龙头股和风险点

## 输出结果（What）

输出包含：
- 股票列表表格
- 行业分布分析
- 龙头股推荐
- 风险提示

## 注意事项

- 数据每日收盘后更新
- 分析结果仅供参考，不构成投资建议
