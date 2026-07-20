# 简化配置设计文档

## 新的配置结构

### 用户界面配置（简化）
```bash
# 用户只需填写
BYOK_BASE_URL=https://api.example.com
BYOK_API_KEY=sk-xxx

# 用户选择的模型（从拉取的列表中选）
BYOK_PRIMARY_MODEL=claude-opus-4-8

# 可选：思考强度（自动根据模型提供商显示）
BYOK_THINKING_EFFORT=medium
```

### 底层映射（自动转换）
```bash
# 系统自动映射到原有的 BYOK1/BYOK2 结构
BYOK1_ANTHROPIC_API_HOST=https://api.example.com
BYOK1_ANTHROPIC_API_KEY=sk-xxx
BYOK1_OPENAI_API_HOST=https://api.example.com
BYOK1_OPENAI_API_KEY=sk-xxx
BYOK1_MODEL=claude-opus-4-8
BYOK1_THINKING_EFFORT=medium

BYOK2_ANTHROPIC_API_HOST=https://api.example.com
BYOK2_ANTHROPIC_API_KEY=sk-xxx
BYOK2_OPENAI_API_HOST=https://api.example.com
BYOK2_OPENAI_API_KEY=sk-xxx
BYOK2_MODEL=claude-opus-4-8
BYOK2_THINKING_EFFORT=medium
```

## UI 变化

### 旧 UI（BYOK #1/2）
```
┌─ BYOK #1 ─────────────┐
│ Base URL: [_______]   │
│ API Key:  [_______]   │
│ [加载模型]             │
│ Model: [选择_____]     │
└───────────────────────┘

┌─ BYOK #2 ─────────────┐
│ Base URL: [_______]   │
│ API Key:  [_______]   │
│ [加载模型]             │
│ Model: [选择_____]     │
└───────────────────────┘
```

### 新 UI（简化）
```
┌─ 网关配置 ────────────┐
│ Base URL: [_______]   │
│ API Key:  [_______]   │
│ [连接并获取模型]       │
└───────────────────────┘

┌─ 模型选择 ────────────┐
│ 主模型:               │
│ [claude-opus-4-8 ▼]  │
│                       │
│ 思考强度:             │
│ [中等 ▼]             │
└───────────────────────┘

[保存配置并启动]
```

## 功能映射

| 简化配置 | 底层映射 | 说明 |
|---------|---------|------|
| BYOK_BASE_URL | BYOK1/2_*_API_HOST | 两个槽位共享 |
| BYOK_API_KEY | BYOK1/2_*_API_KEY | 两个槽位共享 |
| BYOK_PRIMARY_MODEL | BYOK1/2_MODEL | 两个槽位使用同一模型 |
| BYOK_THINKING_EFFORT | BYOK1/2_THINKING_EFFORT | 两个槽位使用相同强度 |

## 向后兼容

- 如果 `.env` 中存在 BYOK1/BYOK2 配置，优先使用
- 如果只有简化配置，自动转换为 BYOK1/BYOK2
- 用户可以随时切换回高级模式（通过环境变量）
