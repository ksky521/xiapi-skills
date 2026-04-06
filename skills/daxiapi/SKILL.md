---
name: daxiapi
description: 大虾皮(daxiapi.com) API 服务入口。当用户需要获取 A 股市场数据时触发，负责路由分发到具体分析 skill。
---

# 大虾皮 API Skill

大虾皮(daxiapi.com)提供专业的 A 股量化数据 API 服务，本 skill 作为入口，负责路由分发到具体分析 skill。

## 何时使用（When）

当用户请求以下数据时，触发此 skill 进行路由分发：

| 用户需求 | 调用 Skill | CLI 命令示例 |
|---------|-----------|-------------|
| 市场复盘、今日市场情况 | `xiapi-market-review` | `daxiapi market` |
| 市场温度、估值分析 | `xiapi-market-temperature` | `daxiapi market temp` |
| 大小盘风格轮动 | `xiapi-style-rotation` | `daxiapi market style` |
| 板块热力图、行业分析 | `xiapi-heatmap-analysis` | `daxiapi sector heatmap` |
| 涨停跌停股票分析 | `xiapi-price-limit-analysis` | `daxiapi zdt --type zt` |
| 热门股票、领涨股 | `xiapi-top-stocks` | `daxiapi sector top` |
| 技术形态选股 | `xiapi-screener` | `daxiapi stock pattern <type>` |
| 红利指数分析 | `xiapi-dividend-analysis` | `daxiapi dividend score -c <code>` |

## 如何执行（How）

### CLI 基本用法

```bash
# 使用最新版本（推荐）
npx daxiapi-cli@latest <command> <subcommand>

# 别名
dxp <command> <subcommand>
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

**认证方式：** `Authorization: Bearer YOUR_TOKEN`

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" https://daxiapi.com/coze/<endpoint>
```

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
- `401` - 认证失败（Token 无效或非 VIP）
- `404` - API 不存在
- `429` - 请求频率超限
- `500` - 服务器错误

## 限流规则

- 每日上限：1000 次
- 每分钟上限：10 次
- 超限时返回 429 状态码

## 注意事项

1. **Token 安全**：API Token 应在服务端使用，避免在前端代码中暴露
2. **CLI 版本**：始终使用 `npx daxiapi-cli@latest` 确保获取最新版本
3. **数据延迟**：部分数据可能存在延迟，不构成投资建议

## 参考资料

- **API 参考**：`references/api-reference.md` - 详细 API 参数说明
- **字段说明**：`references/field-descriptions.md` - 专用名词和字段详细说明
- **市场分析框架**：`references/market-analysis.md` - 综合分析方法
