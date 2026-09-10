---
title: VSCode 使用插件
comments: true
---

# VSCode 使用插件

除了命令行 Agent 外，许多同学更习惯在 VS Code 编辑器中直接通过图形化插件进行代码补全、侧边栏问答和代码重构。

通过 Token Plan 提供的统一 Gateway 网关，可以轻松将各类主流 VS Code AI 插件接入使用。

---

## 核心连接参数

无论使用哪款插件，在配置自定义服务提供商（Custom Provider / OpenAI or Anthropic Compatible）时，均填写以下参数：

| 配置项 | 填写内容 |
| :--- | :--- |
| **Gateway / Base URL** | `https://chenglab.xmu.edu.cn/llm/` |
| **API Key** | 在平台生成的专属 API Key |

---

## 常见插件配置推荐

### 1. Continue

[Continue](https://continue.dev/) 是广受欢迎的开源 AI 编程助手插件，支持侧边栏问答、Inline 代码编辑（`Cmd/Ctrl + I`）与 Tab 代码补全。

1. 在 VSCode 插件市场搜索并安装 `Continue`。
2. 点击 Continue 侧边栏底部的设置图标（⚙️），打开 `config.json`。
3. 添加模型配置项示例：

```json
{
  "models": [
    {
      "title": "Token Plan - Claude 3.5 Sonnet",
      "provider": "anthropic",
      "model": "claude-3-5-sonnet-20241022",
      "apiKey": "your-token-plan-api-key",
      "apiBase": "https://chenglab.xmu.edu.cn/llm/"
    }
  ]
}
```

---

### 2. Cline / Roo Code

[Cline](https://github.com/cline/cline)（及 Roo Code）是运行在 VSCode 内的自主 Agent 插件，具备读写工作区文件、在终端执行命令、按计划自动完成任务的能力。

1. 在插件市场搜索并安装 `Cline`。
2. 打开 Cline 设置面板（右上角齿轮图标）。
3. **API Provider** 选择 `Anthropic-compatible` 或 `OpenAI-compatible`（根据接入说明选用）。
4. **Base URL** 填入：`https://chenglab.xmu.edu.cn/llm/`。
5. **API Key** 填入您的专属 Key。
6. 选择对应的模型名称后点击保存。

---

## 注意事项

- **切勿将 `config.json` 提交到 Git**：许多插件的配置文件保存在本地（如 `~/.continue/config.json`），若保存在项目根目录下（如 `.vscode/` 或 `.continue/`），请务必确认其已被加入 `.gitignore`。
- **排障与反馈**：若连接出现网络或认证错误，请参考[接入说明文档（飞书）](https://scnd9noiu6a3.feishu.cn/docx/RKxvdzec1o349yx326Ucbgw7nUh)确认端点路径格式。
