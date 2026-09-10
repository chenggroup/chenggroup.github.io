---
title: 使用 cc-switch 管理配置
comments: true
---

# 使用 cc-switch 管理配置

在多场景（例如课题组集群网关、个人测试 Key、官方直连通道等）下使用 Claude Code 时，手动频繁修改环境变量（`ANTHROPIC_BASE_URL` 与 `ANTHROPIC_API_KEY`）容易出错且不够便捷。

**cc-switch** 是一款轻量的配置切换工具，用于在不同 Profile 之间快速切换 Claude Code 的端点与 Key 配置。

---

## 1. 为什么使用 cc-switch

- **多端点管理**：一键在「Token Plan 实验室网关」与「其他提供商/官方」之间切换。
- **避免凭证混淆**：独立存储与隔离不同场景下的 API Key。
- **无感注入**：自动为当前终端或全局会话注入正确的环境变量。

---

## 2. 安装与设置

安装工具脚本或全局命令行包（若实验室提供了特定打包脚本，可按实验室分发途径获取）：

```bash
# 示例：通过 npm 安装或拉取管理脚本
npm install -g cc-switch
# 或根据接入说明下载独立脚本放置于 PATH 路径下
```

---

## 3. 添加 Token Plan 配置 (Profile)

通过命令行添加实验室 Token Plan 对应的环境配置：

```bash
# 添加名为 token-plan 的 profile
cc-switch add token-plan \
  --base-url "https://chenglab.xmu.edu.cn/llm/" \
  --api-key "your-token-plan-api-key"
```

---

## 4. 常用操作

### 切换当前配置

```bash
# 切换到 token-plan 配置
cc-switch use token-plan
```

### 查看所有已保存的配置

```bash
cc-switch list
```

输出示例：
```text
  official
* token-plan (current: https://chenglab.xmu.edu.cn/llm/)
  backup-proxy
```

### 验证生效

切换后，在当前终端中启动 Claude Code：

```bash
claude
```

即可无缝使用对应网关的 Token Plan 额度驱动 Agent。

---

## 5. 参考链接

详细参数与最新指引见：  
[AI4EC-Lab Token Plan 接入说明文档](https://scnd9noiu6a3.feishu.cn/docx/RKxvdzec1o349yx326Ucbgw7nUh)
