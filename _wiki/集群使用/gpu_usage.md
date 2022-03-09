---
title: 使用集群上的 GPU
priority: 1.03
---

# 使用集群上的 GPU

## GPU 队列概况

目前课题组GPU有两个集群：

- Metal 集群（205）：包含 4 个节点（`mgt g001 g002 g003`），每个节点上有 8 张 2080 Ti。`mgt` 作为计算节点的同时作为管理节点。
- Zeus 集群（191）：包含 2 个节点（`c51-g001 c51-g002`），节点上有 4 张 Tesla V100和 4 张 Tesla A100。

两个节点均可联系管理员开通使用权限。

## 提交任务至 GPU

### LSF 作业管理系统（新版）

目前 LSF Suite 10.2 已在 Zeus 和 Metal 上部署测试，该版本包含了新版的 LSF 作业管理系统，因而可对 GPU 提供支持。

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

其中 `num=1` 表示申请1张GPU卡，`j_exclusive=no` 表示允许和其他任务共存，`-n` 表示申请的CPU核数，在 Metal 集群上使用时，若希望任务独占1张卡，请设置为 4。否则，可能会出现多个任务使用同一张卡的情况。

{% include alert.html type="tip" title="链接" content="若使用新版 LSF 提交任务，则不再需要引入检测脚本或<code>CUDA_VISIBLE_DEVICES</code>控制使用的GPU。" %}

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

## dpgen 提交 GPU 任务参数设置

### DP-GEN v0.x API

无特殊说明，通常情况下使用以下方法设置 `machine.json` 的相关参数即可，这种方式针对的是旧版 DP-GEN 自带的 `Dispatcher`。
#### LSF 系统（新版）

> DP-GEN 0.9.2 及以前版本存在BUG，`numb_gpu` 和 `task_per_node` 的含义是相反的，并且对于 LSF 请务必指定 `node_cpu` 为每个节点的核数或与 `-n` 保持一致。
>
> DP-GEN >= 0.10.0 已经修复 BUG，且相关 BUG 对 DPDispatcher 无影响，因此下述两参数值不需要再交换。**以下例子中的写法是正确写法。**

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

### DP-GEN v1.0 API

从 DP-GEN 0.10.0 版本开始，官方引入了对 DPDispatcher 的支持，并计划将 `machine.json` 迁移到 DPDispatcher 上。
DPDispatcher 相比原本 DP-GEN 自带的 Dispatcher，在接口和语法上有较大变化，需要额外指定 `api_version` 大于或等于 1.0。

关于 DPDispatcher 项目的说明，请参阅[这里](https://github.com/deepmodeling/dpdispatcher)。

DPDispatcher 相比旧版，基于配置字典而非文件Flag来管理所提交的任务，稳定性更优，且对作业管理系统的支持更加灵活多样，内置接口可支持多任务并行提交。
但新版在操作习惯上有较大改变，需要适应和调整。

#### LSF

以 LSF 为例，对 `machine.json` 的写法举例如下，请留意以下的注意事项。

{% include alert.html type="danger" title="注意" content="<p><code>train</code> 部分和<code>model_devi</code>部分使用了对新版 LSF 提供支持的写法，即同时指定 <code>gpu_usage</code> 和 <code>gpu_new_syntax</code> 为 <code>True</code>，从而可在提交脚本中使用新版 LSF 的语法。</p><p>`para_deg`表示在同一张卡上同时运行的任务数，通常可不写出，此时默认值为1。这里给出的例子表示在同一张卡上同时运行两个Lammps任务。</p><p><code>fp</code> 部分使用的是针对CPU计算使用的语法。注意 <code>mpiexec.hydra</code> 需要写出。</p>" %}

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
        "gpu_per_node": 1,
        "queue_name": "gpu",
        "group_size": 5,
        "kwargs": {
          "gpu_usage": true,
          "gpu_new_syntax": true, 
          "gpu_exclusive": false
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
