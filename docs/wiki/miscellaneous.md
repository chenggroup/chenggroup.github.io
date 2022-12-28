---
Authors:
  - Yongbin Zhuang
  - Yunpei Liu
  - Jingfang Xiong
title: 杂项（Miscellaneous）
comments: true

---

# Miscellaneous

**Put temporary or unclassied content here!**

## Run Process when you logout shell

Everytime you login the cluster, you want to run some commands while you have to logout the shell. Unfortunately, these commands will stop as soon as you logout. How to keep commands run? The trick here is use command `nohup` and `&`.

 ``` bash
nohup command &
 ```

You just need to prepend `nohup` and append `&` in your commands.Now, you can go back and have a nice sleep.


## 删除 linux 下的符号链接（快捷方式）

Linux 系统下的符号链接，又称软链接，基本类似于 Windows 系统下的快捷方式。如果你已经接触过`deepmd`，你应该已经对见到过一些符号链接了。需要注意的一点是，符号链接本质上是一个**独立的文本文件**，操作系统会将其解释为另一个文件或者路径（文件夹）。因此符号链接有如下两个性质：

* 删除符号链接文件并不会影响原本的文件/路径（文件夹）

* 删除原始文件/路径后，符号链接仍然存在，但是链接会损坏，成为 “stale symbolic link”（字面意思）。 

在整理工作文件夹的时候，我们可能会需要删除符号链接，我们尤其需要注意路径符号链接的删除：

一个`dp-gen`的训练路径结构如下：

```shell
00.train/
├── 000
├── 001
├── 002
├── 003
├── data.init -> /data/rhbi/TiO2-ML/00.cp2k_md
├── data.iters
├── graph.000.pb -> 000/frozen_model.pb
├── graph.001.pb -> 001/frozen_model.pb
├── graph.002.pb -> 002/frozen_model.pb
├── graph.003.pb -> 003/frozen_model.pb
└── jr.json
```

假设你想要删除和文件关联的软链接‘graph.000.pb’，输入 `rm graph.000.pb`，没有任何问题，你成功删除了这个文件。然而如果你想删除和一个文件夹相关的链接，data.init，你可能会不假思索地输入

```bash
rm data.init/
```

这时候你会收到报错：

```bash
rm: cannot remove ‘data.init/’: Is a directory
```

再次强调，符号链接本质上是一个**独立的文本文件**。收到报错是因为`shell`的自动全功能把‘data.init’识别为了一个路径，因此在最后加入了斜杠‘/’，然而符号链接只是一个文本文件，这个时候系统认为不能用`rm`命令删掉一个路径，所以报错。正确的解决方法是去掉斜杠，输入正确的命令成功删除链接：

```bash
rm data.init
```

当然shell的自动补全和你使用的 shell 版本有关，有可能你的 shell 不会犯蠢直接加上‘/’，但是在删除链接的时候你需要额外注意，避免你的数据损失。

!!! danger "danger"
    千万不要运行 'rm -rf data.init/*' ，你会删除掉原路径下的所有文件！！！'

## 集群使用出错：/bin/sh^M: bad interpreter: No such file or directory

### 错误情况

/bin/sh^M: bad interpreter: No such file or directory

在集群上使用bsub提交作业后正常显示：

```
Job <1360> is submitted to queue <53-large>
```

但是用bjobs查看不到这个作业，（可能先显示在排队PEND）显示No unfinished job found，这个时候使用ls命令会看见提交的.lsf作业的目录下会生成输出和报错文件：1360.stdout，1360.stderr，这说明作业已经运行结束（异常结束）。

### 错误原因

使用vim命令查看.stdout和.stderr这两个文件，会发现在作业的换行处出现很多^M符号，查询原因是windows的文件上传到linux系统时文件格式可能不一致

### 错误处理

方法一：参考[linux下运行脚本报读取或^M错误处理 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/475980403)

方法二：用vim命令在集群上新建一个作业，然后把作业内容复制上去，再bsub提交作业即可

## LSF 作业管理系统（新版，作为归档）

目前 LSF Suite 10.2 已在 Zeus 上部署测试，该版本包含了新版的 LSF 作业管理系统，因而可对 GPU 提供支持。

输入 `lsload -gpu` 即可查看集群当前可以使用的 GPU 数目：

```
HOST_NAME       status  ngpus  gpu_shared_avg_mut  gpu_shared_avg_ut  ngpus_physical
c51-g001            ok      4                  1%                 6%               4
c51-g002            ok      4                  0%                 6%               4
c51-m002            ok      8                  9%                68%               8
c51-m004            ok      8                 12%                89%               8
c51-m003            ok      8                  9%                72%               8
c51-m001            ok      8                 15%                72%               8
```

输入 `lsload -gpuload` 则可以对 GPU 负载情况进行统计：

```
HOST_NAME       gpuid   gpu_model   gpu_mode  gpu_temp   gpu_ecc  gpu_ut  gpu_mut gpu_mtotal gpu_mused   gpu_pstate   gpu_status   gpu_error
c51-g001            0 TeslaV100_S        0.0       48C       0.0     26%       7%      31.7G      1.1G            0           ok           -
                    1 TeslaV100_S        0.0       38C       0.0      0%       0%      31.7G        0M            0           ok           -
                    2 TeslaV100_S        0.0       36C       0.0      0%       0%      31.7G        0M            0           ok           -
                    3 TeslaV100_S        0.0       37C       0.0      0%       0%      31.7G        0M            0           ok           -
c51-g002            0 A10080GBPCI        0.0       44C       0.0      8%       0%      79.3G     1020M            0           ok           -
                    1 A10080GBPCI        0.0       49C       0.0      8%       0%      79.3G     1020M            0           ok           -
                    2 A10080GBPCI        0.0       47C       0.0      8%       0%      79.3G     1020M            0           ok           -
                    3 A10080GBPCI        0.0       44C       0.0      0%       0%      79.3G      434M            0           ok           -
c51-m004            0 NVIDIAGeFor        0.0       64C       0.0     91%      13%      10.7G      1.5G            2           ok           -
                    1 NVIDIAGeFor        0.0       65C       0.0     89%      13%      10.7G      1.5G            2           ok           -
                    2 NVIDIAGeFor        0.0       60C       0.0     88%      12%      10.7G      1.5G            2           ok           -
                    3 NVIDIAGeFor        0.0       66C       0.0     89%      13%      10.7G      1.5G            2           ok           -
                    4 NVIDIAGeFor        0.0       69C       0.0     87%      13%      10.7G      1.5G            2           ok           -
                    5 NVIDIAGeFor        0.0       70C       0.0     91%      13%      10.7G      1.5G            2           ok           -
                    6 NVIDIAGeFor        0.0       65C       0.0     85%      12%      10.7G      1.5G            2           ok           -
                    7 NVIDIAGeFor        0.0       64C       0.0     87%      12%      10.7G      1.5G            2           ok           -
c51-m002            0 NVIDIAGeFor        0.0       58C       0.0     92%      14%      10.7G      1.5G            2           ok           -
                    1 NVIDIAGeFor        0.0       65C       0.0     86%      13%      10.7G      2.5G            2           ok           -
                    2 NVIDIAGeFor        0.0       56C       0.0     86%      13%      10.7G      2.5G            2           ok           -
                    3 NVIDIAGeFor        0.0       55C       0.0     63%       8%      10.7G      768M            2           ok           -
                    4 NVIDIAGeFor        0.0       51C       0.0     63%       8%      10.7G      768M            2           ok           -
                    5 NVIDIAGeFor        0.0       52C       0.0     68%       9%      10.7G      768M            2           ok           -
                    6 NVIDIAGeFor        0.0       54C       0.0     66%       8%      10.7G      768M            2           ok           -
                    7 NVIDIAGeFor        0.0       52C       0.0     39%       2%      10.7G      1.5G            2           ok           -
c51-m003            0 NVIDIAGeFor        0.0       55C       0.0     62%       8%      10.7G      768M            2           ok           -
                    1 NVIDIAGeFor        0.0       53C       0.0     64%       8%      10.7G      768M            2           ok           -
                    2 NVIDIAGeFor        0.0       51C       0.0     64%       8%      10.7G      768M            2           ok           -
                    3 NVIDIAGeFor        0.0       55C       0.0     62%       8%      10.7G      768M            2           ok           -
                    4 NVIDIAGeFor        0.0       55C       0.0     79%      10%      10.7G      768M            2           ok           -
                    5 NVIDIAGeFor        0.0       57C       0.0     79%      10%      10.7G      768M            2           ok           -
                    6 NVIDIAGeFor        0.0       54C       0.0     80%      10%      10.7G      768M            2           ok           -
                    7 NVIDIAGeFor        0.0       55C       0.0     80%      10%      10.7G      768M            2           ok           -
c51-m001            0 NVIDIAGeFor        0.0       62C       0.0     98%      21%      10.7G      1.7G            2           ok           -
                    1 NVIDIAGeFor        0.0       64C       0.0     98%      22%      10.7G      1.7G            2           ok           -
                    2 NVIDIAGeFor        0.0       58C       0.0     97%      21%      10.7G      1.7G            2           ok           -
                    3 NVIDIAGeFor        0.0       66C       0.0     93%      19%      10.7G      894M            2           ok           -
                    4 NVIDIAGeFor        0.0       69C       0.0     98%      21%      10.7G      1.7G            2           ok           -
                    5 NVIDIAGeFor        0.0       62C       0.0     98%      21%      10.7G      1.7G            2           ok           -
                    6 NVIDIAGeFor        0.0       25C       0.0      0%       0%      10.7G        0M            8           ok           -
                    7 NVIDIAGeFor        0.0       35C       0.0      0%       0%      10.7G        0M            8           ok           -
```

使用 GPU 资源时，需要对提交脚本进行相应修改，用 `-gpu` 命令申请 GPU 资源。

```bash
#!/bin/bash

#BSUB -q gpu
#BSUB -W 24:00
#BSUB -J train
#BSUB -o %J.stdout
#BSUB -e %J.stderr
#BSUB -gpu "num=1:mode=shared:mps=no:j_exclusive=no"
#BSUB -n 4
#BSUB -R "span[ptile=32]"

module add deepmd/2.0b1
lmp_mpi -i input.lammps 1>> model_devi.log 2>> model_devi.log
```

其中 `num=1` 表示申请1张GPU卡，`j_exclusive=no` 表示允许和其他任务共存，`-n` 表示申请的CPU核数。
使用V100时，请设置为不超过8的整数；
使用A100时，请设置为不超过8的整数，若为开启MIG的情况，请参考[A100拆分实例使用说明](./mig_usage.md)；
使用2080Ti时，请设置为不超过4的整数，否则均可能会出现资源空闲但无法使用的情况。如希望独占一张卡请使用`j_exclusive=yes`。

!!! tip "链接"
    使用新版 LSF 提交任务，不需要引入检测脚本或<code>CUDA_VISIBLE_DEVICES</code>控制使用的GPU。

### A100特殊注意事项

请参考[A100拆分实例使用说明](./mig_usage.md)。

### 绑定CPU

对某些作业类型（如VASP），当使用GPU时，会希望CPU进程尽可能独立运行在所分配的核上，此时可通过设置 CPU 亲和性来控制所用的核数。示例如下：

```bash
#!/bin/bash
#
#BSUB -q gpu
#BSUB -W 12:00
#BSUB -J vasp
#BSUB -o vasp.%J.stdout
#BSUB -e vasp.%J.stderr
#BSUB -n 8
#BSUB -R "span[ptile=32]"
#BSUB -gpu "num=1:mode=shared:mps=no:j_exclusive=no"
#BSUB -R "affinity[core(1,exclusive=(core,alljobs))]"

# add modulefiles
module load vasp/6.1.0-openacc
mpirun -np 1 vasp_gam
```

其中，`core(1,exclusive=(core,alljobs))` 表示使用1个核且与其他作业不同。注意这里需要根据实际使用的核数指定，因为作业中`mpirun -np`的参数是1。

### DP-GEN Slurm 系统提交方法

以训练步骤为例：

```json
{
  "train": [
    {
      "machine": {
        "machine_type": "slurm",
        "hostname": "xx.xxx.xxx.xxx",
        "port": 22,
        "username": "chenglab",
        "work_path": "/home/chenglab/ypliu/dprun/train"
      },
      "resources": {
        "numb_gpu": 1,
        "numb_node": 1,
        "task_per_node": 2,
        "partition": "gpu",
        "exclude_list": [],
        "source_list": [],
        "module_list": [
            "deepmd/1.2"
        ],
        "time_limit": "96:0:0",
        "sleep": 20
      },
      "python_path": "/share/apps/deepmd/1.2/bin/python3.6"
    }
  ],
  ...
}
```

若提交任务使用QoS设置，则可以在`resources`中增加`qos`项目，示例如下：

```json
{
  "train": [
    {
      "machine": {
        "machine_type": "slurm",
        "hostname": "xx.xxx.xxx.xxx",
        "port": 22,
        "username": "chenglab",
        "work_path": "/home/chenglab/ypliu/dprun/train"
      },
      "resources": {
        "numb_gpu": 1,
        "numb_node": 1,
        "task_per_node": 2,
        "partition": "gpu",
        "exclude_list": [],
        "source_list": [],
        "module_list": [
            "deepmd/1.2"
        ],
        "time_limit": "96:0:0",
        "qos": "normal",
        "sleep": 20
      },
      "python_path": "/share/apps/deepmd/1.2/bin/python3.6"
    }
  ],
  ...
}
```

## LSF 作业管理系统（旧版）

> 目前旧版 LSF 系统（10.1.0.0）已不再适用，此部分仅作归档，不再更新，还请留意。
> 新版说明请移步[]()。

在GPU节点上，需要通过指定 `CUDA_VISIBLE_DEVICES` 来对任务进行管理。

```bash
#!/bin/bash

#BSUB -q gpu
#BSUB -W 24:00
#BSUB -J test
#BSUB -o %J.stdout
#BSUB -e %J.stderr
#BSUB -n 4

```

> lsf 提交脚本中需要包含 `export CUDA_VISIBLE_DEVICES=X` ，其中 `X` 数值需要根据具体节点的卡的使用情况确定。

使用者可以用 `ssh <host> nvidia-smi` 登陆到对应节点（节点名为 `<host>`）检查 GPU 使用情况。
示例如下：

```bash
$ ssh c51-g001 nvidia-smi
Wed Mar 10 12:59:01 2021
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 460.32.03    Driver Version: 460.32.03    CUDA Version: 11.2     |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|                               |                      |               MIG M. |
|===============================+======================+======================|
|   0  Tesla V100-SXM2...  Off  | 00000000:61:00.0 Off |                    0 |
| N/A   42C    P0    42W / 300W |      3MiB / 32510MiB |      0%      Default |
|                               |                      |                  N/A |
+-------------------------------+----------------------+----------------------+
|   1  Tesla V100-SXM2...  Off  | 00000000:62:00.0 Off |                    0 |
| N/A   43C    P0    44W / 300W |  31530MiB / 32510MiB |     62%      Default |
|                               |                      |                  N/A |
+-------------------------------+----------------------+----------------------+
|   2  Tesla V100-SXM2...  Off  | 00000000:89:00.0 Off |                    0 |
| N/A   43C    P0    45W / 300W |      3MiB / 32510MiB |      0%      Default |
|                               |                      |                  N/A |
+-------------------------------+----------------------+----------------------+
|   3  Tesla V100-SXM2...  Off  | 00000000:8A:00.0 Off |                    0 |
| N/A   43C    P0    47W / 300W |      3MiB / 32510MiB |      0%      Default |
|                               |                      |                  N/A |
+-------------------------------+----------------------+----------------------+

+-----------------------------------------------------------------------------+
| Processes:                                                                  |
|  GPU   GI   CI        PID   Type   Process name                  GPU Memory |
|        ID   ID                                                   Usage      |
|=============================================================================|
|    1   N/A  N/A    127004      C   ...pps/deepmd/1.2/bin/python    31527MiB |
+-----------------------------------------------------------------------------+
```
表示目前该节点（`c51-g001` ）上 1 号卡正在被进程号为 127004 的进程 `...pps/deepmd/1.2/bin/python` 使用，占用显存为 31527 MB，GPU 利用率为 62%。


在 Zeus 集群使用 deepmd 的提交脚本示例如下（目前 `large` 队列未对用户最大提交任务数设限制，Walltime 也无时间限制）：

```bash
#!/bin/bash

#BSUB -q large
#BSUB -J train
#BSUB -o %J.stdout
#BSUB -e %J.stderr
#BSUB -n 4

module add cuda/9.2
module add deepmd/1.0
export CUDA_VISIBLE_DEVICES=0
# decided by the specific usage of gpus
dp train input.json > train.log
```

### 检测脚本

Zeus 集群上预置了两个检测脚本，针对不同需要对卡的使用进行划分。

可以使用检测脚本`/share/base/tools/export_visible_devices`来确定 `$CUDA_VISIBLE_DEVICES` 的值，示例如下：

```bash
#!/bin/bash

#BSUB -q gpu
#BSUB -J train
#BSUB -o %J.stdout
#BSUB -e %J.stderr
#BSUB -n 4

module add cuda/9.2
module add deepmd/1.0
source /share/base/scripts/export_visible_devices

dp train input.json > train.log
```

`/share/base/tools/export_visible_devices` 可以使用flag `-t mem` 控制显存识别下限，即使用显存若不超过 `mem` 的数值，则认为该卡未被使用。根据实际使用情况和经验，默认100 MB以下视为空卡，即可以向该卡提交任务。

也可以使用检测脚本`/share/base/tools/avail_gpu.sh`来确定 `$CUDA_VISIBLE_DEVICES` 的值。`/share/base/tools/avail_gpu.sh` 可以使用flag `-t util` 控制显卡利用率可用上限，即使用显卡利用率若超过 `util` 的数值，则认为该卡被使用。目前脚本默认显卡利用率低于5%视为空卡，即可以向该卡提交任务。

### 任务优先级设置（QoS）（不可用）

默认情况下提交的任务Qos设置为normal，即填充在整个队列的末尾。如果任务比较紧急，可以向管理员报备申请使用emergency优先级，采用此优先级的任务默认排在队列顶。

使用方法如下，即在提交脚本中加入下行：

```bash
#SBATCH --qos emergency
```

### DP-GEN

以训练步骤为例：

```json
{
  "train": [
    {
      "machine": {
        "machine_type": "lsf",
        "hostname": "xx.xxx.xxx.xxx",
        "port": 22,
        "username": "username",
        "password": "password",
        "work_path": "/some/remote/path"
      },
      "resources": {
        "node_cpu": 4,
        "numb_node": 1,
        "task_per_node": 4,
        "partition": "large",
        "exclude_list": [],
        "source_list": [
            "/share/base/scripts/export_visible_devices -t 100"
        ],
        "module_list": [
            "cuda/9.2",
            "deepmd/1.0"
                ],
        "time_limit": "96:0:0",
        "submit_wait_time": 20
      },
      "python_path": "/share/deepmd-1.0/bin/python3.6"
    }
  ],
  ......
}
```

### DP-GEN v1.0 API

!!! danger "注意"
    <p><code>train</code> 部分使用了对新版 LSF 提供支持的写法，即同时指定 <code>gpu_usage</code> 和 <code>gpu_new_syntax</code> 为 <code>True</code>，从而可在提交脚本中使用新版 LSF 的语法。</p><p><code>model_devi</code>部分使用的是旧版语法，且未指定GPU，但导入了检测脚本。</p><p><code>fp</code> 部分使用的是针对CPU计算使用的语法。注意 <code>mpiexec.hydra</code> 需要写出。</p>

```json
{
  "api_version": "1.0",
  "train": [
    {
      "command": "dp",
      "machine": {
        "batch_type": "LSF",
        "context_type": "SSHContext",
        "local_root": "./",
        "remote_root": "/data/tom/dprun/train",
        "remote_profile": {
            "hostname": "123.45.67.89",
            "username": "tom"
        }
      },
      "resources": {
        "number_node": 1,
        "cpu_per_node": 4,
        "gpu_per_node": 1,
        "queue_name": "gpu",
        "group_size": 1,
        "kwargs": {
          "gpu_usage": true,
          "gpu_new_syntax": true, 
          "gpu_exclusive": true
        },
        "custom_flags": [
          "#BSUB -J train",
          "#BSUB -W 24:00"
        ],
        "module_list": [
          "deepmd/2.0"
        ]
      }
    }
  ],
  "model_devi":[
    {
      "command": "lmp_mpi",
      "machine":{
        "batch_type": "LSF",
        "context_type": "SSHContext",
        "local_root": "./",
        "remote_root": "/data/jerry/dprun/md",
        "remote_profile": {
          "hostname": "198.76.54.32",
          "username": "jerry",
          "port": 6666
        }
      },
      "resources": {
        "number_node": 1,
        "cpu_per_node": 8,
        "gpu_per_node": 0,
        "queue_name": "gpu",
        "group_size": 5,
        "kwargs": {
          "gpu_usage": false
        },
        "custom_flags": [
          "#BSUB -J md",
          "#BSUB -W 24:00"
        ],
        "strategy": {"if_cuda_multi_devices": false},
        "para_deg": 2,
        "module_list": [
          "deepmd/2.0"
        ],
        "source_list": [
          "/share/base/tools/avail_gpu.sh"
        ]
      }
    }
  ],
  "fp":[
    {
      "command": "mpiexec.hydra -genvall vasp_gam",
      "machine":{
        "batch_type": "LSF",
        "context_type": "SSHContext",
        "local_root": "./",
        "remote_root": "/data/jerry/dprun/fp",
        "remote_profile": {
          "hostname": "198.76.54.32",
          "username": "jerry",
          "port": 6666
        }
      },
      "resources": {
        "number_node": 2,
        "cpu_per_node": 32,
        "gpu_per_node": 0,
        "kwargs": {
          "gpu_usage": false
        },
        "custom_flags": [
          "#BSUB -J label",
          "#BSUB -W 12:00"
        ],
        "queue_name": "medium",
        "group_size": 10,
        "module_list": [
          "intel/17.5.239",
          "mpi/intel/2017.5.239",
          "vasp/5.4.4"
        ]
      }
    }
  ]
}
```

# Scrum Group 

## 简单介绍

* scrum meeting 即每日例会，在橄榄球运动中 a scrum 意思为一场比赛，scrum meeting 旨在通过每日例会的形式来总结最近所做的工作，进行讨论和反思并对未来短期内的工作进行规划和展望。

## 基本规则

* 所有的学生根据所研究方向分为若干小组，每个小组由各自的 scrum master 管理，并由 scrum master 带领进行每周的汇报。
* scrum meeting 每周进行两次，进行时间根据具体情况而定。
* 所有的研究生和本科四年级学生除非有要事均需参加scrum meeting，如果有事不能参加的需向所在组的 scrum master 进行请假和汇报。
* 如果当天老师繁忙，各个小组应该自行组织 scrum meeting。

## 例会内容

* 汇报从上次 scrum meeting 到目前为止所做的工作内容，包括遇到的问题、新的发现或者存在的疑问等。

## 参考文件

* 请参考以下文件（待更新）
* https://www.scrumguides.org/scrum-guide.html

 