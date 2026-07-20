# 动态模型名称注入方案

## 问题
当前 Devin 显示的是固定名称 "Claude Opus 4 BYOK"，用户看不到实际配置的模型（如 gpt-4o、claude-sonnet-4）。

## 解决方案
通过补丁动态注入当前配置的模型名称到 Devin 的模型列表。

## 实现步骤

### 1. 识别 Devin 的模型列表代码
需要找到 Devin Desktop extension.js 中定义模型列表的代码，类似：
```javascript
models: [
  { id: "claude-opus-4", name: "Claude Opus 4" },
  { id: "claude-opus-4-byok", name: "Claude Opus 4 BYOK" }
]
```

### 2. 添加新的补丁规则
在 patchManager.js 的 PATCH_RULES 中添加：
```javascript
{
  name: "P4: 动态注入 BYOK 模型名称",
  description: "将 BYOK 模型名称改为实际配置的模型",
  originalRegex: "name:\"Claude Opus 4 BYOK\"",
  patchedTemplate: "name:\"{{MODEL_NAME}} (BYOK #1)\""
}
```

### 3. 从配置读取当前模型
在应用补丁时：
```javascript
const currentModel = config.BYOK1_MODEL || "Claude Opus 4";
const modelDisplayName = `${currentModel} (BYOK)`;
```

### 4. 动态替换补丁内容
```javascript
static applyPatchContent(content, rule, apiUrl, inferenceUrl, config) {
  if (rule.name.startsWith("P4:")) {
    const byok1Model = config.BYOK1_MODEL || "Claude Opus 4";
    const byok2Model = config.BYOK2_MODEL || "Claude Opus 4 Thinking";
    
    // 替换 BYOK #1
    content = content.replace(
      /name:"Claude Opus 4 BYOK"/g,
      `name:"${byok1Model} (BYOK)"`
    );
    
    // 替换 BYOK #2
    content = content.replace(
      /name:"Claude Opus 4 Thinking BYOK"/g,
      `name:"${byok2Model} (BYOK)"`
    );
    
    return { content, changed: true };
  }
  // ... 其他补丁逻辑
}
```

## 挑战

### 1. 需要反编译查找确切的代码位置
Devin Desktop 的 extension.js 是压缩混淆的，需要：
- 找到定义模型列表的代码段
- 确定确切的字符串匹配模式

### 2. 补丁需要在每次模型变更时重新应用
- 用户更改模型后，需要重新应用补丁
- 需要在侧栏添加"刷新模型显示"按钮

### 3. 兼容性问题
- Devin Desktop 更新后，代码结构可能变化
- 需要定期维护补丁规则

## 替代方案（更简单）

如果无法找到确切的补丁位置，可以：

1. **在侧栏显示当前激活的模型**
   ```
   ┌─ 当前配置 ────────┐
   │ BYOK #1: gpt-4o   │
   │ BYOK #2: gpt-4o   │
   └───────────────────┘
   ```

2. **在 README 中说明**
   ```
   在 Devin 中选择：
   - "Claude Opus 4 BYOK" → 使用你配置的主模型
   - "Claude Opus 4 Thinking BYOK" → 使用你配置的主模型（带思考强度）
   ```

3. **添加快速测试功能**
   - 点击"测试连接"
   - 显示："✓ BYOK #1 已激活，当前模型：gpt-4o"

## 推荐做法

暂时采用替代方案（在侧栏显示），因为：
1. 更稳定，不依赖 Devin 内部代码结构
2. 实现简单，不需要复杂的补丁逻辑
3. 用户体验仍然良好

等我们确认了 Devin 的确切代码结构后，再实现动态注入。
