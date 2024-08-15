---
Title: Open Ondemand 使用说明
Authors: Weihong Xu
comments: true
---

# Open Ondemand 使用说明

## 介绍
为方便在HPC集群上执行一些交互类应用，我们在 ChengLab HPC 集群的 mgt02 节点部署了一个 Open Ondemand (OOD) 实例，该实例包含一个Jupyter应用入口，未来可根据需要部署更多应用。使用该服务可参考以下步骤。

## 前置准备
### 设置用户密码
由于 OOD 使用 PAM 认证，因此需要为登录用户设置相应的密码
步骤：
* 登录到 mgt02 节点
* 执行 `passwd` 设置用户密码，如密码未知可找管理员重置
* 执行 `pamtester sshd $(whoami) authenticate` 测试密码是否生效，如遇问题请等待1分钟后重试，遇问题可找管理员处理

### 设置ssh转发配置
该 OOD 部署于 mgt02 80端口, 访问需通过 ssh 转发。由于应用限制，本地转发端口必需设置为 8086。参考命令如下
```bash
ssh -v -N -L 8086:localhost:80 cheng-hpc
```
由于 mgt02 节点位于跳板机后，为便于访问可在个人电脑的 `~/.ssh/config` 中配置以下内容, 注意替换 YOUR_NAME 为自己的登录名。
```
Host cheng-hpc
    Hostname 172.27.127.191
    User YOUR_NAME
    Port 6666
    ProxyJump YOUR_NAME@10.24.3.151
```

## 使用
在确保ssh转发正常工作后，在浏览器访问 http://localhost:8086 即可使用该服务。

### Jupyter
为正常使用Jupyter, 需要在集群中通过conda进行安装，如果已有可忽略。具体步骤如下
* 登录 `login01` or `mgt02`
* `module load miniconda/3` 
* `source activate <env> && pip install jupyterlab` # 如果使用 `<env>` 环境可使用此语句加载并安装
* `conda create -n <env> python=3.9 jupyterlab` # 创建一个名为 jupyter 的新环境并安装 Jupyter lab（以上操作二选一）
* `source activate <env>` # 载入刚刚安装的环境
* `pip install nbconvert==6.4.3` # workaound 一个bug... 未来或可不用

通过界面上的 Interactive Apps => Jupyter 即可打开启动界面。里面多数选项可保持默认，唯一需要填写的是 Jupyter所在的conda环境（默认为base, 如Jupyter位于其它环境请选择其它文件名），以及用户名（填写登录用户名即可）。

提交作业后会进入Session界面，在该界面可以看到提交作业的状态。当启动完毕后会出现connect to jupyter，点击即可使用。

### 转化 Jupyter Notebook 为 Python 脚本

```bash
ipython nbconvert --to python *.ipynb
```
