---
title: SSH 与 SCP 使用入门
authors: 庄永斌
priority: 1.02
comments: true
---

# SSH 使用入门

*此入门仅介绍一些作者认为必要且实用的功能，完善的帮助手册可以通过命令，`man ssh_config`, `man ssh`查看* 

为便于说明，假设需要登陆的远程服务器IP为123.45.67.89，SSH 端口为 7696，用户名为kmr。


## 学习目标

- 使用SSH登录服务器/集群
- 使用SCP进行文件传输

### 可选目标

- 使用ssh config文件进行SSH登录管理
- 学会用跳板机进行SSH登录

## 创建密钥对

!!! warning
    新人必学

`ssh` 是用来安全进行登录远程电脑的命令。使用后，有两种选择来验证登录

1. 使用密码
2. 使用密钥 

第一种方法已经为大众所熟知，但是不安全。因此我们采用密钥进行登录。

使用如下命令生成密钥:

```bash
ssh-keygen
```

根据终端的提示进行操作（实际上你可能只需要不停按`enter`键）。默认情况下你会在`~/.ssh`目录中得到`id_rsa`和`id_rsa.pub`文件，他们分别是私钥和公钥。创建好了之后请把`id_rsa.pub`文件给服务器管理员。

!!! warning
    私钥是登录集群的钥匙，请务必保管好这个文件，防止自己的电脑被入侵

## 使用SSH登录服务器

!!! warning
    新人必学

若远程服务器已经放置了公钥，则可输入以下命令登陆服务器：

```bash
ssh -i <path to your private key> -p <port number> username@server_ip
```

示例，假设密钥在本地的路径为 `~/.ssh/id_rsa`：

```bash
ssh -i ~/.ssh/id_rsa -p 7696 kmr@123.45.67.89
```

`-p` 后指定的是端口。若省略不写，默认通过 22 端口与远程服务器进行连接。

默认情况下，`id_rsa`和`id_rsa.pub`文件位于`~/.ssh`下，则`-i` 选项及其对应参数可以省略。

!!! warning
    计算集群只允许在校园网特定IP范围内直接登陆使用。

## 使用SCP进行文件传输

SCP实际上是SSH+FTP的结合，如果配置好了SSH命令，可以使用以下命令来进行文件传输：

```bash
scp myserver:remote_file local_directory_path
scp local_directory_path myserver:remote_file
```

比如需要把上文提到的远程服务器的文件`/data/home/kmr/file`传到本地 `/some/local/place` 目录下，
则使用命令：

```bash
scp -P 7696 kmr@123.45.67.89:/data/home/kmr/file /some/local/place
```

从本地上传到远程则交换顺序：

```bash
scp -P 7696 /some/local/place/file kmr@123.45.67.89:/data/home/kmr/
```
!!! warning
    注意 scp 指定端口的命令是大写的<code>-P</code> 而非小写的 <code>-p</code>，这是不同于 ssh 命令的一点。

若所传文件为目录，则需要使用`-r`选项：

```bash
scp -r -P 7696 kmr@123.45.67.89:/data/home/kmr/directory /some/local/place
```

!!! tip
    注意 `scp` 本身可以看作一个特殊的 `ssh` 命令，因此无论从远程还是本地传输文件都应在本地运行，只是参数的顺序决定了传输的方向。如果两个参数均写本地路径，则与 `cp` 命令的行为相近，但不可均写远程路径。

zsh下 （比如macOS >=10.15版本的默认终端），不能直接使用通配符`*`批量传输文件，需要将包含`*`的字符串用单引号括起。

## 可选：通过配置 config 优雅地的使用 SSH

为了避免每次都输入一大串命令。 请使用vim编辑如下文件：

```bash
vim ~/.ssh/config
```

!!! danger "注意"
    请注意修改该文件权限为600(即`-rw-------`)，否则可能导致无法并行。

我们可以把SSH命令的参数都储存在这个文件里。以下是语法示例文件：

```bash
Host myserver # nickname for your cluster
    User kmr # replacement of username in ssh
    Hostname 123.45.67.89 # replace of cluster_ip in ssh
    Port 7696 # replacement of -p <port number> in ssh
    IdentityFile ~/.ssh/id_rsa # replace of -i <path to your private key> in ssh
```

保存上述文件，你就可以简单地使用如下命令登录:

```bash
ssh myserver
```

此命令即相当于上文提到的`ssh -i ~/.ssh/id_rsa -p 7696 kmr@123.45.67.89`。

### 加深理解

!!! warning
    该视频仅帮助理解SSH原理以及基本操作，视频中含有本笔记未要求的内容，但是大部分普通用户没有权限执行。

<iframe src="https://player.bilibili.com/player.html?aid=65952912&bvid=BV1y4411q7PW&cid=114414833&page=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" height="600" width="800"> </iframe>

## 在本地电脑显示服务器图像 (X11 Forwarding)

使用终端登录服务器后没办法直接显示图形界面。有时候在*服务器*上使用画图软件时，可以通过X11 Forwarding功能将图像显示到本地电脑上。只需要在命令里加上`-X`或者`-Y`：

```bash
ssh -X -i <para.> -p <para.> username@server_ip
```

### 在config文件中配置X11 Forwarding*

```bash
Host <hostnickname>
    ForwardX11 yes  # equivalent to -X
    ForwardX11Trusted yes # equivalent to -Y (This option valid only if your ForwardX11 is set to yes!)
```

## 使用跳板机/代理进行远程登录

本组的服务器限制了登录的ip，即你只能在学校ip范围内进行登录。同时由于登录需要密钥，而密钥保存在办公室电脑上，因此登录就必须使用办公室电脑。因此，人不在办公室时就很难登录服务器。

解决方法就是，先在校园网环境下通过SSH登录到办公室电脑（仅自己的用户名密码即可），再通过办公室电脑登录到服务器。此时办公室电脑是作为*跳板*来使用的：

```bash
ssh username@proxy
ssh -p port_number -i key_file username@cluster191
```

### 在config文件中配置跳板机*

打开 `~/.ssh/config`，复制以下代码（注意去掉注释，否则可能会报错）：

```bash
Host proxy # nickname you set for your office computer
    User robinzhuang # username you set for login
    Hostname 10.24.3.xxx # IP address of your office computer, change the xxx to real one!
 
Host myserver # nickname for your cluster
    User kmr # username you set, change to real one!
    Hostname 123.45.67.89 # IP for cluster, change to real one!
    IdentityFile ~/.ssh/id_rsa # the key file location used in login 
    Port xx # specify the port number, replace xx with real port!
    ProxyJump proxy # use Host proxy as Jump Server
```

我们可以发现其实是直接登录课题组服务器的一些改进，我们首先配置了从这台电脑登录到跳板机的命令，然后再配置利用跳板机到服务器的命令。

> 如果上述的 `ProxyJump proxy` 不起作用，可将其替换为 `ProxyCommand ssh -o 'ForwardAgent yes' proxy "ssh-add ~/.ssh/id_rsa && nc %h %p"` ，请用你的密钥的路径来代替上述的 `~/.ssh/id_rsa` 部分。

完成以上配置后可以使用如下命令直接配置：

```bash
ssh myserver
```

### 在config文件中转发端口*

有时，我们在服务器上部署了 `jupyter notebook` 等服务时，需要把远程的某个端口 (以下例子中为 `8888` 端口) 转发到本地的某个端口 (以下例子中为 `9999` 端口)，使得在本地访问 `https://localhost:9999` 时也能访问远程的 `jupyter notebook` 服务。

```bash
Host myserver # nickname for your cluster
    User kmr # username you set, change to real one!
    Hostname 123.45.67.89 # IP for cluster, change to real one!
    LocalForward 9999 localhost:8888 # fist IP is your local IP, second IP is remote IP you want to forward
```

### 在使用跳板机的情况下使用X11 Forwarding

只需要在 `~/.ssh/config` 中加入

```bash
Host *  # valid for all host
    ForwardX11Trusted yes
```

## 一份示例配置文件（config）

以下为 `~/.ssh/config` 的一个示例，需要时可在这份示例文件上进行修改，必要修改的部分已在注释中标出，`General config` 可以直接照抄。注意须删掉文件中所有的注释。

```bash
# General config
Host *
    ForwardX11Trusted yes
    ForwardAgent yes
    AddKeysToAgent yes
    ServerAliveInterval 60
    ControlPersist yes
    ControlMaster auto
    ControlPath /tmp/%r@%h:%p

# set proxy
Host nickname_proxy # nickname for your Jump Server
    Hostname 10.24.3.255 # IP for Jump Server (REPlACE IT!)
    User chenglab # your username for Jump Server (REPlACE IT!)

# Host1 and host2
Host nickname_1 # nickname for your cluster
    Hostname 123.45.67.89
    User kmr1 # your host1 username (REPlACE IT!)
    LocalForward 8051 localhost:8888

Host nickname_2 # nickname for your cluster
    Hostname 123.45.67.90
    User kmr2 # your host2 username (REPlACE IT!)
    LocalForward 8052 localhost:8888
    
# set same parts for host1 and host2
Host nickname_1 nickname_2 # use your own nickname
    Port 7696
    ProxyJump nickname_proxy # use your own nickname
```

## 超纲的部分​​*

在配置文件中实现类似选择语句的功能，以下例子描述的是当网络环境随时变更时，连接同一台机器可能会需要访问不同IP时所采取的策略。

> 此例子不建议初学者直接复制粘贴，其中需要替换的部分请根据具体应用场景来自行斟酌

```bash
Host elements
    User chenglab
    Match host elements exec "nc -G 4 -z 10.24.3.144 %p"
        Hostname 10.24.3.144 # Private net IP
    Match host elements
        Hostname xxx.xxx.xxx.xxx # Public net IP
        Port 6000
```

## 常见问题

### ssh private key are too open

The error message is 

```bash
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@ WARNING: UNPROTECTED PRIVATE KEY FILE! @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
Permissions 0644 for '/home/me/.ssh/id_rsa_targethost' are too open.
It is recommended that your private key files are NOT accessible by others.
This private key will be ignored.
bad permissions: ignore key: /home/me/.ssh/id_rsa_targethost
```

This arises from the permission of your private key:`id_rsa` file.

Use command `ls -l` to see your `id_rsa` permission. if it is not `-rw-------`, you should change it to that! Use the following command: 

```bash
chmod 600 ~/.ssh/id_rsa
```

### No xauth data; using fake authentication data for X11 forwarding.

The error message is

```bash
Warning: No xauth data; using fake authentication data for X11 forwarding.
```

This is because `ssh` can't find your xauth location. Usually, the location is in `/opt/X11/bin/xauth`. Add this in your ssh configure file:

```bash
Host *
    XAuthLocation /opt/X11/bin/xauth
```

### Remote host identification has changed!

When the remote host was **just repaired**, the error like below might be raised.

```bash
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
IT IS POSSIBLE THAT SOMEONE IS DOING SOMETHING NASTY!
Someone could be eavesdropping on you right now (man-in-the-middle attack)!
It is also possible that a host key has just been changed.
The fingerprint for the RSA key sent by the remote host is
51:82:00:1c:7e:6f:ac:ac:de:f1:53:08:1c:7d:55:68.
Please contact your system administrator.
Add correct host key in /Users/isaacalves/.ssh/known_hosts to get rid of this message.
Offending RSA key in /Users/isaacalves/.ssh/known_hosts:12
RSA host key for 104.131.16.158 has changed and you have requested strict checking.
Host key verification failed.
```

Take it easy, and just edit your `/Users/isaacalves/.ssh/known_hosts` file to remove the line with the IP address of the very remote host. For some users such as Ubuntu or Debian users, `ssh -R xxx` might be necessary, which would be shown in the error info.

However, if not any repair or upgrade happened, **man-in-the-middle attack** might happen. Just stop logging in and contact manager of cluster at once to make sure.

