---
title: Tailscale 使用指南
authors: Weifeng Chen
comments: true
---

# Tailscale 使用指南

当你身处 306 办公室内时，你的电脑和办公室里的其它设备连在同一个路由器下，直接通过内网 IP 就能轻松发起 SSH 连接。但当你回到宿舍、家里或外出办公时，由于脱离了 306 办公室的局域网，且办公室网络没有独立的公网 IP，传统的内网 IP 直连就会失效。

**Tailscale 是如何解决这个问题的？** Tailscale 可以为你构建一个跨地域的专属虚拟局域网——称为 **Tailnet**。你只需要在**自己的随身电脑**和 **306 办公室的远端主机**上分别安装 Tailscale 并登录同一个账号，Tailscale 就会在两台设备之间自动打通一条加密隧道，并为每台设备分配一个固定的 `100.x.y.z` 虚拟局域网 IP。借助这个虚拟 IP，无论你在哪里上网，都可以像坐在 306 办公室里一样，直接通过 SSH 访问那台远端主机。

## 一、 接入 Tailnet

要实现跨网访问，需要先把你手头的电脑（以 Windows 为例）和 306 办公室里的远端主机（以 Linux 为例）同时接入你的 Tailnet。

### 1. 前置准备

- 访问 [tailscale.com](https://tailscale.com/)，点击右上角的 **Get Started** 注册一个 Tailscale 账号（支持直接使用 GitHub、Google 或 Microsoft 账号登录）。

### 2. Windows 端（个人电脑）接入

- **安装**：访问 [Tailscale Windows 下载页](https://tailscale.com/download/windows) 下载安装包后，按默认配置安装即可。
- **登录 & 接入 Tailnet**：
    - 右键点击任务栏右下角中的 Tailscale 图标，选择 **Log in**。
    - 在弹出的浏览器窗口中完成登录后，选择 **Connect**，同意当前设备接入你的 Tailnet。
- **查看设备的 Tailnet IP**：
    - 右键点击任务栏中的 Tailscale 图标，菜单顶部即可看到当前设备的虚拟 IP（`100.x.y.z`）。
    - 或者打开命令行终端，使用 `tailscale status` 命令查看。

### 3. Linux 端（306 办公室远端主机）接入

_(注：首次配置需在能够接触到 306 主机时完成)_

- **安装**：在 306 主机的终端中执行官方一键安装命令：
	```bash
	curl -fsSL https://tailscale.com/install.sh | sh
	```
    
- **登录 & 接入 Tailnet**：
    - 运行启动命令：  
		```bash
		sudo tailscale up
		```
    - 复制终端中打印出的登录链接到浏览器中打开。使用同一个账号完成登录后，选择 **Connect**，同意 306 主机接入你的 Tailnet。
- **查看设备的 Tailnet IP**： 在终端运行以下命令，记下分配给 306 主机的 `100.x.y.z` 虚拟 IP：
	```bash
	tailscale status
	```

## 二、 经过 Tailnet 的 SSH 连接

当你的个人电脑和 306 办公室的远端主机都接入 Tailnet 后，它们在网络层面上就已经处于同一个虚拟局域网中了。

为了不用每次连接都手动输入一长串虚拟 IP，可以在你个人电脑的 `~/.ssh/config` 文件（Windows 下路径通常为 `C:\Users\<你的用户名>\.ssh\config`）中添加如下配置：

```
Host office-306
    HostName <306主机的tailscale ip>
    User <306主机上你的账户名字>
    PubkeyAuthentication no
```

_(说明：`PubkeyAuthentication no` 用于强制使用密码验证，防止本地存在多个 SSH 密钥导致认证报错；若后续配置了 SSH 免密公钥登录，将该行删除即可。)_

保存配置后，无论你在宿舍还是家里，只需打开本地终端运行以下命令并输入密码，即可直接连入 306 办公室的主机：

```bash
ssh office-306
```

## 三、 其它常用命令与状态检查

在使用过程中，你可以通过以下几个命令随时查看虚拟局域网内的设备状态，或排查你与 306 主机之间的网络连接质量：

```bash
# 查看当前 tailnet 中都有哪些设备，和它们的 ip 及在线状态
tailscale status

# 测试是否和 306 办公室的主机间成功建立了 P2P（点对点）直连
# 若输出显示 "via <IP:端口>" 说明已打通直连；若显示 "via DERP(xxx)" 说明正在通过官方中继节点转发
tailscale ping <306主机的 tailscale ip 或设备名>

# 查看当前设备的 tailscale 网络服务状态（检测本地网络环境、UDP 连通性及中继节点延迟）
tailscale netcheck
```

