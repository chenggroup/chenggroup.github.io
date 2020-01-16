---
title: 使用集群上的 gpu
---

# 使用集群上的 gpu

## 提交任务至 gpu

在 `210.34.15.205` 上，需要通过指定 `CUDA_VISIBLE_DEVICES` 来对任务进行管理。

```bash
#!/bin/bash

#BSUB -q large
#BSUB -W 24:00
#BSUB -J test
#BSUB -o %J.stdout
#BSUB -e %J.stderr
#BSUB -n 4

```

> lsf 提交脚本中需要包含 `export CUDA_VISIBLE_DEVICES=X` ，其中 `X` 数值需要根据具体节点的卡的使用情况确定。

使用者可以用 `ssh <host> nvidia-smi` 登陆到对应节点（节点名为 `<host>`）检查gpu使用情况。
输出示例如下：

```
$ ssh g001 nvidia-smi
Thu Jan 16 10:05:48 2020
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 410.48                 Driver Version: 410.48                    |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|===============================+======================+======================|
|   0  GeForce RTX 208...  Off  | 00000000:1A:00.0 Off |                  N/A |
| 16%   26C    P8    21W / 250W |     10MiB / 10989MiB |      0%      Default |
+-------------------------------+----------------------+----------------------+
|   1  GeForce RTX 208...  Off  | 00000000:1B:00.0 Off |                  N/A |
| 16%   27C    P8    21W / 250W |     10MiB / 10989MiB |      0%      Default |
+-------------------------------+----------------------+----------------------+
|   2  GeForce RTX 208...  Off  | 00000000:3D:00.0 Off |                  N/A |
| 16%   24C    P8     2W / 250W |     10MiB / 10989MiB |      0%      Default |
+-------------------------------+----------------------+----------------------+
|   3  GeForce RTX 208...  Off  | 00000000:3E:00.0 Off |                  N/A |
| 16%   26C    P8     1W / 250W |     10MiB / 10989MiB |      0%      Default |
+-------------------------------+----------------------+----------------------+
|   4  GeForce RTX 208...  Off  | 00000000:88:00.0 Off |                  N/A |
| 16%   23C    P8    16W / 250W |     10MiB / 10989MiB |      0%      Default |
+-------------------------------+----------------------+----------------------+
|   5  GeForce RTX 208...  Off  | 00000000:89:00.0 Off |                  N/A |
| 33%   55C    P2   130W / 250W |    621MiB / 10989MiB |     62%      Default |
+-------------------------------+----------------------+----------------------+
|   6  GeForce RTX 208...  Off  | 00000000:B1:00.0 Off |                  N/A |
| 16%   26C    P8    20W / 250W |     10MiB / 10989MiB |      0%      Default |
+-------------------------------+----------------------+----------------------+
|   7  GeForce RTX 208...  Off  | 00000000:B2:00.0 Off |                  N/A |
| 17%   25C    P8    19W / 250W |     10MiB / 10989MiB |      0%      Default |
+-------------------------------+----------------------+----------------------+

+-----------------------------------------------------------------------------+
| Processes:                                                       GPU Memory |
|  GPU       PID   Type   Process name                             Usage      |
|=============================================================================|
|    5    205527      C   lmp                                          611MiB |
+-----------------------------------------------------------------------------+
```
表示目前该节点（ `g001` ）上5号卡正在被进程号为205527的进程 `lmp` 使用，占用显存为611 MB，gpu使用率为62%。


在 `210.34.15.205` 使用 deepmd 的提交脚本示例如下（目前 `large` 队列未对用户最大提交任务数设限制，Walltime 也无时间限制）：

```bash
#!/bin/bash

#BSUB -q large
#BSUB -J train
#BSUB -o %J.stdout
#BSUB -e %J.stderr
#BSUB -n 1
#BSUB -R "select[ngpus>0] rusage[ngpus_excl_p=1]"

module add cuda/9.2
module add deepmd/1.0
export CUDA_VISIBLE_DEVICES=0
# decided by the specific usage of gpus
dp train input.json > train.log
```

也可以使用检测脚本`/share/base/scripts/export_visible_devices`来确定 `$CUDA_VISIBLE_DEVICES` 的值，示例如下：

```bash
#!/bin/bash

#BSUB -q large
#BSUB -J train
#BSUB -o %J.stdout
#BSUB -e %J.stderr
#BSUB -n 1
#BSUB -R "select[ngpus>0] rusage[ngpus_excl_p=1]"

module add cuda/9.2
module add deepmd/1.0
source /share/base/scripts/export_visible_devices

dp train input.json > train.log
```