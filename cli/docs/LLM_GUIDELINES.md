# LLM行为准则 - 代码修改与质量保障

## ⚠️ 核心原则：三思而后行

**最重要的行为准则**：

在做任何操作之前，必须停下来思考：
1. **我是否理解了用户的需求？**
2. **我是否了解了现有代码的结构？**
3. **我的操作会产生什么影响？**
4. **是否有更好的解决方案？**
5. **我是否需要先读取文件或检查现有代码？**

**强制要求**：
- ✅ **停下来思考**：不要急于执行，先思考清楚
- ✅ **仔细检查**：确认操作的正确性和完整性
- ✅ **验证结果**：操作后验证是否符合预期
- ✅ **避免冲动**：不要因为时间压力而草率行事

**禁止行为**：
- ❌ **禁止冲动操作**：不要在没有思考的情况下直接执行
- ❌ **禁止假设**：不要假设文件内容或代码结构
- ❌ **禁止跳过验证**：不要因为"应该没问题"而跳过验证步骤

**案例教训**：
- 直接覆盖文件导致原有代码丢失
- 没有验证合并结果导致功能缺失
- 没有检查依赖关系导致功能破坏

**记住**：宁可慢一点，也不要犯错。代码质量比速度更重要！

---

## 1. 代码修改行为准则

### 1.1 强制执行"先读后改"原则

**强制要求**：
- ✅ 修改任何现有文件前，**必须**先使用 `Read` 工具读取文件完整内容
- ✅ 理解现有代码结构和逻辑
- ✅ 确认修改的影响范围
- ✅ 使用 `Edit` 工具进行增量修改（而不是 `Write`）

**禁止行为**：
- ❌ 禁止直接使用 `Write` 工具覆盖现有文件
- ❌ 禁止在不读取文件的情况下进行修改
- ❌ 禁止忽略现有代码结构

**示例**：
```javascript
// 错误做法 ❌
Write({
    file_path: '/path/to/existing/file.js',
    content: 'new content' // 直接覆盖，丢失原有内容
})

// 正确做法 ✅
Read({ file_path: '/path/to/existing/file.js' })
// 理解现有代码后
Edit({
    file_path: '/path/to/existing/file.js',
    old_str: 'existing code',
    new_str: 'modified code'
})
```

### 1.2 代码审查环节

**强制要求**：
- ✅ 修改后必须检查修改的完整性
- ✅ 验证所有依赖项是否正常
- ✅ 运行相关测试用例
- ✅ 检查是否有未使用的变量或导入

**检查清单**：
- [ ] 所有原有函数/方法是否保留
- [ ] 所有原有导入是否保留
- [ ] 新增代码是否与现有代码风格一致
- [ ] 是否有未使用的变量或导入
- [ ] 是否有语法错误或类型错误

### 1.3 测试验证机制

**强制要求**：
- ✅ 测试新增功能
- ✅ 测试受影响的现有功能
- ✅ 运行完整的测试套件（如果有）
- ✅ 验证边界情况和异常处理

**测试步骤**：
1. 功能测试：验证新增功能是否正常工作
2. 回归测试：验证现有功能是否受影响
3. 边界测试：验证边界情况和异常处理
4. 集成测试：验证与其他模块的集成

## 2. 代码质量行为准则

### 2.1 遵循DRY原则

**强制要求**：
- ✅ 提取重复代码为公共函数
- ✅ 使用辅助函数减少代码冗余
- ✅ 保持代码简洁和可维护

**示例**：
```javascript
// 错误做法 ❌ - 重复代码
async function getMarketData(token) {
    const response = await axios.post(`${API_BASE_URL}/get_market_data`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
}

async function getMarketTemp(token) {
    const response = await axios.post(`${API_BASE_URL}/get_market_temp`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
}

// 正确做法 ✅ - DRY原则
function createClient(token) {
    return axios.create({
        baseURL: API_BASE_URL,
        headers: { Authorization: `Bearer ${token}` }
    });
}

async function post(client, path, body = {}) {
    const {data} = await client.post(path, body);
    return data;
}

async function getMarketData(token) {
    const client = createClient(token);
    return post(client, '/get_market_data', {});
}
```

### 2.2 避免副作用

**强制要求**：
- ✅ 不直接修改传入的参数
- ✅ 使用深拷贝处理数据
- ✅ 保持函数的纯度

**示例**：
```javascript
// 错误做法 ❌ - 直接修改参数
function calculateScores(data) {
    for (let i = 0; i < data.length; i++) {
        data[i].score = calculateScore(data[i]); // 直接修改原数组
    }
    return data;
}

// 正确做法 ✅ - 使用深拷贝
function calculateScores(data) {
    const dataCopy = data.map(item => ({...item})); // 深拷贝
    for (let i = 0; i < dataCopy.length; i++) {
        dataCopy[i].score = calculateScore(dataCopy[i]);
    }
    return dataCopy;
}
```

### 2.3 完善错误处理

**强制要求**：
- ✅ 添加参数验证
- ✅ 添加数据验证
- ✅ 提供清晰的错误消息

**示例**：
```javascript
// 错误做法 ❌ - 缺少验证
async function getDividendScore(token, code) {
    const klineData = await getKline(token, code);
    const {klines} = klineData; // 如果klines不存在会出错
    return calculateScores(klines);
}

// 正确做法 ✅ - 完善验证
async function getDividendScore(token, code) {
    // 参数验证
    if (!token || typeof token !== 'string') {
        throw new Error('Invalid token: token must be a non-empty string');
    }
    if (!code || typeof code !== 'string') {
        throw new Error('Invalid code: code must be a non-empty string');
    }
    
    const klineData = await getKline(token, code);
    
    // 数据验证
    if (!klineData || !Array.isArray(klineData.klines)) {
        throw new Error('Invalid kline data structure: klines must be an array');
    }
    
    return calculateScores(klineData.klines);
}
```

## 3. Git操作行为准则

### 3.1 合并前检查

**强制要求**：
- ✅ 仔细检查合并冲突内容
- ✅ 理解冲突的原因和影响
- ✅ 确认保留哪些代码

**检查步骤**：
1. 使用 `git status` 查看冲突文件
2. 使用 `git diff` 查看冲突内容
3. 理解冲突的上下文
4. 决定保留哪些代码

### 3.2 合并后验证

**强制要求**：
- ✅ 验证合并后的文件完整性
- ✅ 检查所有方法是否都存在
- ✅ 运行测试验证功能

**验证步骤**：
1. 检查文件内容是否完整
2. 验证所有函数/方法是否存在
3. 检查导入是否正确
4. 运行测试套件

### 3.3 变更检查

**强制要求**：
- ✅ 使用 `git diff` 检查变更内容
- ✅ 确认变更符合预期
- ✅ 检查是否有意外的删除

**检查命令**：
```bash
# 查看所有变更
git diff

# 查看特定文件的变更
git diff path/to/file.js

# 查看暂存区的变更
git diff --staged

# 查看最近一次提交的变更
git show HEAD
```

## 4. 工具使用规范

### 4.1 文件编辑工具选择

**优先级**：
1. **Edit 工具**（优先）：用于增量修改，保留原有内容
2. **Write 工具**（谨慎）：仅用于创建新文件或完全重写

**使用场景**：
- ✅ 修改现有文件：使用 `Edit` 工具
- ✅ 创建新文件：使用 `Write` 工具
- ❌ 覆盖现有文件：禁止使用 `Write` 工具

### 4.2 代码搜索工具

**推荐工具**：
- `SearchCodebase`：搜索代码库中的代码片段
- `Grep`：搜索文件内容
- `Glob`：搜索文件名

**使用场景**：
- 查找函数定义：`SearchCodebase`
- 查找使用位置：`Grep`
- 查找文件：`Glob`

### 4.3 Git工具

**常用命令**：
```bash
# 查看提交历史
git log --oneline -20

# 查看特定提交的内容
git show <commit-hash>

# 查看特定提交的文件内容
git show <commit-hash>:path/to/file

# 查看变更
git diff

# 查看文件历史
git log --follow path/to/file
```

## 5. 问题预防机制

### 5.1 代码修改前检查清单

- [ ] 是否已读取文件完整内容？
- [ ] 是否理解现有代码结构？
- [ ] 是否确认修改的影响范围？
- [ ] 是否选择了正确的工具（Edit vs Write）？

### 5.2 代码修改后检查清单

- [ ] 所有原有函数/方法是否保留？
- [ ] 所有原有导入是否保留？
- [ ] 新增代码是否与现有代码风格一致？
- [ ] 是否有未使用的变量或导入？
- [ ] 是否有语法错误或类型错误？
- [ ] 是否运行了测试？

### 5.3 Git操作检查清单

- [ ] 是否检查了合并冲突？
- [ ] 是否验证了合并后的文件完整性？
- [ ] 是否检查了变更内容？
- [ ] 是否运行了测试？

## 6. 应急响应机制

### 6.1 发现问题后的处理流程

1. **立即停止**：停止所有正在进行的操作
2. **问题定位**：使用 `git diff` 或 `git show` 定位问题
3. **恢复数据**：从Git历史中恢复丢失的代码
4. **验证修复**：运行测试验证修复效果
5. **文档记录**：记录问题原因和解决方案

### 6.2 代码恢复方法

```bash
# 查看文件历史版本
git log --follow path/to/file

# 恢复特定版本的文件
git checkout <commit-hash> -- path/to/file

# 查看特定版本的文件内容
git show <commit-hash>:path/to/file > /tmp/backup.js

# 从历史版本中恢复特定方法
git show <commit-hash>:path/to/file | grep -A 20 "function methodName"
```

## 7. 持续改进

### 7.1 定期审查

- 每周审查代码修改记录
- 分析常见错误模式
- 更新行为准则

### 7.2 知识积累

- 记录遇到的问题和解决方案
- 建立最佳实践库
- 分享经验和教训

### 7.3 工具优化

- 评估现有工具的使用效果
- 引入新的辅助工具
- 优化工作流程

## 8. 总结

遵循这些行为准则可以有效避免代码丢失、功能破坏等问题，提高代码质量和开发效率。**记住：先读后改，增量修改，完整验证**。
