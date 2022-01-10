---
title: 使用集群上的 GPU
priority: 1.03
---

# 使用集群上的 GPU

## GPU 队列概况

目前课题组GPU有两个集群：

- Metal 集群（205）：包含 4 个节点（`mgt g001 g002 g003`），每个节点上有 8 张 2080 Ti。`mgt` 作为计算节点的同时作为管理节点。
- Zeus 集群（191）：包含 1 个节点（`c51-g001`），节点上有 4 张 Tesla V100。

两个节点均可联系管理员开通使用权限。

## 提交任务至 GPU

### LSF 作业管理系统（旧版）

目前旧版 LSF 系统（10.1.0.0）在 Zeus 集群上使用。

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

#### 检测脚本

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

#### 绑定CPU

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
#BSUB -R "affinity[core(1,exclusive=(core,alljobs))]"

# add modulefiles
module load vasp/6.1.0-openacc
mpirun -np 1 vasp_gam
```

其中，`core(1,exclusive=(core,alljobs))` 表示使用1个核且与其他作业不同。注意这里需要根据实际使用的核数指定，因为作业中`mpirun -np`的参数是1。

新版、旧版LSF均可支持此设置。

### LSF 作业管理系统（新版）

目前 LSF Suite 10.2 已在 Metal 上部署测试，该版本包含了新版的 LSF 作业管理系统，因而可对 GPU 提供支持。

输入 `lsload -gpu` 即可查看集群当前可以使用的 GPU 数目：

```
HOST_NAME       status  ngpus  gpu_shared_avg_mut  gpu_shared_avg_ut  ngpus_physical
g001                ok      8                 13%                70%               8
g003                ok      8                  9%                60%               8
mgt                 ok      8                 14%                82%               8
g002                ok      8                 10%                56%               8
```

输入 `lsload -gpuload` 则可以对 GPU 负载情况进行统计：

```
HOST_NAME       gpuid   gpu_model   gpu_mode  gpu_temp   gpu_ecc  gpu_ut  gpu_mut gpu_mtotal gpu_mused   gpu_pstate   gpu_status   gpu_error
g001                0 GeForceRTX2        0.0       55C       0.0     36%       7%      10.7G      542M            2           ok           -
                    1 GeForceRTX2        0.0       55C       0.0     36%       7%      10.7G      542M            2           ok           -
                    2 GeForceRTX2        0.0       51C       0.0     36%       7%      10.7G      542M            2           ok           -
                    3 GeForceRTX2        0.0       70C       0.0     98%      24%      10.7G      1.3G            2           ok           -
                    4 GeForceRTX2        0.0       69C       0.0     86%      12%      10.7G      1.3G            2           ok           -
                    5 GeForceRTX2        0.0       57C       0.0     81%       9%      10.7G     10.1G            2           ok           -
                    6 GeForceRTX2        0.0       61C       0.0     98%      25%      10.7G      1.3G            2           ok           -
                    7 GeForceRTX2        0.0       68C       0.0     91%      19%      10.7G      878M            2           ok           -
mgt                 0 GeForceRTX2        0.0       62C       0.0     76%      10%      10.7G      1.3G            2           ok           -
                    1 GeForceRTX2        0.0       69C       0.0     76%      10%      10.7G      1.3G            2           ok           -
                    2 GeForceRTX2        0.0       58C       0.0     78%      10%      10.7G      1.3G            2           ok           -
                    3 GeForceRTX2        0.0       65C       0.0     78%      11%      10.7G      1.3G            2           ok           -
                    4 GeForceRTX2        0.0       64C       0.0     86%      17%      10.7G      878M            2           ok           -
                    5 GeForceRTX2        0.0       63C       0.0     86%      18%      10.7G      878M            2           ok           -
                    6 GeForceRTX2        0.0       65C       0.0     85%      18%      10.7G      878M            2           ok           -
                    7 GeForceRTX2        0.0       69C       0.0     84%      18%      10.7G      878M            2           ok           -
g003                0 GeForceRTX2        0.0       65C       0.0     76%       8%      10.7G     10.1G            2           ok           -
                    1 GeForceRTX2        0.0       64C       0.0     83%       9%      10.7G     10.1G            2           ok           -
                    2 GeForceRTX2        0.0       55C       0.0     36%       7%      10.7G      542M            2           ok           -
                    3 GeForceRTX2        0.0       58C       0.0     36%       7%      10.7G      542M            2           ok           -
                    4 GeForceRTX2        0.0       54C       0.0     36%       7%      10.7G      542M            2           ok           -
                    5 GeForceRTX2        0.0       71C       0.0     86%      12%      10.7G      1.3G            2           ok           -
                    6 GeForceRTX2        0.0       56C       0.0     36%       7%      10.7G      542M            2           ok           -
                    7 GeForceRTX2        0.0       66C       0.0     91%      19%      10.7G      878M            2           ok           -
g002                0 GeForceRTX2        0.0       52C       0.0     37%       7%      10.7G      542M            2           ok           -
                    1 GeForceRTX2        0.0       57C       0.0     37%       7%      10.7G      542M            2           ok           -
                    2 GeForceRTX2        0.0       54C       0.0     37%       7%      10.7G      542M            2           ok           -
                    3 GeForceRTX2        0.0       58C       0.0     37%       7%      10.7G      542M            2           ok           -
                    4 GeForceRTX2        0.0       54C       0.0     37%       7%      10.7G      542M            2           ok           -
                    5 GeForceRTX2        0.0       68C       0.0     87%      12%      10.7G      1.3G            2           ok           -
                    6 GeForceRTX2        0.0       69C       0.0     90%      18%      10.7G     10.7G            2           ok           -
                    7 GeForceRTX2        0.0       66C       0.0     90%      18%      10.7G     10.7G            2           ok           -
```

使用 GPU 资源时，需要对提交脚本进行相应修改，用 `-gpu` 命令申请 GPU 资源。

```
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

其中 `num=1` 表示申请1张GPU卡，`j_exclusive=no` 表示允许和其他任务共存，`-n` 表示申请的CPU核数，在 Metal 集群上使用时，若希望任务独占1张卡，请设置为 4。否则，可能会出现多个任务使用同一张卡的情况。

{% include alert.html type="tip" title="链接" content="若使用新版 LSF 提交任务，则不再需要引入检测脚本或<code>CUDA_VISIBLE_DEVICES</code>控制使用的GPU。" %}

### Slurm 管理系统

> 2021年7月26日起，将 Metal 集群管理统一切换至新版 LSF 系统，请参考 wiki 的相关说明。

采用 Slurm 系统可以直接对 GPU 进行分配，因此不再需要上述的检测脚本。由于 GPU 任务在执行过程中仍需要少量 CPU 资源，请在使用时按照一个 GPU 任务对应该节点上 2 个 CPU 核的方式提交。其提交脚本示例如下：

```bash
#!/bin/bash -l
#SBATCH -N 1
#SBATCH --ntasks-per-node=2
#SBATCH -t 96:0:0
#SBATCH --partition=gpu
#SBATCH --gres=gpu:1

module load deepmd/1.2

dp train input.json 1>> train.log 2>> train.log
dp freeze  1>> train.log 2>> train.log
```

Slurm 与 LSF 命令对照表如下所示：

| LSF                  | Slurm                           | 描述                                                                                    |
| :------------------- | :------------------------------ | :-------------------------------------------------------------------------------------- |
| `bsub < script_file` | `sbatch script_file`            | 提交任务，作业脚本名为`script_file`                                                     |
| `bkill 123`          | `scancel 123`                   | 取消任务，作业 ID 号为 123                                                              |
| `bjobs`              | `squeue`                        | 浏览当前用户提交的作业任务                                                              |
| `bqueues`            | `sinfo`<br/>` sinfo -s`         | 浏览当前节点和队列信息，'-s'命令表示简易输出                                            |
| `bhosts`             | `sinfo -N`                      | 查看当前节点列表                                                                        |
| `bjobs -l 123`       | `scontrol show job 123`         | 查看 123 号任务的详细信息。<br>若不指定任务号则输出当前所有任务信息                     |
| `bqueues -l queue`   | `scontrol show partition queue` | 查看队列名为`queue`的队列的详细信息。<br>若不指定队列则返回当前所有可用队列的详细信息。 |
| `bhosts -l g001`     | `scontrol show node g001`       | 查看节点名为 `g001`的节点状态。<br>若不指定节点则返回当前所有节点信息。                 |
| `bpeek 123`          | `speek 123` \*                  | 查看 123 号任务的标准输出。                                                             |

> \* `speek` 命令不是 Slurm 标准命令，仅适用 Metal 集群使用。

作业提交脚本对照表：

| LSF                   | Slurm                                       | 描述                   |
| :-------------------- | :------------------------------------------ | :--------------------- |
| `#BSUB`               | `#SBATCH`                                   | 前缀                   |
| `-q queue_name`       | `-p queue_name` 或 `--partition=queue_name` | 指定队列名称           |
| `-n 64`               | `-n 64`                                     | 指定使用64个核         |
| ---                   | `-N 1`                                      | 使用1个节点            |
| `-W [hh:mm:ss]`       | `-t [minutes]` 或 `-t [days-hh:mm:ss]`      | 指定最大使用时间       |
| `-o file_name`        | `-o file_name`                              | 指定标准输出文件名     |
| `-e file_name`        | `-e file_name`                              | 指定报错信息文件名     |
| `-J job_name`         | `--job-name=job_name`                       | 作业名                 |
| `-M 128`              | `-mem-per-cpu=128M` 或 `--mem-per-cpu=1G`   | 限制内存使用量         |
| `-R "span[ptile=16]"` | `--tasks-per-node=16`                       | 指定每个核使用的节点数 |

通过 `scontrol` 命令可以方便地修改任务的队列、截止时间、排除节点等信息，使用方法类似于 LSF 系统的 `bmod` 命令，但使用上更加简洁。

{% include alert.html type="tip" title="链接" content="更多使用教程和说明请参考：<a href='http://hmli.ustc.edu.cn/doc/userguide/slurm-userguide.pdf'>Slurm作业调度系统使用指南</a>" %}

#### 任务优先级设置（QoS）

默认情况下提交的任务Qos设置为normal，即填充在整个队列的末尾。如果任务比较紧急，可以向管理员报备申请使用emergency优先级，采用此优先级的任务默认排在队列顶。

使用方法如下，即在提交脚本中加入下行：

```bash
#SBATCH --qos emergency
```

## dpgen 提交 GPU 任务参数设置

### DP-GEN v0.x API

无特殊说明，通常情况下使用以下方法设置 `machine.json` 的相关参数即可，这种方式针对的是旧版 DP-GEN 自带的 Dispatcher。
#### LSF 系统（旧版）

{% include alert.html type="danger" title="注意" content="Metal使用的是新版LSF，Zeus使用的是旧版LSF。" %}

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

#### LSF 系统（新版）

> 新版 DP-GEN 0.10.0 已经修复 BUG，且相关 BUG 对 DPDispatcher 无影响，因此下述两参数值不需要再交换。**以下例子中的写法是正确写法。**-- 2021/7/20
> 
> DP-GEN 0.9.2 及以前版本存在BUG，`numb_gpu` 和 `task_per_node` 的含义是相反的，并且对于 LSF 请务必指定 `node_cpu` 为每个节点的核数或与 `-n` 保持一致。 -- 2021/7/10

以训练步骤为例：

```json
{
  "train": [
    {
      "machine": {
        "machine_type": "lsf",
        "hostname": "xx.xxx.xxx.xxx",
        "port": 22,
        "username": "chenglab",
        "work_path": "/home/chenglab/ypliu/dprun/train"
      },
      "resources": {
        "numb_gpu": 1,
        "node_cpu": 32,
        "numb_node": 1,
        "task_per_node": 4,
        "partition": "gpu",
        "new_lsf_gpu": true,
        "exclusive": false,
        "exclude_list": [],
        "source_list": [],
        "module_list": [
            "deepmd/1.2"
        ],
        "time_limit": "96:0:0"
      },
      "python_path": "/share/apps/deepmd/1.2/bin/python3.6"
    }
  ],
  ...
}
```

注意上述设置中开启了 `new_lsf_gpu`，表示启用新的 GPU 语法，在 Metal 上请打开这一设置以免任务提交失败。
这里未开启 `exclusive`，即当CPU核数未占满时即可提交GPU任务，默认提交到负载最低的卡。若希望一张卡只允许一个任务运行，
也可设置 `exclusive` 为 `true`，此时若CPU还有空间但GPU全部占满时，开启了这一选项的卡不会被新的任务占用。

#### Slurm 系统

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

### DP-GEN v1.0 API

从 DP-GEN 0.10.0 版本开始，官方引入了对 DPDispatcher 的支持，并计划将 `machine.json` 迁移到 DPDispatcher 上。
DPDispatcher 相比原本 DP-GEN 自带的 Dispatcher，在接口和语法上有较大变化，需要额外指定 `api_version` 大于或等于 1.0。

关于 DPDispatcher 项目的说明，请参阅[这里](https://github.com/deepmodeling/dpdispatcher)。

DPDispatcher 相比旧版，基于配置字典而非文件Flag来管理所提交的任务，稳定性更优，且对作业管理系统的支持更加灵活多样，内置接口可支持多任务并行提交。
但新版在操作习惯上有较大改变，需要适应和调整。

#### LSF

以 LSF 为例，对 `machine.json` 的写法举例如下，请留意以下的注意事项。

{% include alert.html type="danger" title="注意" content="<p><code>train</code> 部分使用了对新版 LSF 提供支持的写法，即同时指定 <code>gpu_usage</code> 和 <code>gpu_new_syntax</code> 为 <code>True</code>，从而可在提交脚本中使用新版 LSF 的语法。注意Metal使用的是新版LSF。</p><p><code>model_devi</code>部分使用的是旧版语法，且未指定GPU，但导入了检测脚本。注意Zeus使用的是旧版LSF。</p><p><code>fp</code> 部分使用的是针对CPU计算使用的语法。注意 <code>mpiexec.hydra</code> 需要写出。</p>" %}

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

相关参数含义，详情请参阅官方文档
[machine](https://docs.deepmodeling.org/projects/dpdispatcher/en/latest/machine.html) 和
[resources](https://docs.deepmodeling.org/projects/dpdispatcher/en/latest/resources.html) 部分的说明。

以下是部分参数含义：

| 参数                   | 描述                                         |
| :-------------------- | :------------------------------------------ |
| `machine`             | 指定远程服务器的配置信息。 |
| `batch_type`          | 提交作业系统的类型，可指定 `LSF`, `Slurm`, `Shell` 等。 |
| `context_type`        | 连接到远程服务器的方式，常用可选参数`SSHContext`, `LocalContext`, `LazyLocalContext`等。详见官方文档说明。 |
| `SSHContext`          | 通过SSH连接到远程主机，通常情况下从一个服务器提交到另一个时可使用。 |
| `LocalContext`        | 若需要在当前服务器上提交任务，可选择此选项，则不必通过SSH连接。此时 `remote_profile` 部分可不写。 |
| `remote_root`         | 任务在目标主机上提交的绝对路径。 |
| `remote_profile`      | 远程主机设置，若`context_type`为`LocalContext`, `LazyLocalContext`可不写。 |
| `hostname`            | 远程主机IP。 |
| `username`            | 远程主机用户名。 |
| `password`            | 远程主机密码。若通过密钥登陆可不写。 |
| `port`                | SSH连接的端口，默认为22。
| `key_filename`        | SSH密钥存放的路径。默认放在`~/.ssh`下，此时可不写。 |
| `passphrase`          | 密钥安全口令，通常在创建密钥时设置。若为空可不写。 |
| `resource`            | 作业提交相关配置信息。 |
| `number_node`         | 作业使用的节点数。 |
| `cpu_per_node`        | 每个节点上使用CPU核数。 |
| `gpu_per_node`        | 每个节点上使用GPU卡数。 |
| `kwargs`              | 可选参数，依据各作业系统支持的配置而定。详见官方文档。 |
| `gpu_usage`           | **LSF专用。** 是否在作业脚本中使用GPU提交的语法。 |
| `gpu_new_syntax`      | **LSF专用。** `gpu_usage`为`True`时使用，是否在作业脚本中使用GPU提交的新版语法。 |
| `gpu_exclusive`       | **LSF专用。** `gpu_new_syntax`为`True`时使用，是否要求任务单独使用一张GPU卡。 |
| `custom_gpu_line`     | 自定义GPU提交命令，可根据语法自定义。根据作业管理系统不同，以 `#BSUB` (LSF) 或 `#SBATCH` (Slurm) 开头。 |
| `custom_flags`        | 其他需要使用的Flag，例如Walltime、作业名等设置。 |
| `queue_name`          | 任务提交的队列名。 |
| `group_size`          | 每个作业绑定的任务个数。 |
| `if_cuda_multi_devices` | 是否允许任务运行在多卡上，默认为 `True`。在Zeus上建议写成 `False`。 |
| `para_deg`            | 同一卡上同时运行的任务数。默认为1。 |
| `module_list`         | 需要load的module。可不写。|
| `module_unload_list`  | 需要unload的module。可不写。|
| `source_list`         | 需要source的脚本路径。可不写。 |
| `envs`                | 需要引入的环境变量。可不写。 |
