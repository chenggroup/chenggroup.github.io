---
title: 在终端使用 Claude Code CLI
comments: true
---

# 在终端使用 Claude Code CLI

[Claude Code](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview) 是 Anthropic 官方推出的命令行 Agent 编程助手，能够直接在终端中读取本地代码仓库、运行测试、编辑文件并执行 Git 操作，非常适合终端重度用户与自动化任务开发。

---

## 1. 环境准备

Claude Code 依赖 Node.js（推荐 Node 18+）：

```bash
node -v
npm -v
```

若尚未安装 Node.js，可通过 Conda 或 nvm 安装：

```bash
# 使用 conda 安装 nodejs
conda install -c conda-forge nodejs -y
```

---

## 2. 安装 Claude Code

通过 npm 全局安装：

```bash
npm install -g @anthropic-ai/claude-code
```

安装完成后可通过查看版本验证：

```bash
claude --version
```

---

## 3. 配置网关与 API Key

通过 Token Plan 提供的 Gateway URL 与专属 API Key，在 shell 配置文件（如 `~/.bashrc` 或 `~/.zshrc`）中设置环境变量：

```bash
# 编辑 ~/.bashrc 或 ~/.zshrc
export ANTHROPIC_BASE_URL="https://chenglab.xmu.edu.cn/llm/"
export ANTHROPIC_API_KEY="your-token-plan-api-key"
```

保存后刷新配置：

```bash
source ~/.bashrc  # 或 source ~/.zshrc
```

!!! danger "切勿泄露 API Key"
    请勿将 API Key 写入任何会被 Git 追踪的文件或推送到公开仓库中。

---

## 4. 启动与基础使用

进入需要操作的项目代码根目录后，直接执行：

```bash
claude
```

首次进入会提示阅读权限与工作模式选择：

- **直接对话与提问**：例如 `解释当前项目的目录结构与核心逻辑`、`帮我写一个测试脚本`
- **使用内置命令**：
  - `/help`：查看所有可用的命令与快捷键
  - `/clear`：清除当前会话上下文
  - `/config`：检查与调整当前配置
- **退出工具**：输入 `exit` 或按 `Ctrl + C` / `Ctrl + D`

---

## 5. 参考与进阶

更多详细配置参数与最新说明，请查阅飞书文档：  
[AI4EC-Lab Token Plan 接入说明文档](https://scnd9noiu6a3.feishu.cn/docx/RKxvdzec1o349yx326Ucbgw7nUh)
