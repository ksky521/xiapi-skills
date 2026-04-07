---
name: skill-quality-review
description: '当用户让你给Skill的打分、审查或者评价Skill的时候，按照本文档指南进行检查'
---

-

# Skill 质量检查指南

本文档提供 Skill 质量评估的完整框架，包括最佳实践、评分机制和改进建议模板。

## 目录

- [第一部分：最佳实践](#第一部分最佳实践)
    - [1. 触发词完整性](#1-触发词完整性)
    - [2. 内容冗余度](#2-内容冗余度)
    - [3. Gotchas 闭坑指南](#3-gotchas-闭坑指南)
    - [4. 流程约束度](#4-流程约束度)
    - [5. 内容拆分合理性](#5-内容拆分合理性)
    - [6. 资源文件组织](#6-资源文件组织)
- [第二部分：评分机制](#第二部分评分机制)
    - [评分标准](#评分标准)
    - [问题清单格式](#问题清单格式)
    - [改正建议模板](#改正建议模板)
    - [完整评估报告模板](#完整评估报告模板)

---

## 第一部分：最佳实践

### 1. 触发词完整性

**定义**：description 应包含明确的触发词和不适用场景，帮助 Agent 准确判断何时使用该 Skill。

#### 最佳实践

- ✅ 在 description 中明确列出触发关键词
- ✅ 说明 Skill 的适用场景和边界
- ✅ 提供不适用场景的明确说明
- ✅ 使用用户可能使用的自然语言表达

#### Good Case

```yaml
---
name: self-improvement
description: "Captures learnings, errors, and corrections to enable continuous improvement. Use when: (1) A command or operation fails unexpectedly, (2) User corrects Claude ('No, that's wrong...', 'Actually...'), (3) User requests a capability that doesn't exist, (4) An external API or tool fails, (5) Claude realizes its knowledge is outdated or incorrect, (6) A better approach is discovered for a recurring task. Also review learnings before major tasks."
---
```

**优点分析**：

- 明确列出了 6 种触发场景
- 包含具体的用户表达示例（如 "No, that's wrong..."）
- 说明了主动触发时机（"review learnings before major tasks"）
- 覆盖了错误、纠正、功能请求、API失败、知识更新、最佳实践发现等多种情况

#### Bad Case

```yaml
---
name: xiapi-dividend-analysis
description: 分析红利类指数投资机会。使用 daxiapi dividend score 获取数据，判断超买超卖状态并给出投资建议。
---
```

**问题分析**：

- ❌ 缺少明确的触发关键词
- ❌ 未说明适用场景的边界
- ❌ 没有不适用场景说明
- ❌ 用户难以判断何时应该使用此 Skill

#### 改进建议

```yaml
---
name: xiapi-dividend-analysis
description: '分析红利类指数投资机会，包括红利低波、中证红利、中证现金流等指数的超买超卖状态判断和投资建议。触发词：红利指数分析、红利投资机会、红利低波分析、中证红利分析、现金流指数分析。适用场景：分析红利类指数的投资时机、判断超买超卖状态。不适用场景：非红利类指数分析、个股分析、实时交易信号。'
---
```

---

### 2. 内容冗余度

**定义**：Skill 内容应避免包含 Agent 已知的通用知识，专注于领域特定的信息。

#### 最佳实践

- ✅ 只包含领域特定的知识和信息
- ✅ 避免解释通用的编程概念
- ✅ 省略 Agent 已知的最佳实践
- ✅ 专注于项目特定的约定和规则

#### Good Case

```markdown
## 分析方法

1. **数据获取**：获取红利类指数的打分数据（日期、分数、cs值、rsi值）
2. **趋势分析**：分析最近 60 天的打分走势变化
3. **状态判断**：
    - 分数 < 20：超卖（可考虑抄底）
    - 分数 > 80：超买（需考虑止盈）
    - 20-80：正常状态
4. **投资建议**：根据超买超卖状态和趋势给出建议
```

**优点分析**：

- ✅ 专注于领域特定的分析方法
- ✅ 提供了具体的判断标准（分数阈值）
- ✅ 没有解释什么是"超买超卖"等通用概念
- ✅ 内容简洁，直接切入主题

#### Bad Case

```markdown
## 什么是超买超卖？

超买是指资产价格在短时间内大幅上涨，可能面临回调风险。超卖是指资产价格在短时间内大幅下跌，可能存在反弹机会。

## 如何使用命令行？

命令行是一种文本界面，用户可以通过输入命令来操作计算机。常用的命令包括：

- `cd`：切换目录
- `ls`：列出文件
- `mkdir`：创建目录

## 分析方法

1. **数据获取**：获取红利类指数的打分数据
```

**问题分析**：

- ❌ 包含了 Agent 已知的通用金融知识（超买超卖定义）
- ❌ 解释了通用的命令行使用方法
- ❌ 浪费了 token 和注意力
- ❌ 稀释了领域特定信息的重要性

#### 改进建议

删除通用知识部分，直接进入领域特定的分析方法：

```markdown
## 分析方法

1. **数据获取**：获取红利类指数的打分数据（日期、分数、cs值、rsi值）
2. **趋势分析**：分析最近 60 天的打分走势变化
3. **状态判断**：
    - 分数 < 20：超卖（可考虑抄底）
    - 分数 > 80：超买（需考虑止盈）
    - 20-80：正常状态
4. **投资建议**：根据超买超卖状态和趋势给出建议
```

---

### 3. Gotchas 闭坑指南

**定义**：包含来自真实失败案例的闭坑内容，帮助 Agent 避免常见错误。

#### 最佳实践

- ✅ 收集真实使用中的失败案例
- ✅ 提供具体的错误场景和解决方案
- ✅ 说明配置、权限、网络等常见问题
- ✅ 给出预防措施和最佳实践

#### Good Case

```markdown
## Gotchas（闭坑指南）

- **API Token 配置问题**：确保正确配置 DAXIAPI_TOKEN 环境变量，否则会导致数据获取失败
    - 错误示例：`Error: Authentication failed`
    - 解决方案：`export DAXIAPI_TOKEN=your_token_here`
- **指数代码格式**：必须使用正确的指数代码格式（如 2.H30269），否则会返回错误
    - 错误示例：`Error: Invalid code format`
    - 正确格式：市场代码.指数代码（如 2.H30269）
- **数据更新时间**：数据每日收盘后更新，盘前查询可能获取到前一天的数据
    - 建议：在收盘后（15:30 之后）查询最新数据
- **网络连接问题**：确保网络连接正常，否则可能无法获取数据
    - 错误示例：`Error: Network timeout`
    - 解决方案：检查网络连接，使用代理或 VPN
- **投资建议仅供参考**：分析结果基于历史数据，不构成投资建议，投资决策需谨慎
```

**优点分析**：

- ✅ 包含了具体的错误示例
- ✅ 提供了明确的解决方案
- ✅ 覆盖了配置、格式、时间、网络等多种场景
- ✅ 包含了风险提示

#### Bad Case

```markdown
## 注意事项

- 分析结果仅供参考，不构成投资建议
- 数据每日收盘后更新
```

**问题分析**：

- ❌ 缺少具体的错误案例
- ❌ 没有提供解决方案
- ❌ 未涵盖常见的技术问题
- ❌ 无法帮助 Agent 避免实际错误

#### 改进建议

参考 Good Case，补充完整的 Gotchas 内容，包括：

- 具体的错误场景
- 错误示例
- 解决方案
- 预防措施

---

### 4. 流程约束度

**定义**：给 Agent 足够的判断空间，避免过度约束，允许 Agent 根据实际情况灵活处理。

#### 最佳实践

- ✅ 提供指导性的步骤，而非强制性的命令
- ✅ 允许 Agent 根据上下文调整流程
- ✅ 说明目标和原则，而非具体实现
- ✅ 给出多种可选方案

#### Good Case

```markdown
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
```

**优点分析**：

- ✅ 提供了分析步骤，但未强制具体实现
- ✅ 给出了判断标准，但允许 Agent 灵活应用
- ✅ 说明了输出要求，但未限制输出格式
- ✅ Agent 可以根据实际情况调整分析深度

#### Bad Case

```markdown
## 分析方法

1. **第一步**：必须先执行命令 `npx daxiapi-cli@latest dividend score -c 2.H30269`
2. **第二步**：必须解析返回的 JSON 数据，提取以下字段：
    - date: 日期
    - score: 分数
    - cs: cs值
    - rsi: rsi值
3. **第三步**：必须按照以下格式输出：
```

指数名称：红利低波
指数代码：2.H30269
最新日期：2025-01-15
最新分数：45
状态：正常
建议：继续持有

```
4. **第四步**：必须发送邮件通知用户
```

**问题分析**：

- ❌ 过度约束了具体命令和参数
- ❌ 强制了数据解析方式
- ❌ 限制了输出格式
- ❌ 强制了不必要的外部操作（发送邮件）
- ❌ Agent 无法根据实际情况灵活调整

#### 改进建议

```markdown
## 分析方法

1. **数据获取**：获取红利类指数的打分数据
    - 推荐命令：`npx daxiapi-cli@latest dividend score -c <code>`
    - 可根据需要选择不同的指数代码
2. **趋势分析**：分析打分走势变化
    - 建议分析最近 60 天的数据
    - 可根据实际情况调整时间范围
3. **状态判断**：根据分数判断超买超卖状态
    - 分数 < 20：超卖
    - 分数 > 80：超买
    - 20-80：正常
4. **投资建议**：根据分析结果给出建议
    - 结合超买超卖状态和趋势
    - 考虑用户的具体需求

## 输出结果

建议包含：

- 指数基本信息
- 超买超卖状态判断
- 趋势分析
- 投资建议

可根据用户需求调整输出内容和格式。
```

---

### 5. 内容拆分合理性

**定义**：将大块内容拆分到 references/ 目录，保持 SKILL.md 的简洁性。

#### 最佳实践

- ✅ SKILL.md 只包含核心流程和关键信息
- ✅ 详细的技术文档放在 references/
- ✅ API 文档、配置说明等拆分到独立文件
- ✅ 使用相对路径引用相关文档

#### Good Case

**目录结构**：

```
xiapi-dividend-analysis/
├── SKILL.md
├── references/
│   ├── cli-commands.md
│   ├── api-reference.md
│   └── token-setup.md
└── scripts/
    └── analysis.js
```

**SKILL.md**：

```markdown
## 如何执行（How）

### CLI 命令

详见 [CLI命令参考](references/cli-commands.md)

### Token 配置

详见 [Token配置指南](references/token-setup.md)

### HTTP API 请求

详见 [API参考](references/api-reference.md)
```

**优点分析**：

- ✅ SKILL.md 简洁明了，只包含核心流程
- ✅ 详细文档拆分到 references/ 目录
- ✅ 便于维护和更新
- ✅ 用户可以按需查看详细文档

#### Bad Case

**目录结构**：

```
xiapi-dividend-analysis/
└── SKILL.md
```

**SKILL.md**（所有内容都在一个文件中）：

````markdown
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
````

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

...（更多详细内容）

````

**问题分析**：
- ❌ 所有内容都堆在一个文件中
- ❌ SKILL.md 过于冗长
- ❌ 不便于维护和更新
- ❌ 用户难以快速找到关键信息

#### 改进建议

创建 references/ 目录，拆分内容：

```bash
mkdir -p references
````

创建 `references/cli-commands.md`：

````markdown
# CLI 命令参考

## 获取红利类指数打分数据

```bash
npx daxiapi-cli@latest dividend score -c <code>
```
````

## 常用指数代码

| 指数名称    | 指数代码 |
| ----------- | -------- |
| 红利低波    | 2.H30269 |
| 红利低波100 | 2.930955 |
| 中证红利    | 1.000922 |
| 中证现金流  | 2.932365 |

````

创建 `references/token-setup.md`：
```markdown
# Token 配置指南

## 获取 Token

1. 登录大虾皮网站（daxiapi.com）
2. 进入会员中心 → API 管理 → 获取 API Token

## 配置方法

### 方式一：环境变量（推荐）

```bash
# Linux/macOS
export DAXIAPI_TOKEN=YOUR_TOKEN_FROM_DAXIAPI

# Windows
set DAXIAPI_TOKEN=YOUR_TOKEN_FROM_DAXIAPI
````

### 方式二：CLI 配置

```bash
npx daxiapi-cli@latest config set token YOUR_TOKEN_FROM_DAXIAPI
npx daxiapi-cli@latest config get token
```

````

更新 SKILL.md：
```markdown
## 如何执行（How）

### CLI 命令
详见 [CLI命令参考](references/cli-commands.md)

### Token 配置
详见 [Token配置指南](references/token-setup.md)
````

---

### 6. 资源文件组织

**定义**：scripts/、references/、assets/ 目录分工清晰，便于维护和使用。

#### 最佳实践

- ✅ scripts/ 存放可执行脚本
- ✅ references/ 存放参考文档
- ✅ assets/ 存放静态资源（模板、示例等）
- ✅ 目录结构清晰，职责分明

#### Good Case

**目录结构**：

```
self-improving-agent/
├── SKILL.md
├── references/
│   ├── examples.md
│   ├── hooks-setup.md
│   └── openclaw-integration.md
├── scripts/
│   ├── activator.sh
│   ├── error-detector.sh
│   └── extract-skill.sh
├── assets/
│   ├── LEARNINGS.md
│   └── SKILL-TEMPLATE.md
└── hooks/
    └── openclaw/
        ├── HOOK.md
        └── handler.js
```

**优点分析**：

- ✅ scripts/ 包含可执行脚本（activator.sh、error-detector.sh）
- ✅ references/ 包含参考文档（examples.md、hooks-setup.md）
- ✅ assets/ 包含模板文件（LEARNINGS.md、SKILL-TEMPLATE.md）
- ✅ hooks/ 包含钩子相关文件
- ✅ 目录结构清晰，职责分明

#### Bad Case

**目录结构**：

```
xiapi-dividend-analysis/
└── SKILL.md
```

**问题分析**：

- ❌ 缺少 scripts/ 目录
- ❌ 缺少 references/ 目录
- ❌ 缺少 assets/ 目录
- ❌ 所有内容都堆在一个文件中
- ❌ 不便于维护和扩展

#### 改进建议

创建完整的目录结构：

```bash
mkdir -p scripts references assets
```

**scripts/** - 存放可执行脚本：

```
scripts/
├── analyze.sh          # 分析脚本
└── fetch-data.sh       # 数据获取脚本
```

**references/** - 存放参考文档：

```
references/
├── cli-commands.md     # CLI 命令参考
├── api-reference.md    # API 参考文档
└── token-setup.md      # Token 配置指南
```

**assets/** - 存放模板和示例：

```
assets/
├── analysis-template.md  # 分析报告模板
└── example-output.md     # 输出示例
```

---

## 第二部分：评分机制

### 评分标准

根据六个维度的评估结果，给出 A/B/C/D 四个等级的评分。

#### A 级（优秀）

**标准**：

- ✅ 触发词完整：包含明确的触发词和不适用场景
- ✅ 无冗余内容：只包含领域特定知识
- ✅ Gotchas 完整：包含真实失败案例和解决方案
- ✅ 流程合理：给 Agent 足够的判断空间
- ✅ 内容拆分合理：大块内容已拆分到 references/
- ✅ 资源组织清晰：scripts/references/assets 分工明确

**特征**：

- 6 个维度全部达标
- 无 P0 级问题
- 可能有少量 P1 或 P2 级优化建议

#### B 级（良好）

**标准**：

- ✅ 触发词基本完整：有触发词但不完整
- ✅ 无明显冗余：大部分内容是领域特定的
- ✅ Gotchas 部分：有部分闭坑内容但不完整
- ✅ 流程基本合理：有少量过度约束
- ✅ 内容基本拆分：主要文档已拆分
- ✅ 资源组织基本合理：有基本的目录结构

**特征**：

- 4-5 个维度达标
- 可能有 1-2 个 P0 级问题
- 有若干 P1 级建议

#### C 级（合格）

**标准**：

- ⚠️ 触发词不完整：缺少触发词或不适用场景
- ⚠️ 有少量冗余：包含部分通用知识
- ⚠️ Gotchas 缺失：缺少真实失败案例
- ⚠️ 流程有约束：存在过度约束的情况
- ⚠️ 内容未拆分：所有内容在一个文件中
- ⚠️ 资源组织不清晰：缺少必要的目录结构

**特征**：

- 2-3 个维度达标
- 有 3-4 个 P0 级问题
- 有多个 P1 级建议

#### D 级（不合格）

**标准**：

- ❌ 触发词缺失：完全没有触发词说明
- ❌ 冗余严重：包含大量通用知识
- ❌ Gotchas 缺失：没有任何闭坑内容
- ❌ 流程过度约束：严重限制 Agent 的判断空间
- ❌ 内容混乱：没有合理的组织结构
- ❌ 资源组织混乱：缺少基本的目录结构

**特征**：

- 0-1 个维度达标
- 有 5 个以上 P0 级问题
- 需要全面重构

---

### 问题清单格式

根据问题的严重程度，分为 P0（必改）、P1（建议改）、P2（可选优化）三个优先级。

#### P0 级（必改）

**定义**：严重影响 Skill 质量和使用效果的问题，必须立即修复。

**示例**：

```markdown
### P0（必改）

1. **description 缺少明确的触发词**
    - 问题：当前 description 仅描述了功能，未包含用户可能使用的具体触发词
    - 影响：Agent 无法准确判断何时使用该 Skill
    - 位置：SKILL.md 第 3 行
    - 建议：添加触发词和不适用场景说明

2. **缺少 Gotchas 部分**
    - 问题：没有包含真实失败案例的闭坑内容
    - 影响：Agent 容易犯同样的错误
    - 位置：SKILL.md
    - 建议：添加 Gotchas 部分，包含具体错误案例和解决方案

3. **缺少不适用场景说明**
    - 问题：未说明 Skill 的适用范围和不适用情况
    - 影响：Agent 可能在不合适的场景下使用该 Skill
    - 位置：SKILL.md 第 12 行
    - 建议：添加"何时不使用"部分
```

#### P1 级（建议改）

**定义**：影响 Skill 质量但不是致命的问题，建议尽快修复。

**示例**：

```markdown
### P1（建议改）

1. **创建 references/ 目录**
    - 问题：所有内容都集中在 SKILL.md 文件中
    - 影响：不便于维护和更新
    - 建议：将 CLI 命令、API 文档等内容拆分到 references/ 目录

2. **建立完整的目录结构**
    - 问题：缺少 scripts、references、assets 等目录
    - 影响：不便于扩展和维护
    - 建议：添加完整的目录结构

3. **优化分析流程描述**
    - 问题：分析步骤描述不够清晰
    - 影响：Agent 可能无法准确理解分析流程
    - 建议：进一步细化分析步骤和判断标准
```

#### P2 级（可选优化）

**定义**：锦上添花的优化建议，可根据实际情况选择性实施。

**示例**：

```markdown
### P2（可选优化）

1. **添加投资建议示例**
    - 建议：提供具体的投资建议示例，增强实用性
    - 预期效果：帮助 Agent 更好地理解如何给出建议

2. **添加常见问题 FAQ**
    - 建议：收集用户常见问题，提供解答
    - 预期效果：减少重复咨询

3. **添加性能优化建议**
    - 建议：提供性能优化的最佳实践
    - 预期效果：提升 Skill 的执行效率
```

---

### 改正建议模板

提供可直接复制使用的改正建议，帮助用户快速修复问题。

#### 模板 1：更新 description

````markdown
### 改正建议：更新 description

**当前内容**：

```yaml
description: 分析红利类指数投资机会。使用 daxiapi dividend score 获取数据，判断超买超卖状态并给出投资建议。
```
````

**建议修改为**：

```yaml
description: '分析红利类指数投资机会，包括红利低波、中证红利、中证现金流等指数的超买超卖状态判断和投资建议。触发词：红利指数分析、红利投资机会、红利低波分析、中证红利分析、现金流指数分析。适用场景：分析红利类指数的投资时机、判断超买超卖状态。不适用场景：非红利类指数分析、个股分析、实时交易信号。'
```

**修改步骤**：

1. 打开 SKILL.md 文件
2. 找到第 3 行的 description 字段
3. 替换为上述建议内容
4. 保存文件

````

#### 模板 2：添加 Gotchas 部分

```markdown
### 改正建议：添加 Gotchas 部分

**建议在 SKILL.md 的"注意事项"部分之前添加以下内容**：

```markdown
## Gotchas（闭坑指南）

- **API Token 配置问题**：确保正确配置 DAXIAPI_TOKEN 环境变量，否则会导致数据获取失败
  - 错误示例：`Error: Authentication failed`
  - 解决方案：`export DAXIAPI_TOKEN=your_token_here`

- **指数代码格式**：必须使用正确的指数代码格式（如 2.H30269），否则会返回错误
  - 错误示例：`Error: Invalid code format`
  - 正确格式：市场代码.指数代码（如 2.H30269）

- **数据更新时间**：数据每日收盘后更新，盘前查询可能获取到前一天的数据
  - 建议：在收盘后（15:30 之后）查询最新数据

- **网络连接问题**：确保网络连接正常，否则可能无法获取数据
  - 错误示例：`Error: Network timeout`
  - 解决方案：检查网络连接，使用代理或 VPN

- **投资建议仅供参考**：分析结果基于历史数据，不构成投资建议，投资决策需谨慎
````

**修改步骤**：

1. 打开 SKILL.md 文件
2. 找到"注意事项"部分（第 77 行）
3. 在其之前插入上述 Gotchas 内容
4. 保存文件

````

#### 模板 3：创建 references/ 目录并拆分内容

```markdown
### 改正建议：创建 references/ 目录并拆分内容

**步骤 1：创建目录**
```bash
mkdir -p references
````

**步骤 2：创建 references/cli-commands.md**

````markdown
# CLI 命令参考

## 获取红利类指数打分数据

```bash
npx daxiapi-cli@latest dividend score -c <code>
```
````

## 常用指数代码

| 指数名称    | 指数代码 |
| ----------- | -------- |
| 红利低波    | 2.H30269 |
| 红利低波100 | 2.930955 |
| 中证红利    | 1.000922 |
| 中证现金流  | 2.932365 |

````

**步骤 3：创建 references/token-setup.md**
```markdown
# Token 配置指南

## 获取 Token

1. 登录大虾皮网站（daxiapi.com）
2. 进入会员中心 → API 管理 → 获取 API Token

## 配置方法

### 方式一：环境变量（推荐）

```bash
# Linux/macOS
export DAXIAPI_TOKEN=YOUR_TOKEN_FROM_DAXIAPI

# Windows
set DAXIAPI_TOKEN=YOUR_TOKEN_FROM_DAXIAPI
````

### 方式二：CLI 配置

```bash
npx daxiapi-cli@latest config set token YOUR_TOKEN_FROM_DAXIAPI
npx daxiapi-cli@latest config get token
```

````

**步骤 4：更新 SKILL.md**
将"如何执行"部分修改为：
```markdown
## 如何执行（How）

### CLI 命令
详见 [CLI命令参考](references/cli-commands.md)

### Token 配置
详见 [Token配置指南](references/token-setup.md)
````

```

---

### 完整评估报告模板

#### Skill 评估报告

**Skill 名称**：[skill-name]
**评估日期**：[YYYY-MM-DD]
**评估人**：[evaluator]

---

## 分析结果

### 1. 触发词完整性
- **评估结果**：[完整/部分完整/缺失]
- **问题描述**：[具体问题]
- **影响分析**：[对使用的影响]

### 2. 内容冗余度
- **评估结果**：[无冗余/少量冗余/严重冗余]
- **问题描述**：[具体问题]
- **影响分析**：[对使用的影响]

### 3. Gotchas 闭坑指南
- **评估结果**：[完整/部分完整/缺失]
- **问题描述**：[具体问题]
- **影响分析**：[对使用的影响]

### 4. 流程约束度
- **评估结果**：[合理/基本合理/过度约束]
- **问题描述**：[具体问题]
- **影响分析**：[对使用的影响]

### 5. 内容拆分合理性
- **评估结果**：[合理/基本合理/未拆分]
- **问题描述**：[具体问题]
- **影响分析**：[对使用的影响]

### 6. 资源文件组织
- **评估结果**：[清晰/基本清晰/混乱]
- **问题描述**：[具体问题]
- **影响分析**：[对使用的影响]

---

## 评分

**等级**：[A/B/C/D]

**评分依据**：
- [维度1]：[达标/未达标]
- [维度2]：[达标/未达标]
- [维度3]：[达标/未达标]
- [维度4]：[达标/未达标]
- [维度5]：[达标/未达标]
- [维度6]：[达标/未达标]

**达标维度数**：[X/6]

---

## 问题清单

### P0（必改）

1. **[问题标题]**
   - 问题：[具体问题描述]
   - 影响：[对使用的影响]
   - 位置：[文件名:行号]
   - 建议：[具体建议]

### P1（建议改）

1. **[问题标题]**
   - 问题：[具体问题描述]
   - 影响：[对使用的影响]
   - 建议：[具体建议]

### P2（可选优化）

1. **[问题标题]**
   - 建议：[具体建议]
   - 预期效果：[预期改进效果]

---

## 改正建议

### 建议 1：[建议标题]

**当前内容**：
```

[当前代码或内容]

```

**建议修改为**：
```

[修改后的代码或内容]

````

**修改步骤**：
1. [步骤1]
2. [步骤2]
3. [步骤3]

---

## 总结

[总体评价和改进方向]

---

## 附录：快速检查清单

使用以下清单快速评估 Skill 质量：

```markdown
## Skill 质量检查清单

- [ ] **触发词完整性**
  - [ ] description 包含明确的触发词
  - [ ] 说明了适用场景
  - [ ] 说明了不适用场景
  - [ ] 使用了用户可能使用的自然语言表达

- [ ] **内容冗余度**
  - [ ] 只包含领域特定的知识
  - [ ] 避免解释通用的编程概念
  - [ ] 省略 Agent 已知的最佳实践
  - [ ] 专注于项目特定的约定和规则

- [ ] **Gotchas 闭坑指南**
  - [ ] 包含真实失败案例
  - [ ] 提供具体的错误场景
  - [ ] 给出解决方案
  - [ ] 说明预防措施

- [ ] **流程约束度**
  - [ ] 提供指导性的步骤
  - [ ] 允许 Agent 灵活调整
  - [ ] 说明目标和原则
  - [ ] 给出多种可选方案

- [ ] **内容拆分合理性**
  - [ ] SKILL.md 简洁明了
  - [ ] 详细文档在 references/
  - [ ] 使用相对路径引用
  - [ ] 便于维护和更新

- [ ] **资源文件组织**
  - [ ] scripts/ 存放可执行脚本
  - [ ] references/ 存放参考文档
  - [ ] assets/ 存放静态资源
  - [ ] 目录结构清晰

**评分标准**：
- 6 项全部达标：A 级
- 4-5 项达标：B 级
- 2-3 项达标：C 级
- 0-1 项达标：D 级
````
