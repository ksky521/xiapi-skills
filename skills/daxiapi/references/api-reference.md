# Coze API 详细参考文档

**Base URL:** `https://daxiapi.com/coze`

**认证方式:** `Authorization: Bearer YOUR_TOKEN`

---

## GET 接口

### get_index_data

获取市场主流指数数据

**请求方式:** `GET`

**请求示例:**

```javascript
fetch('/coze/get_index_data', {
    headers: {Authorization: 'Bearer YOUR_TOKEN'}
});
```

**响应格式:**

```json
{
    "date": "04-05",
    "index": [
        {
            "fullDate": "2025-04-05",
            "date": "04-05",
            "name": "沪深300",
            "cs": 3.5,
            "zdf": 1.2,
            "zdf5": 2.3,
            "zdf10": 4.5,
            "zdf20": 6.7,
            "zdf30": 8.9
        }
    ]
}
```

**响应字段:**
| 字段 | 说明 |
|------|------|
| date | 日期 |
| index[] | 主流指数列表 |
| index[].name | 指数名称 |
| index[].cs | 短期动量CS值 |
| index[].zdf | 当日涨跌幅(%) |
| index[].zdf5/zdf10/zdf20/zdf30 | 5/10/20/30日涨跌幅 |

**使用说明:**

- CS值用于判断短期动量强度，正值表示多头，负值表示空头
- 涨跌幅用于判断各指数的相对强弱

**监控的指数列表:**

- 159628 创业板
- 159949 创业板50
- 510050 上证50
- 510300 沪深300
- 510500 中证500
- 512100 中证1000
- 515080 新能车
- 159920 恒生
- 588000 科创50
- 588800 科创板50
- 513180 恒生科技

---

### get_market_temp

获取市场温度数据

**请求方式:** `GET`

**请求示例:**

```javascript
fetch('/coze/get_market_temp', {
    headers: {Authorization: 'Bearer YOUR_TOKEN'}
});
```

**响应格式:**

返回 Toon 格式表格字符串，包含最近 20 个交易日的市场温度数据。

**温度指标说明:**
| 指标 | 说明 | 使用方法 |
|------|------|----------|
| 估值温度 | 基于PB的温度指标 | <20低估，>70高估 |
| 恐贪指数 | 市场恐慌贪婪指数 | 0-10极度恐惧，90-100极度贪婪 |
| 趋势温度 | 站上60日均线比例 | <20低迷，>80过热 |
| 动量温度 | 市场动量指标 | 正值多头，负值空头 |

---

### get_market_style

获取大小盘风格数据

**请求方式:** `GET`

**请求示例:**

```javascript
fetch('/coze/get_market_style', {
    headers: {Authorization: 'Bearer YOUR_TOKEN'}
});
```

**响应格式:**

返回 Toon 格式表格字符串，包含日期和大小盘波动差值。

**使用说明:**

- 差值 > 0：小盘股表现优于大盘股，适合配置小盘股
- 差值 < 0：大盘股表现优于小盘股，适合配置大盘股
- 差值持续扩大：风格趋势延续
- 差值由正转负或由负转正：风格切换信号

---

### get_market_value_data

获取指数估值数据

**请求方式:** `GET`

**请求示例:**

```javascript
fetch('/coze/get_market_value_data', {
    headers: {Authorization: 'Bearer YOUR_TOKEN'}
});
```

**响应格式:**

```json
{
    "date": "2025-04-05",
    "items": [
        {
            "code": "000300",
            "name": "沪深300",
            "PE": 12.5,
            "PB": 1.4,
            "PEPercentile": 35.2,
            "PBPercentile": 28.6,
            "wendu": 31.9,
            "date": "2025-04-05"
        }
    ]
}
```

**响应字段:**
| 字段 | 说明 |
|------|------|
| items[] | 估值数据列表 |
| items[].code | 指数代码 |
| items[].name | 指数名称 |
| items[].PE | 市盈率 |
| items[].PB | 市净率 |
| items[].PEPercentile | PE历史分位值(%) |
| items[].PBPercentile | PB历史分位值(%) |
| items[].wendu | 综合温度值 |

**温度使用方法:**

- 20°C以下：低估区域，可开始定投
- 10°C以下：明显低估，可加量定投
- 5°C以下：极度低估，可提升定投额度
- 60°C以上：高估区域，关注止盈
- 80°C以上：明显高估，分批止盈

---

### get_bk_data

获取行业板块数据

**请求方式:** `GET`

**请求示例:**

```javascript
fetch('/coze/get_bk_data', {
    headers: {Authorization: 'Bearer YOUR_TOKEN'}
});
```

**响应格式:**

返回 Toon 格式表格字符串，包含：

- 行业名称
- 今日涨幅
- 5日涨幅
- 20日涨幅
- CS强度
- CS均线
- QD指标

**使用说明:**

- 按涨幅降序排列，快速识别强势行业
- CS强度用于判断行业动量
- QD指标用于判断行业强度

---

## POST 接口

### get_stock_data

获取A股个股详细信息

**请求方式:** `POST`

**请求参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | string | 是 | 股票代码，多个用逗号分隔 |

**请求示例:**

```javascript
fetch('/coze/get_stock_data', {
    method: 'POST',
    headers: {
        Authorization: 'Bearer YOUR_TOKEN',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({code: '000001,600031'})
});
```

**响应格式:**

返回数组，包含个股详细信息。

**关键字段:**
| 字段 | 说明 | 使用方法 |
|------|------|----------|
| stockId | 股票代码 | - |
| name | 股票名称 | - |
| zdf | 当日涨跌幅(%) | - |
| cs | 短期动量 | 入场阈值5-15，止损阈值<-5 |
| sm | 中期动量 | 值>0表示多头排列 |
| rps_score | RPS相对强度 | >80为强势股 |
| sctr | 技术排名百分比 | 值越高越强势 |
| isVCP | 是否VCP形态 | 1=是 |
| isCrossoverBox | 是否突破箱体 | 1=是 |
| vcs | 成交量动量 | >0为放量 |
| pe_ttm | 市盈率TTM | - |
| gainian | 所属概念 | - |

---

### get_sector_data

获取行业板块热力图

**请求方式:** `POST`

**请求参数:**
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| orderBy | string | 否 | cs | 排序指标：cs/zdf/zdf5/zdf10/zdf20 |
| lmt | integer | 否 | 5 | 返回天数，范围 1-30 |

**请求示例:**

```javascript
fetch('/coze/get_sector_data', {
    method: 'POST',
    headers: {
        Authorization: 'Bearer YOUR_TOKEN',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({orderBy: 'zdf', lmt: 5})
});
```

**响应格式:**

```json
{
    "crossover": "今日板块内突破箱体股票较多的板块为：xxx,xxx",
    "csHeatmap": "Markdown表格",
    "zdfHeatmap": "Markdown表格",
    "zdf5Heatmap": "Markdown表格",
    "total": 100,
    "cs_gt_ma20_names": ["板块1", "板块2"],
    "cs_gt_5_names": ["板块1", "板块2"]
}
```

**响应字段:**
| 字段 | 说明 |
|------|------|
| csHeatmap | CS动量热力图（Markdown表格） |
| zdfHeatmap | 当日涨跌幅热力图 |
| crossover | 箱体突破板块信息 |
| total | 板块总数 |
| cs_gt_ma20_names | CS>CS_MA20的板块名称 |
| cs_gt_5_names | CS>5的板块名称 |

---

### get_sector_rank_stock

获取特定行业的股票排名

**请求方式:** `POST`

**请求参数:**
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| sectorCode | string | 是 | - | 行业代码（如 BK0477 或 880477） |
| orderBy | string | 否 | cs | 排序指标 |

**orderBy 可选值:**

- `cs` - 短期动量
- `sm` - 中期动量
- `zdf/zdf_5d/zdf_10d/zdf_20d/zdf_30d` - 涨跌幅
- `sctr` - 技术排名

**请求示例:**

```javascript
fetch('/coze/get_sector_rank_stock', {
    method: 'POST',
    headers: {
        Authorization: 'Bearer YOUR_TOKEN',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({sectorCode: 'BK0477', orderBy: 'cs'})
});
```

**响应格式:**

返回数组，包含板块内排名前 20 的股票数据。

---

### get_gn_hot

获取热门概念板块列表

**请求方式:** `POST`

**请求参数:**
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| type | string | 否 | dfcf | 数据源类型：ths（同花顺）或 dfcf（东方财富） |

**请求示例:**

```javascript
fetch('/coze/get_gn_hot', {
    method: 'POST',
    headers: {
        Authorization: 'Bearer YOUR_TOKEN',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({type: 'ths'})
});
```

**响应格式:**

返回 Toon 格式表格字符串，包含：

- 名称
- 今日涨幅
- 涨幅7%以上股票个数
- 5日、10日、20日涨幅
- QD（强度）、CS（动量）

---

### get_top_stocks

获取热门股票数据

**请求方式:** `POST`

**请求参数:** 无

**请求示例:**

```javascript
fetch('/coze/get_top_stocks', {
    method: 'POST',
    headers: {
        Authorization: 'Bearer YOUR_TOKEN',
        'Content-Type': 'application/json'
    }
});
```

**响应格式:**

返回 Toon 格式表格字符串，包含：

- 名称、所属板块
- 涨跌幅、股票代码
- 概念
- 5日、10日、20日涨跌幅

---

### get_gainian_stock

根据概念获取股票信息

**请求方式:** `POST`

**请求参数:**
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| gnId | string | 是 | - | 概念代码（如 815001 或 BK0420） |
| type | string | 否 | ths | 数据源类型 |

**请求示例:**

```javascript
fetch('/coze/get_gainian_stock', {
    method: 'POST',
    headers: {
        Authorization: 'Bearer YOUR_TOKEN',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({gnId: '815001', type: 'ths'})
});
```

**响应格式:**

返回数组，包含该概念下所有股票的数据。

---

### get_kline

获取K线数据

**请求方式:** `POST`

**请求参数:**
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| code | string | 否 | 000001 | 代码 |

**请求示例:**

```javascript
fetch('/coze/get_kline', {
    method: 'POST',
    headers: {
        Authorization: 'Bearer YOUR_TOKEN',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({code: '000001'})
});
```

**支持的代码格式:**

- `000001` - 6位代码
- `sh000001` - 带前缀代码
- `BK0428` - 板块代码

**响应格式:**

```json
{
    "code": "000001",
    "name": "上证指数",
    "date": "2025-04-05",
    "klines": [
        {
            "date": "2025-01-01",
            "open": 3100.5,
            "close": 3150.2,
            "high": 3180.0,
            "low": 3090.0,
            "vol": 12345678
        }
    ]
}
```

**响应字段:**
| 字段 | 说明 |
|------|------|
| code | 代码 |
| name | 名称 |
| date | 最新日期 |
| klines[] | K线数据数组 |
| klines[].date | 日期 |
| klines[].open | 开盘价 |
| klines[].close | 收盘价 |
| klines[].high | 最高价 |
| klines[].low | 最低价 |
| klines[].vol | 成交量 |

---

### get_zdt_pool

获取涨停跌停股票池

**请求方式:** `POST`

**请求参数:**
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| type | string | 否 | zt | 类型：zt（涨停）、dt（跌停）、zb（炸板） |

**请求示例:**

```javascript
fetch('/coze/get_zdt_pool', {
    method: 'POST',
    headers: {
        Authorization: 'Bearer YOUR_TOKEN',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({type: 'zt'})
});
```

**响应格式:**

返回 Toon 格式表格字符串，包含：

- 代码、名称
- 统计（涨停天数和次数）
- 行业、概念
- CS强度、SCTR排名

---

### get_sec_id

代码转换（获取标准 secid）

**请求方式:** `POST`

**请求参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | string | 是 | 股票代码 |

**请求示例:**

```javascript
fetch('/coze/get_sec_id', {
    method: 'POST',
    headers: {
        Authorization: 'Bearer YOUR_TOKEN',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({code: '000001'})
});
```

**支持的代码格式:**

- `000001` → `0.000001`（深市）
- `600000` → `1.600000`（沪市）
- `BK0428` → `90.BK0428`（板块）

**响应格式:**

返回标准 secid 格式字符串，如 `0.000001`。

---

### query_stock_data

搜索股票或板块代码

**请求方式:** `POST`

**请求参数:**
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| q | string | 是 | - | 搜索关键词 |
| type | string | 否 | stock | 类型：stock（股票）或 bk（板块） |

**请求示例:**

```javascript
fetch('/coze/query_stock_data', {
    method: 'POST',
    headers: {
        Authorization: 'Bearer YOUR_TOKEN',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({q: '平安', type: 'stock'})
});
```

**响应格式:**

返回数组，包含：

- code：代码
- name：名称
- type：类型（stock/bk）
- pinyin：拼音缩写

---

## 错误处理

### 统一响应格式

```json
{
    "errCode": 0,
    "errMsg": "OK",
    "data": { ... }
}
```

### 错误码说明

| 错误码 | 说明             | 处理建议                               |
| ------ | ---------------- | -------------------------------------- |
| 0      | 成功             | -                                      |
| 401    | Token无效或非VIP | 提示用户检查Token或申请VIP             |
| 404    | API不存在        | 检查请求路径和方法                     |
| 429    | 请求频率超限     | 等待后重试，每分钟限10次，每日限1000次 |
| 500    | 服务器错误       | 联系管理员                             |

---

## 使用场景示例

### 场景1：分析市场整体情况

1. 调用 `get_index_data` 获取主流指数数据
2. 调用 `get_market_temp` 获取市场温度
3. 调用 `get_market_style` 判断大小盘风格

### 场景2：自下向上选股

1. 调用 `get_sector_data` 找出强势行业
2. 调用 `get_sector_rank_stock` 获取行业内龙头股
3. 调用 `get_stock_data` 分析个股详细指标

### 场景3：查询特定股票

1. 调用 `get_stock_data` 获取详细信息
2. 调用 `get_kline` 获取K线数据

### 场景4：定投决策

1. 调用 `get_market_value_data` 获取指数估值
2. 根据温度值决定定投金额

### 场景5：涨跌停分析

1. 调用 `get_zdt_pool` 获取涨停跌停股票
2. 调用 `get_top_stocks` 获取热门股票

---

## 第三方API接口

除了大虾皮官方API外，还可以使用以下第三方API获取补充数据。

### 东方财富API

#### 1. 指数行情数据

**接口地址:** `GET https://push2.eastmoney.com/api/qt/ulist/get`

**功能说明:** 获取多个指数的实时行情数据，包括价格、涨跌幅、涨跌家数等信息。

**请求参数:**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| fields | string | 是 | 返回字段列表，逗号分隔 |
| secids | string | 是 | 证券代码列表，格式: 市场.代码，逗号分隔 |
| ut | string | 是 | 用户token |

**请求示例:**

```bash
curl 'https://push2.eastmoney.com/api/qt/ulist/get?fltt=1&invt=2&fields=f12,f13,f14,f1,f2,f4,f3,f152,f6,f104,f105,f106&secids=1.000001,0.399001&ut=fa5fd1943c7b386f172d6893dbfba10b&pn=1&np=1&pz=20&dect=1&wbp2u=|0|0|0|0|web'
```

**响应字段:**
| 字段 | 说明 |
|------|------|
| f12 | 指数代码 |
| f13 | 市场代码(1=上海,0=深圳) |
| f14 | 指数名称 |
| f2 | 当前价格(实际值需除以100) |
| f3 | 涨跌幅百分比(实际值需除以100) |
| f4 | 涨跌额(实际值需除以100) |
| f6 | 成交额 |
| f104 | 上涨家数 |
| f105 | 下跌家数 |
| f106 | 平盘家数 |

---

#### 2. K线数据

**接口地址:** `GET https://push2his.eastmoney.com/api/qt/stock/kline/get`

**功能说明:** 获取股票、指数、ETF的K线历史数据，支持日线、周线、月线等多种周期。

**请求参数:**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| klt | string | 是 | K线类型: 101=日线,102=周线,103=月线 |
| secid | string | 是 | 证券代码，格式: 市场.代码(如: 1.000300) |
| fqt | string | 否 | 复权类型: 0=不复权,1=前复权,2=后复权 |
| lmt | number | 否 | 返回数据条数 |

**请求示例:**

```bash
curl 'https://push2his.eastmoney.com/api/qt/stock/kline/get?fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f61&ut=7eea3edcaed734bea9cbfc24409ed989&end=29991010&klt=101&secid=1.000300&fqt=1&lmt=300'
```

---

#### 3. 涨停股票池

**接口地址:** `GET https://push2ex.eastmoney.com/getTopicZTPool`

**功能说明:** 获取当日涨停股票列表，包括涨停时间、封单金额、连板数等信息。

**请求参数:**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| ut | string | 是 | 用户token |
| dpt | string | 是 | 部门代码，默认 wz.ztzt |
| Pageindex | number | 否 | 页码，从0开始 |
| pagesize | number | 否 | 每页数量，默认200 |
| date | string | 是 | 日期，格式: YYYYMMDD |

**请求示例:**

```bash
curl 'https://push2ex.eastmoney.com/getTopicZTPool?ut=7eea3edcaed734bea9cbfc24409ed989&dpt=wz.ztzt&Pageindex=0&pagesize=200&sort=fbt:asc&date=20240101'
```

---

#### 4. 跌停股票池

**接口地址:** `GET https://push2ex.eastmoney.com/getTopicDTPool`

**功能说明:** 获取当日跌停股票列表，包括跌停时间、封单金额等信息。

**请求示例:**

```bash
curl 'https://push2ex.eastmoney.com/getTopicDTPool?ut=7eea3edcaed734bea9cbfc24409ed989&dpt=wz.ztzt&Pageindex=0&pagesize=200&sort=fund:asc&date=20240101'
```

---

#### 5. 炸板股票池

**接口地址:** `GET https://push2ex.eastmoney.com/getTopicZBPool`

**功能说明:** 获取当日炸板(涨停后打开)股票列表。

**请求示例:**

```bash
curl 'https://push2ex.eastmoney.com/getTopicZBPool?ut=7eea3edcaed734bea9cbfc24409ed989&dpt=wz.ztzt&Pageindex=0&pagesize=200&sort=fbt:asc&date=20240101'
```

---

#### 6. 股指期货数据

**接口地址:** `GET https://futsseapi.eastmoney.com/list/custom/{codes}`

**功能说明:** 获取股指期货实时行情数据，包括IH、IC、IF、IM等合约。

**URL路径参数:**

- `{codes}`: 期货合约代码列表，逗号分隔
    - 格式: `220_IHM0,220_IHS1,220_IHM1,220_IHS2`
    - 220_IH: 上证50期货
    - 220_IC: 中证500期货
    - 220_IF: 沪深300期货
    - 220_IM: 中证1000期货

---

### 集思录API

#### 可转债指数报价

**接口地址:** `GET https://www.jisilu.cn/webapi/cb/index_quote/`

**功能说明:** 获取可转债市场整体数据，包括等权指数、平均价格、溢价率、市场温度等。

**请求示例:**

```bash
curl 'https://www.jisilu.cn/webapi/cb/index_quote/'
```

**响应字段:**
| 字段 | 说明 |
|------|------|
| cur_index | 等权指数 |
| cur_price | 平均价格 |
| avg_premium | 平均溢价率 |
| mid_price | 中位数价格 |

---

### 同花顺API

#### 市场成交额数据

**接口地址:** `GET https://dq.10jqka.com.cn/fuyao/market_analysis_api/chart/v1/get_chart_data`

**功能说明:** 获取市场成交额历史数据，支持日线和分钟线。

**请求参数:**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| chart_key | string | 是 | 图表类型: turnover_day=日线,turnover_minute=分钟线 |

**请求示例:**

```bash
curl 'https://dq.10jqka.com.cn/fuyao/market_analysis_api/chart/v1/get_chart_data?chart_key=turnover_day'
```

---

## 第三方API注意事项

### 数据更新频率

| API        | 更新频率    |
| ---------- | ----------- |
| 指数行情   | 实时(3秒)   |
| K线数据    | 日终        |
| 涨跌停数据 | 实时(1分钟) |
| 股指期货   | 实时(3秒)   |
| 可转债指数 | 实时(1分钟) |
| 市场成交额 | 日终        |

### 市场代码说明

| 代码 | 市场           |
| ---- | -------------- |
| 1    | 上海证券交易所 |
| 0    | 深圳证券交易所 |
| 116  | 上海科创板     |

### 证券代码格式

- **股票**: `市场.代码`，如 `1.600000`(上海)、`0.000001`(深圳)
- **指数**: `市场.代码`，如 `1.000300`(沪深300)
- **ETF**: `市场.代码`，如 `1.510300`(沪深300ETF)
