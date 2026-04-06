# AGENTS.md

## 项目定位

`xiapi-skills` 是一个围绕大虾皮（`daxiapi.com`）数据能力构建的仓库，包含两部分：

- `cli/`：Node.js 命令行工具（`daxiapi-cli`）
- `skills/`：面向 Agent 的金融分析 Skill 定义与参考资料

目标是让 Agent 可以稳定调用 CLI/API，并输出结构化、可复用的市场分析结果。

## 仓库结构

- `cli/bin/index.js`：CLI 入口
- `cli/commands/`：各业务命令（market、sector、stock、dividend 等）
- `cli/lib/`：请求、配置、输出、错误处理等公共逻辑
- `cli/test/`：CLI 测试脚本
- `skills/daxiapi/`：总入口 Skill（路由到子 Skill）
- `skills/xiapi-*/`：具体分析 Skill（市场复盘、热力图、红利指数等）
- `skills/*/references/`：该 Skill 的参数、字段、流程补充文档
- `docs/skill-quality-guide.md`：Skill 质量评估与改进指南

## 开发环境与常用命令

在 `cli/` 目录执行：

```bash
npm install
node bin/index.js --help
npm test
```

常用手动验证：

```bash
node bin/index.js market index
node bin/index.js sector heatmap
node bin/index.js dividend score -c 2.H30269
```

如需真实数据，请先配置：

```bash
node bin/index.js config set token <YOUR_TOKEN>
# 或使用环境变量
export DAXIAPI_TOKEN=<YOUR_TOKEN>
```

## 代码与改动原则

- 修改现有文件前，先完整阅读文件内容，优先做增量修改。
- 非明确要求下，不做大规模重写，不改无关文件。
- 保持 CLI 参数、输出格式与错误文案向后兼容。
- 新增命令时，保持与现有命令风格一致：
    - 参数命名与短别名一致
    - 错误提示可操作（告诉用户如何修复）
    - 输出结构稳定，便于 Skill 消费
- 变更 `cli/lib/api.js` 等核心文件时，必须确认原有导出方法未意外丢失。

## Skill 编写与维护规范

### Frontmatter 规范

每个 Skill 的 `SKILL.md` 顶部必须包含：

```yaml
---
name: <skill-name>
description: <清晰触发词 + 适用场景 + 不适用场景>
---
```

### 内容结构建议

建议按以下顺序组织：

1. 功能概述（Overview）
2. 何时使用（When to Use）
3. 执行流程（Process）
4. 报告模板（Report Template）
5. 质量检查（Quality Checks）
6. 常见陷阱（Common Pitfalls）
7. 错误处理（Error Handling）
8. 参考资料（References）

### 质量要求

- 明确触发词，避免“泛描述”。
- 限定边界：说明不适用场景。
- 减少通用常识，聚焦领域专有信息。
- 提供可执行命令示例（优先 `npx daxiapi-cli@latest ...`）。
- 包含真实可落地的 gotchas（如 Token、限流、代码格式）。
- 投资相关输出需包含风险提示与免责声明，避免绝对化措辞。

## 提交前检查清单

### CLI 变更

- 能通过 `node bin/index.js --help`。
- 相关命令可执行（至少 1 条 happy path）。
- 错误分支有明确提示（如 401/429/参数错误）。
- 未破坏已有命令或导出接口。

### Skill 变更

- `name` 与目录语义一致。
- `description` 包含触发词、适用/不适用场景。
- 命令示例与当前 CLI 能力一致。
- 引用的 `references/*.md` 文件真实存在。
- 输出模板包含风险提示与免责声明（金融分析场景必需）。

## 协作约定

- 默认不提交密钥、Token、账号信息。
- 不在文档中写死私有环境路径。
- 若改动涉及行为约束或工作流，优先同步更新本文件。
- 若新增分析方向，优先考虑"入口 Skill + 专项 Skill + references"三层结构，保持可扩展性。

## 术语缩写与字段说明

本节记录项目中使用的术语缩写和技术指标字段定义，确保文档一致性。

### 术语缩写

| 缩写             | 全称                       | 中文含义           | 说明                                      |
| ---------------- | -------------------------- | ------------------ | ----------------------------------------- |
| CS               | Close-to-EMA Strength      | 收盘价相对均线强度 | 衡量价格相对 EMA 的偏离度                 |
| IBS              | Internal Bar Strength      | 内部K线强度        | 衡量收盘价在当日K线高低点区间内的相对位置 |
| QD               | Quality Degree             | 强度指标           | 板块或股票的综合强度评分                  |
| EMA              | Exponential Moving Average | 指数移动平均线     | 加权移动平均线，近期数据权重更高          |
| zdf              | 涨跌幅                     | -                  | 涨跌幅百分比                              |
| zdf5/zdf10/zdf20 | N日涨跌幅                  | -                  | 过去5/10/20个交易日的累计涨跌幅           |

## 重要原则

- 碰见不知道的术语、概念和英文缩写，不要自己猜测，从 [字段说明](./skills/daxiapi/references/field-descriptions.md)文档找答案，**找不到答案则停下来问用户，千万不要自己猜测！！**
