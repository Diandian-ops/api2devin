# API2Devin

> **项目说明**  
> 本项目 Fork 自 [ycx932436/devin-byok-bridge](https://github.com/ycx932436/devin-byok-bridge)，遵循 MIT 开源协议。  
> 感谢原作者 [@ycx932436](https://github.com/ycx932436) 的优秀工作。

Devin Desktop BYOK 桥接插件 — 使用自己的 API Key 连接 Claude / GPT / Gemini 模型。

## 快速开始

### 1. 安装插件

在 Devin Desktop / VS Code 中：

- `Ctrl+Shift+P` → **Extensions: Install Extension from Location...**
- 选择本仓库根目录

### 2. 配置使用

1. 点击左侧 **API2Devin** 图标
2. 填写 **Base URL** 和 **API Key**（支持导入 `~/.claude` 或 `~/.codex` 配置）
3. 点击 **加载模型**，选择你的模型
4. 点击 **一键启动**
5. **补丁管理** → **安装补丁** → **重载窗口**

Base URL 可以只填域名，也可以粘贴带 `/v1`、`/v1/messages`、`/v1/responses` 或 `/v1/chat/completions` 的地址。插件会自动探测模型列表入口、鉴权方式和对应的请求路径，并在运行时按所选模型切换 Anthropic/OpenAI 兼容协议。

### 3. 使用模型

在 Devin Desktop 中选择：
- `Claude Opus 4 BYOK` → 使用 BYOK #1 配置
- `Claude Opus 4 Thinking BYOK` → 使用 BYOK #2 配置

## 双 BYOK 配置

支持两套独立配置，可指向不同网关、Key 和模型：

| 槽位 | 用途 |
|------|------|
| **BYOK #1** | 主代理 |
| **BYOK #2** | 思考模型 |

## 支持的模型

- **Claude**: claude-opus-4-*, claude-sonnet-4-* 等
- **GPT**: gpt-4o, gpt-5.6-* 等  
- **Gemini**: gemini-3.5-flash, gemini-2.5-* 等

## 环境变量配置

插件会自动管理 `proxy-scripts/.env`，也可以手动配置：

```bash
# BYOK #1
BYOK1_ANTHROPIC_API_HOST=https://api.anthropic.com
BYOK1_ANTHROPIC_API_KEY=sk-ant-xxx
BYOK1_MODEL=claude-opus-4-8

# BYOK #2
BYOK2_ANTHROPIC_API_HOST=https://api.anthropic.com
BYOK2_ANTHROPIC_API_KEY=sk-ant-xxx
BYOK2_MODEL=claude-opus-4-8
```

自定义思考参数默认关闭。仅在确认中转支持时开启：

```bash
CUSTOM_THINKING_ENABLED=true
BYOK1_THINKING_EFFORT=medium
BYOK2_THINKING_EFFORT=high
```

中转明确拒绝思考参数时，代理会自动去掉参数重试并缓存该“中转 + 模型”的不支持状态。

## 常见问题

**补丁失效？** Devin Desktop 更新后重新安装补丁并重载窗口。

**端口占用？** 修改 `HYBRID_PORT` 或 `INFERENCE_PORT` 后重启代理。

**模型加载失败？** 检查 API Key、余额和网络连接。

## 重要说明

- ⚠️ **非官方工具** — 与 Devin Desktop / Codeium 无关联
- 🔒 **仅本地运行** — 默认 `127.0.0.1`，不要暴露到公网
- 📋 **MIT 协议** — 原作者版权归 ycx932436
- 🔐 **隐私保护** — API Key 仅保存本地，切勿提交到 Git

## 链接

- 原项目：https://github.com/ycx932436/devin-byok-bridge
- 本仓库：https://github.com/Diandian-ops/api2devin
- 详细文档：查看原项目的完整 README
- 法律声明：[DISCLAIMER.md](DISCLAIMER.md)
- 安全说明：[SECURITY.md](SECURITY.md)

## 许可证

MIT License - 原作者 ycx932436 © 2026
