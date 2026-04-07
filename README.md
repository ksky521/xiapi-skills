# xiapi-skills

## 项目概述

xiapi-skills 是一个包含 CLI 工具和技能定义的集合，用于股票市场数据的爬取、分析和处理。该项目作为 git submodule 被主项目引用。

**命名说明**：
- `xiapi`：虾皮（xiapi）的拼音，指大虾皮网站
- `daxiapi`：大虾皮（daxiapi）的拼音，是网站名称

## 技能安装方法
使用腾讯skillHub：https://skillhub.tencent.com/skills/daxiapi
或者下载：https://daxiapi.com/skill.zip
或者直接github用该项目。

复制下面prompt给你的OpenClaw：
```txt
帮我从下面的地址安装技能：
https://daxiapi.com/skill.zip
```

## 目录结构

```
xiapi-skills/
├── cli/              # CLI 命令行工具
│   ├── bin/          # 命令行入口
│   ├── commands/     # 各种命令实现
│   ├── lib/          # 公共库
│   ├── package.json  # 项目配置
│   └── README.md     # CLI 工具说明
└── skills/           # 技能定义
    └── daxiapi/      # 大虾皮（daxiapi）技能
        ├── SKILL.md  # 技能描述
        └── references/ # 参考文档
```

## CLI 工具

### 安装依赖

```bash
cd xiapi-skills/cli
npm install
```

### 可用命令

- `config`：配置相关
- `kline`：获取K线数据
- `market`：获取市场数据
- `search`：搜索功能
- `secid`：获取证券ID
- `sector`：获取行业数据
- `stock`：获取股票数据（包含主力资金流向）
- `zdt`：获取涨跌停数据

### 使用示例

```bash
# 获取股票数据
node bin/index.js stock 600000

# 获取市场数据
node bin/index.js market

# 获取主力资金流向（最近5天）
node bin/index.js stock capital-flow 000010

# 获取主力资金流向（指定天数）
node bin/index.js stock capital-flow 000010 --days 10
```

## 技能定义

技能定义位于 `skills/daxiapi` 目录，包含以下参考文档：

- `api-reference.md`：API 参考
- `field-descriptions.md`：字段描述
- `market-analysis.md`：市场分析
- `market-style-analysis.md`：市场风格分析
- `market-temp-analysis.md`：市场温度分析
- `sector-heatmap-analysis.md`：行业热力图分析

## 作为 Git Submodule 使用

### 添加子模块

```bash
# 在主项目中添加子模块
git submodule add git@github.com:ksky521/xiapi-skills.git xiapi-skills
```

### 更新子模块

```bash
# 更新子模块到最新版本
git submodule update --remote xiapi-skills

# 或者进入子模块目录进行操作
cd xiapi-skills
git pull origin main
```

### 提交子模块更改

```bash
# 在子模块目录中提交更改
cd xiapi-skills
git add .
git commit -m "Update something"
git push origin main

# 回到主项目，提交子模块引用更新
cd ..
git add xiapi-skills
git commit -m "Update xiapi-skills submodule"
git push origin master
```

## 开发指南

1. **克隆仓库**：`git clone git@github.com:ksky521/xiapi-skills.git`
2. **安装依赖**：`cd cli && npm install`
3. **添加新命令**：在 `cli/commands` 目录中创建新的命令文件
4. **更新技能**：修改 `skills/daxiapi` 目录中的技能定义和参考文档
5. **测试**：运行命令测试功能
6. **提交**：按照上述提交流程提交更改

## 注意事项

- 确保 `node_modules` 目录已添加到 `.gitignore` 中
- 提交前确保所有功能正常运行
- 保持代码风格一致
- 详细记录更改内容
