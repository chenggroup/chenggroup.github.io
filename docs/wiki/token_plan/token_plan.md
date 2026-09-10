---
title: Token 计划概述
comments: true
---

# Token 计划

**AI4EC-Lab Token Plan** 为课题组成员统一开通 LLM 计算服务账号并发放使用额度，方便大家在日常科研、学习与项目开发中调用前沿大语言模型。

- 服务平台：<https://chenglab.xmu.edu.cn/llm/>
- 官方接入文档（飞书）：<https://scnd9noiu6a3.feishu.cn/docx/RKxvdzec1o349yx326Ucbgw7nUh>

## 快速连接信息

在各类 Agent 与开发工具中，核心连接配置如下：

| 配置项 | 填写内容 | 说明 |
| :--- | :--- | :--- |
| **Gateway URL** | `https://chenglab.xmu.edu.cn/llm/` | 代理服务网关地址 |
| **API Key** | 在平台生成的专属 Key | 登录平台控制台自行创建并妥善保管 |

## 开通与额度

参加 Cheng Lab 新生线上培训并填写需求问卷的同学，会收到开通通知邮件，其中包含账号邮箱与首期额度。其他有需要的同学可通过申请问卷申请。

!!! info "额度信息以开通邮件为准"
    额度与账号绑定，具体数额、生效时间见自己的开通邮件。额度不足或有更高需求时，请联系 AI4EC-Lab 团队。

## Agent 与客户端接入指南

针对不同的科研与编程场景，可选择合适的客户端工具接入使用：

1. **[在终端使用 Claude Code CLI](./claude_code.md)**：Anthropic 官方命令行 Agent 工具，适合终端重度用户、代码重构与自动化脚本编写。
2. **[使用 cc-switch 管理配置](./cc_switch.md)**：便捷管理与快速切换 Claude Code 的多个环境配置、网关端点与 API Key。
3. **[VSCode 使用插件](./vscode.md)**：在 VS Code 编辑器中配置 Continue、Cline、Roo Code 等 AI 插件，实现代码补全、侧边栏对话与项目重构。

## 注意事项

1. **安全规范**：妥善保管账号与 API Key，**严禁将 Key 写入代码、文档或公开仓库中**。
2. **使用范围**：发放的额度仅限用于相关学术科研、学习与项目开发。
3. **技术支持**：使用中遇到问题可先查阅[常见问题](./faq.md)，仍有疑问或有更高额度需求，欢迎随时联系 AI4EC-Lab 团队。
