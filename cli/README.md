# daxiapi-cli

大虾皮金融数据API命令行工具。需要注册 daxiapi.com 网站，并且获取API Token之后才能使用。

## 安装

```bash
# 全局安装
npm install -g daxiapi-cli

# 或使用 pnpm
pnpm add -g daxiapi-cli
```

## 配置

首次使用需要配置 API Token（在 daxiapi.com 用户中心申请）：

```bash
# 方式一：配置文件
daxiapi config set token YOUR_API_TOKEN

# 方式二：环境变量
export DAXIAPI_TOKEN=YOUR_API_TOKEN
```

## 使用

### 配置管理

```bash
# 设置Token
daxiapi config set token YOUR_API_TOKEN

# 设置API地址（可选）
daxiapi config set baseUrl https://daxiapi.com

# 查看所有配置
daxiapi config get

# 删除配置
daxiapi config delete token
```

### 市场数据

```bash
# 市场概览（主流指数）
daxiapi market

# 市场温度
daxiapi market temp

# 市场风格
daxiapi market style

# 市场估值
daxiapi market value
```

### 板块数据

```bash
# 板块列表
daxiapi sector

# 指定排序和数量
daxiapi sector --order zdf --limit 10

# 行业板块数据
daxiapi sector bk

# 板块内个股排名
daxiapi sector stocks --code BK0477

# 热门股票
daxiapi sector top

# 热门概念
daxiapi sector gn
```

### 股票数据

```bash
# 搜索股票或板块
daxiapi search 平安
daxiapi search 锂电 --type bk

# 查询单个股票
daxiapi stock 000001

# 查询多个股票
daxiapi stock 000001 600031 300750

# 概念股查询
daxiapi stock gn GN1234
```

### K线数据

```bash
# 获取K线数据
daxiapi kline 000001
```

### 涨跌停

```bash
# 涨停池
daxiapi zdt

# 跌停池
daxiapi zdt --type dt
```

### 工具

```bash
# 代码转换
daxiapi secid 000001
```

> 💡 提示：`daxiapi` 命令也可以使用简写 `dxp`

## 全局选项

```bash
# 查看帮助
daxiapi --help
daxiapi market --help

# 查看版本
daxiapi --version
```

## 错误处理

CLI 工具提供详细的错误提示和解决建议：

### 认证错误 (401)

```
❌ 错误: API Token 无效或已过期

解决方法:
  1. 检查 Token 是否正确配置:
     daxiapi config set token YOUR_TOKEN

  2. 或设置环境变量:
     export DAXIAPI_TOKEN=YOUR_TOKEN

  3. Token 可在 daxiapi.com 用户中心获取
```

### 限流错误 (429)

```
❌ 错误: 请求频率超限

解决方法:
  1. 请稍后重试
  2. 检查您的请求频率是否过高
  3. 升级账户获取更高配额
```

## 限流规则

- 每日上限：1000次
- 每分钟上限：10次
- 超限返回 429 错误

## License

MIT
