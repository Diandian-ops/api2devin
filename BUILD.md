# 构建与安装指南

## 构建插件

在项目根目录运行：

```bash
npm run build
```

这会：
1. 运行所有测试（54 项单元测试）
2. 打包生成 `api2devin-2.6.3.vsix`

## 安装插件

### 方式一：从 VSIX 安装（推荐）

1. 在 Devin Desktop / VS Code 中按 `Cmd+Shift+P`（Windows/Linux 为 `Ctrl+Shift+P`）
2. 选择 **Extensions: Install from VSIX...**
3. 选择生成的 `api2devin-2.6.3.vsix` 文件
4. 重载窗口

### 方式二：从源码目录安装

1. 在 Devin Desktop / VS Code 中按 `Ctrl+Shift+P`
2. 选择 **Extensions: Install Extension from Location...**
3. 选择项目根目录 `devin-byok-bridge/`

## 更新插件

生成新的 VSIX 后，直接安装即可覆盖旧版本。

## 项目结构说明

### 运行时必需文件
- `extension.js` - 扩展入口
- `proxyManager.js` - 代理进程管理
- `sidebarProvider.js` - 侧栏 UI
- `patchManager.js` - Devin Desktop 补丁
- `externalConfigImporter.js` - 配置导入
- `gatewayUrl.js` - 网关 URL 推断
- `thinkingEffort.js` - 思考强度映射
- `sidebarHtml.js` - HTML 工具
- `integrity.js` - 设备 ID 与版本
- `reloadWorkbench.js` - 窗口重载
- `media/` - 图标与前端 JS
- `proxy-scripts/` - 本地代理脚本（核心运行时）

### 文档文件
- `README.md` - 使用说明
- `LICENSE.txt` - MIT 许可证
- `SECURITY.md` - 安全说明
- `DISCLAIMER.md` - 免责声明

### 开发文件（不打包）
- `test/` - 单元测试
- `CONTRIBUTING.md` - 贡献指南
- `node_modules/` - 依赖（已排除）
- `.env` - 本地配置（已排除）

## 清理命令

```bash
# 删除生成的 VSIX
rm -f *.vsix

# 删除依赖（如需重新安装）
rm -rf node_modules proxy-scripts/node_modules
```
