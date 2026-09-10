---
title: 常见问题
comments: true
---

# Token 计划常见问题

本文汇总使用 Token 计划接入各类客户端时的常见问题与排查方法。

!!! tip "排查前先确认三件事"
    1. **Gateway URL** 为 `https://chenglab.xmu.edu.cn/llm/`（注意结尾的斜杠）。
    2. **API Key** 复制完整，前后没有多余空格或换行。
    3. 配置修改后**新开一个终端**（或 `source` 配置文件），确保环境变量已生效。

---

## 认证与连接

### 提示 401 / 403 认证失败

按顺序检查：

1. **Key 是否完整**：从平台复制时容易漏掉首尾字符或带上多余空格，可先用 `echo` 打印确认。
2. **Key 是否仍然有效**：Key 被删除或重置后，旧 Key 会立即失效，请到平台重新生成。
3. **地址是否写对**：`ANTHROPIC_BASE_URL` 必须是 `https://chenglab.xmu.edu.cn/llm/`，不要填成官网地址。

确认当前终端实际生效的配置：

```bash
env | grep ANTHROPIC
```

若输出的值与预期不符，说明有其它配置文件（如另一个 profile）在后加载并覆盖了它。

### 连接超时或无法访问网关

- 确认当前网络能访问 `https://chenglab.xmu.edu.cn/llm/`，校外访问可能需要先连学校 VPN。
- 若终端里配置过全局代理，请确认代理不会拦截校内域名。
- 部分客户端在拼接请求路径时对结尾斜杠敏感，**URL 结尾的 `/` 不要省略**。

### 改了环境变量却不生效

环境变量只对**新启动**的进程生效。修改 `~/.bashrc` 或 `~/.zshrc` 后需要：

```bash
source ~/.zshrc  # 或 source ~/.bashrc
```

或者直接关闭当前终端重新打开。另外注意：写入 `~/.bashrc` 的配置在 zsh 中不会自动加载，反之亦然，请确认写入了当前实际使用的 shell 对应的配置文件。

---

## Claude Code

### 已经配置好网关，但仍在使用官方账号

Claude Code 可能读取了此前的登录状态。在 `claude` 会话中执行 `/status` 可以查看当前实际使用的 Base URL 与模型；若显示的仍是官方地址，请检查：

- 是否曾执行过 `claude login` 或存在其它覆盖 `ANTHROPIC_BASE_URL` 的配置文件；
- 终端中是否存在多处重复设置 `ANTHROPIC_API_KEY` 的地方（后设置的会覆盖先前的）。

### 提示模型不存在（model not found）

模型名称需与平台实际支持的列表一致，请以[接入说明文档（飞书）](https://scnd9noiu6a3.feishu.cn/docx/RKxvdzec1o349yx326Ucbgw7nUh)中列出的名称为准，不要直接照搬官方文档中的型号。

---

## VS Code 插件

### 插件里应该选哪种 Provider

网关同时提供 Anthropic 与 OpenAI 兼容接口，具体选择取决于插件与平台文档说明：

- 使用 Anthropic 兼容模式时，Base URL 填 `https://chenglab.xmu.edu.cn/llm/`；
- 使用 OpenAI 兼容模式时，注意部分插件要求地址结尾带 `/v1`，请以插件与平台文档为准。

若一种模式报错，可以换另一种模式再试，并确认所选**模型名称**在平台支持列表内。

### 配置文件被提交到了 Git

Continue、Cline 等插件的配置文件默认位于用户目录（如 `~/.continue/config.json`），一般不会被 Git 追踪。但如果把配置放在了项目目录下（如 `.vscode/`、`.continue/`），请务必确认已写入项目的 `.gitignore`。

!!! danger "Key 一旦进入 Git 历史就很难彻底清除"
    若不小心提交了 API Key，请**先到平台吊销并重新生成该 Key**，再处理仓库历史。单纯删除文件并不能阻止他人从历史记录中读取。

---

## 额度与账号

### 如何查看剩余额度

额度与账号绑定，具体查询方式见开通邮件或平台控制台说明。

### 额度不够用了怎么办

有更高需求时请联系 AI4EC-Lab 团队申请追加，说明用途与大致用量即可。

### 忘记 Key 或怀疑 Key 泄露

直接到平台控制台重新生成一个新的 Key，并同步更新本地配置；旧 Key 请及时删除。

---

## 反馈与补充

如果遇到本文未覆盖的问题，欢迎联系 AI4EC-Lab 团队，或直接在本页下方留言、在仓库 issue 中记录。
