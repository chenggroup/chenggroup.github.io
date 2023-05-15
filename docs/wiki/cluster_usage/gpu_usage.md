---
title: 使用集群上的 GPU
comments: true
---

# 使用集群上的 GPU

## GPU 队列概况

GPU节点调度采用Slurm调度系统进行管理。用户使用时，请在**191节点**上提交、管理任务。

目前课题组GPU有6个节点：

- `c51-g001`: 节点上有 4 张 Tesla V100，采用队列名`gpu1`进行提交。
- `c51-g002`: 节点上有 4 张 A100，采用队列名`gpu2`进行提交。其中有2张卡（0,1）为完整的A100 80G PCIe，另外两张（2,3）已各自切分为 7 个 MIG 计算实例。
- `c51-m001 c51-m002 c51-m003 c51-m004`）: 每个节点上有 8 张 2080 Ti，采用队列名`gpu3`进行提交。

6个节点均可联系管理员开通使用权限。

## 队列选择指导（供参考）

**以下部分是一个简单的指导，仅供参考，请根据自己实际需要选用。**

`gpu3` 队列上有32张 Nvidia 2080Ti 显卡，每张卡提供约11 GB显存。基本上平时对百原子级别 DeePMD 势函数的训练乃至MD都可以完成，故平时DP-GEN流程使用该队列进行计算即可。

`gpu1` 队列配置有4张 Nvidia Tesla V100 显卡，每张卡提供约32 GB显存，且提供完整的双精度加速支持，故适用于更大体系 DeePMD 的训练。对模型进行长训练时，也可使用此队列。同时，因其完整的双精度计算支持以及NV-LINK的引入，一些支持GPU加速的计算软件（如VASP 6.1+）也推荐在此节点上提交，并可用于多卡并行。

`gpu2` 队列配置有4张 Nvidia A100 显卡。其中两张卡为完整卡，每张提供80 GB显存，且提供完整的双精度加速支持，适用于需要更大体系 DeePMD 训练以及更大体系的GPU加速计算，也适用于更大Batch数据集的加载，例如需要内存较多的 NLP 模型。但注意A100未提供NV-LINK和NV-Switch，故请勿进行多卡并行计算，以免效率达不到预期。

同时，A100引入了MIG功能，可以将卡拆分为2-7个小型的GPU实例 (GI)，每个GI可以独立运行GPU计算任务，速度相比在同一张卡上直接同时运行多个任务的情况下有明显提升，但相比单任务速度下降50%以内。目前，该节点配置为2张完整的80 GB卡(0-1号卡)和2张切分为7个GI的卡(2-3号卡)，每个GI的速度大致与2080Ti相近且略强，故可以用于DP-GEN训练。通过Slurm调度系统可以控制使用完整的 A100 还是切分后的小卡。

## 提交任务至 GPU

> 由于嘉庚超算的投用，Slurm系统将得到广泛应用，且后者可以完整支持MIG等GPU硬件新特性，故目前计划逐步切换至Slurm调度。
> 目前GPU的调度已经全部切换至Slurm。
> 关于Slurm介绍的部分将在全面迁移后，独立成一篇文档。

### `gpu1`和`gpu3`队列

常规使用`gpu1`队列和`gpu3`队列的示例脚本放在`/data/share/base/scripts`下，举例如下：

```bash title="deepmd.sub"
#!/bin/bash
#SBATCH -N 1
#SBATCH --ntasks-per-node=1
#SBATCH -t 96:00:00
#SBATCH --partition=gpu3
#SBATCH --gres=gpu:1

# add modulefiles
module add deepmd/2.0-cuda11.3

dp train input.json 1>> train.log 2>> train.err
dp freeze  1>> train.log 2>> train.log
```

其中 `-N 1`表示使用1个节点，`--ntasks-per-node=1` 表示每个节点上使用1个CPU核，`--partition=gpu3`即表示提交任务到`gpu3`队列上，`--gres=gpu:1`即分配其中的1张卡给任务。`gpu3`中每个节点有8张2080Ti卡，因而上述命令组合起来即表示分配1个节点上的1个CPU核以及1张2080Ti卡用于计算。

若需要使用其他队列，只需将`--partition`的参数修改为对应的队列，即`gpu1`和`gpu3`。

### `gpu2`队列

`gpu2`队列提供了2张完整A100 80G卡供大任务使用，以及2张分卡共14个实例供相对比较零散的任务使用。

完整卡使用时，可参照[`gpu1`和`gpu3`队列](#gpu1和gpu3队列)，将`--gres`的参数改为`gpu:a100:1`即可，其中1仍表示分配1张卡。

MIG 实例（即俗称的A100分卡、小卡）的使用脚本放在`/data/share/base/scripts`下，举例如下：

```bash title="cp2k_mig.sub"
#!/bin/bash -l
#SBATCH --parsable
#SBATCH --nodes 1
#SBATCH --ntasks-per-node 1
#SBATCH --partition gpu2
#SBATCH --gres=gpu:1g.10gb:1
#SBATCH --time=96:00:00

module load deepmd/2.1
cp2k.ssmp -i input.inp 1>>output 2>>err.log
```

其中`--gres=gpu:1g.10gb:1`即表示分配 1 个MIG实例给任务使用。

!!! danger "注意"
    A100分配GPU的命令需要写明硬件类型，否则Slurm在分配资源时无法区分。

### 关于Slurm作业管理系统

若用户已经准备好相应计算的输入和提交脚本，则可以对任务进行提交。例如提交脚本文件名为`deepmd.sub`，则提交命令为：

```bash
sbatch deepmd.sub
```

若提交成功，可以看到以下提示：

```
Submitted batch job 630
```

表示任务已经成功提交到节点上，编号为 `630`。

任务提交后，可以通过`squeue`命令查看集群上任务的运行情况。

```
JOBID PARTITION     NAME     USER ST       TIME  NODES NODELIST(REASON)
  620      gpu2    100-2     user  R    5:47:46      1 c51-g002
  619      gpu2    150-2     user  R    7:19:49      1 c51-g002
  630      gpu3 deepmd.s    ypliu PD       0:00      1 (Resources)
  623      gpu3 deepmd.s     user  R       0:22      1 c51-m001
  625      gpu3    ec_dp     user  R      55:28      1 c51-m001
  610      gpu3 deepmd.s     user  R   19:04:13      1 c51-m003
  609      gpu3 deepmd.s     user  R   19:05:22      1 c51-m002
```

其中 `JOBID` 即为任务编号，`ST` 表示状态，`R` 即为正在运行，而 `PD` 表示正在排队，可能是因为空余卡数不足。可以看到，623号任务正在运行，可能，刚刚提交的630号任务则在排队。

如果想要停止或取消已经提交的任务，则使用命令：

```
scancel 630
```

一段时间后，该任务即被杀死。

Slurm 与 LSF 命令对照表如下所示：

| LSF                  | Slurm                           | 描述                                                         |
| :------------------- | :------------------------------ | :----------------------------------------------------------- |
| `bsub < script_file` | `sbatch script_file`            | 提交任务，作业脚本名为`script_file`                          |
| `bkill 123`          | `scancel 123`                   | 取消任务，作业 ID 号为 123                                   |
| `bjobs`              | `squeue`                        | 浏览当前用户提交的作业任务                                   |
| `bqueues`            | `sinfo`<br/>` sinfo -s`         | 浏览当前节点和队列信息，'-s'命令表示简易输出                 |
| `bhosts`             | `sinfo -N`                      | 查看当前节点列表                                             |
| `bjobs -l 123`       | `scontrol show job 123`         | 查看 123 号任务的详细信息。<br>若不指定任务号则输出当前所有任务信息 |
| `bqueues -l queue`   | `scontrol show partition queue` | 查看队列名为`queue`的队列的详细信息。<br>若不指定队列则返回当前所有可用队列的详细信息。 |
| `bhosts -l g001`     | `scontrol show node g001`       | 查看节点名为 `g001`的节点状态。<br>若不指定节点则返回当前所有节点信息。 |
| `bpeek 123`          | `speek 123` \*                  | 查看 123 号任务的标准输出。                                  |

> \* `speek` 命令不是 Slurm 标准命令，仅适用原 Metal 集群使用。

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

!!! tip "链接"
    更多使用教程和说明请参考：<a href='http://hmli.ustc.edu.cn/doc/userguide/slurm-userguide.pdf'>Slurm作业调度系统使用指南</a>

### dpgen 提交 GPU 任务参数设置

请参考[DP-GEN使用说明](../software_usage/DP-GEN.md)。
