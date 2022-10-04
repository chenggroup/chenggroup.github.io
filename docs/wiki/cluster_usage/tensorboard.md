---
Title: 集群TensorBoard使用指南
Authors: 朱嘉欣
comments: true
---

# 集群 TensorBoard 使用指南

## 需求

基于 DeepMD-kit 或者 TensorFlow 的代码调试及训练数据实时监控。

[TensorBoard 是什么](https://github.com/tensorflow/tensorboard)

[DeepMD-kit 官方教程](https://docs.deepmodeling.com/projects/deepmd/en/master/train/tensorboard.html)

## 用法

DP 官方教程给出了在本地运行程序时的可视化，如果在服务器上运行，我们需要进行端口转发。

### 在计算节点上运行程序（推荐）

> 以在 gpu3 队列运行 DeepMD-kit 训练程序为例，其他程序可对应替换。

1. 通过 lsf 脚本提交程序到计算节点
   ```shell
   #!/bin/bash
   #BSUB -q gpu3
   #BSUB -W 24:00
   #BSUB -J type_map_0
   #BSUB -o %J.stdout
   #BSUB -e %J.stderr
   #BSUB -n 4
   #BSUB -gpu "num=1:mode=shared:mps=no:j_exclusive=yes"
   #BSUB -R "span[ptile=32]"

   # add modulefiles
   module add deepmd/2.0-cuda11.3

   dp train input.json 1>> train.log 2>> train.err &
   tensorboard --logdir=log --port=6006
   ```
   如果想要实时查看训练过程中的数据，训练指令和 tensorboard 的运行指令需要同时运 行，故采用 `&`将训练指令挂起。
   > `--logdir`指定 tensorboard 的 event 文件所在路径（在 json 文件中指定）。
   >
   > `--port`指定 tensorboard 在服务器上运行的端口号（缺省默认为 6006）。
2. 查看计算节点 ip 地址
   做法类似[jupyter notebook 教程](./jupyter.md)，在登录节点命令行输入下面指令（将 `c51-m002`替换为实际运行的节点）。
   ```shell
   cat /etc/hosts | grep c51-m002
   ```
3. 将端口转发到本地
   ```shell
   ssh -NfL localhost:<local_port>:<remote_ip>:<port> <username>@<ip_of_cluster>
   ```

### 在登录节点上运行程序

!!! warning
    仅供短时间测试！长时间运行请使用计算节点!!

在命令行中运行训练和 tensorboard 程序后，在本地执行

```shell
ssh -NfL <local_port>:localhost:<port> <username>@<ip_of_cluster>
```
