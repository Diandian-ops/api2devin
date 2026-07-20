# 简化配置方案

## 目标
- 只填 BASE URL + API Key
- 自动拉取所有可用模型
- 直接选模型使用，不需要理解 BYOK #1/2 概念

## 改造清单

### 1. 侧栏 UI 改造 (`sidebarProvider.js`)

#### 当前流程
```
填写 BYOK #1: Base URL + Key + 手动加载模型 + 选模型
填写 BYOK #2: Base URL + Key + 手动加载模型 + 选模型
↓
Devin 里选 "Claude Opus 4 BYOK" 或 "Claude Opus 4 Thinking BYOK"
```

#### 目标流程
```
填写一次: Base URL + Key
↓ 自动拉取
显示所有可用模型（claude-opus-4, gpt-4o, gemini-2.0-flash 等）
↓ 用户直接选
选一个主模型 + （可选）一个思考模型
↓
Devin 里只需选 "BYOK Chat" 入口
```

### 2. 配置简化

#### 新的 .env 结构
```bash
# 简化配置
BYOK_BASE_URL=https://your-gateway.com
BYOK_API_KEY=sk-xxx

# 用户选择的模型（侧栏选后自动写入）
BYOK_PRIMARY_MODEL=claude-opus-4-8
BYOK_THINKING_MODEL=claude-opus-4-8  # 可选，用于需要深度思考的场景

# 自动检测（无需手动填）
# BYOK_AVAILABLE_MODELS=["claude-opus-4-8","gpt-4o","gemini-2.0-flash"]
```

### 3. 代理路由改造 (`proxy-scripts/src/handlers/byok-slots.js`)

#### 当前逻辑
```javascript
// Devin 选了 "Claude Opus 4 BYOK" → 走 BYOK1 配置
// Devin 选了 "Claude Opus 4 Thinking BYOK" → 走 BYOK2 配置
```

#### 新逻辑
```javascript
// Devin 选了 "BYOK Chat" → 根据请求类型智能路由
if (需要深度思考 && BYOK_THINKING_MODEL 存在) {
  使用 BYOK_THINKING_MODEL
} else {
  使用 BYOK_PRIMARY_MODEL
}
```

### 4. 具体实现步骤

#### Step 1: 侧栏 UI 改造
**位置**: `sidebarProvider.js` 的 `getHtml()` 方法

**当前 HTML（简化）**:
```html
<h3>BYOK #1</h3>
<input id="byok1-host" placeholder="Base URL">
<input id="byok1-key" placeholder="API Key">
<button onclick="loadModels(1)">加载模型</button>
<select id="byok1-model"></select>

<h3>BYOK #2</h3>
<input id="byok2-host" placeholder="Base URL">
<input id="byok2-key" placeholder="API Key">
<button onclick="loadModels(2)">加载模型</button>
<select id="byok2-model"></select>
```

**新 HTML**:
```html
<h3>网关配置</h3>
<input id="byok-host" placeholder="Base URL (如: https://api.openai.com)">
<input id="byok-key" type="password" placeholder="API Key">
<button onclick="connectAndLoadModels()">连接并获取模型</button>

<div id="model-list-panel" style="display:none">
  <h3>选择模型</h3>
  <label>主模型（用于日常对话）</label>
  <select id="primary-model">
    <!-- 自动填充 -->
  </select>
  
  <label>思考模型（可选，用于复杂推理）</label>
  <select id="thinking-model">
    <option value="">不使用</option>
    <!-- 自动填充 -->
  </select>
  
  <button onclick="saveSimpleConfig()">保存配置</button>
</div>
```

#### Step 2: 自动拉模型逻辑
**位置**: `sidebarProvider.js` 的 `handleMessage()` 方法

```javascript
case "connectAndLoadModels":
  const baseUrl = msg.baseUrl;
  const apiKey = msg.apiKey;
  
  // 调用现有的 fetchModelsFromGateway
  const models = await this.fetchModelsFromGateway(apiKey, baseUrl);
  
  // 返回给前端
  this.view?.webview.postMessage({
    type: "modelsLoaded",
    models: models,
    baseUrl: baseUrl,
    apiKey: apiKey
  });
  break;

case "saveSimpleConfig":
  // 保存简化配置
  const config = {
    BYOK_BASE_URL: msg.baseUrl,
    BYOK_API_KEY: msg.apiKey,
    BYOK_PRIMARY_MODEL: msg.primaryModel,
    BYOK_THINKING_MODEL: msg.thinkingModel || "",
    
    // 兼容旧逻辑：把主模型写到 BYOK1，思考模型写到 BYOK2
    BYOK1_ANTHROPIC_API_HOST: msg.baseUrl,
    BYOK1_ANTHROPIC_API_KEY: msg.apiKey,
    BYOK1_MODEL: msg.primaryModel,
    
    BYOK2_ANTHROPIC_API_HOST: msg.baseUrl,
    BYOK2_ANTHROPIC_API_KEY: msg.apiKey,
    BYOK2_MODEL: msg.thinkingModel || msg.primaryModel
  };
  
  await this.applySavedConfig(config);
  break;
```

#### Step 3: 前端交互
**位置**: `media/sidebar.js`

```javascript
async function connectAndLoadModels() {
  const baseUrl = document.getElementById('byok-host').value.trim();
  const apiKey = document.getElementById('byok-key').value.trim();
  
  if (!baseUrl || !apiKey) {
    alert('请填写 Base URL 和 API Key');
    return;
  }
  
  vscode.postMessage({
    command: 'connectAndLoadModels',
    baseUrl: baseUrl,
    apiKey: apiKey
  });
}

// 接收模型列表
window.addEventListener('message', event => {
  const msg = event.data;
  if (msg.type === 'modelsLoaded') {
    const primarySelect = document.getElementById('primary-model');
    const thinkingSelect = document.getElementById('thinking-model');
    
    // 清空并填充
    primarySelect.innerHTML = '';
    thinkingSelect.innerHTML = '<option value="">不使用</option>';
    
    msg.models.forEach(model => {
      primarySelect.innerHTML += `<option value="${model.id}">${model.id}</option>`;
      thinkingSelect.innerHTML += `<option value="${model.id}">${model.id}</option>`;
    });
    
    document.getElementById('model-list-panel').style.display = 'block';
  }
});

function saveSimpleConfig() {
  vscode.postMessage({
    command: 'saveSimpleConfig',
    baseUrl: document.getElementById('byok-host').value.trim(),
    apiKey: document.getElementById('byok-key').value.trim(),
    primaryModel: document.getElementById('primary-model').value,
    thinkingModel: document.getElementById('thinking-model').value
  });
}
```

#### Step 4: 智能路由（可选高级特性）
**位置**: `proxy-scripts/src/handlers/byok-slots.js`

```javascript
// 新增：根据请求特征判断是否需要思考模型
function shouldUseThinkingModel(request) {
  const config = getRuntimeConfig();
  
  // 如果没配思考模型，直接用主模型
  if (!config.BYOK_THINKING_MODEL) return false;
  
  // 检测需要深度思考的场景
  const indicators = [
    request.messages?.some(m => m.content?.length > 5000), // 长上下文
    request.messages?.some(m => /分析|推理|证明|设计/.test(m.content)), // 关键词
    request.max_tokens > 8000, // 需要长输出
  ];
  
  return indicators.some(x => x);
}

// 修改现有的 getByokSlot
export function getByokSlot(modelName, request) {
  const config = getRuntimeConfig();
  
  // 简化模式：只看是否需要思考
  if (shouldUseThinkingModel(request)) {
    return {
      slot: 2,
      model: config.BYOK_THINKING_MODEL || config.BYOK_PRIMARY_MODEL,
      ...
    };
  }
  
  return {
    slot: 1,
    model: config.BYOK_PRIMARY_MODEL,
    ...
  };
}
```

### 5. 向后兼容

保持原有的 BYOK #1/2 配置方式仍然可用：

```javascript
// proxyManager.js 的 writeEnvConfig
if (config.BYOK_BASE_URL) {
  // 新简化模式
  config.BYOK1_ANTHROPIC_API_HOST = config.BYOK_BASE_URL;
  config.BYOK1_MODEL = config.BYOK_PRIMARY_MODEL;
  // ...
} else {
  // 传统模式，保持原逻辑
}
```

### 6. 测试验证

1. **配置测试**
   - 填写 BASE URL + Key
   - 点击"连接并获取模型"
   - 验证模型列表正确显示

2. **路由测试**
   - 选主模型 = claude-opus-4-8
   - 选思考模型 = 不使用
   - 在 Devin 中发起对话，验证使用 claude-opus-4-8

3. **智能切换测试**
   - 配置思考模型 = o1-preview
   - 发起长复杂请求，验证自动切到 o1-preview

## 工作量估算

- 侧栏 UI 改造: 2-3 小时
- 配置逻辑简化: 1-2 小时
- 路由智能判断: 1-2 小时（可选）
- 测试验证: 1 小时

**总计**: 约 5-8 小时可完成基础版本

## 收益

- ✅ 用户只需填一次配置
- ✅ 不需要理解 BYOK #1/2 概念
- ✅ 一个 BASE URL 可以用所有模型
- ✅ 切换模型只需要在侧栏下拉选择
- ✅ 保持向后兼容
