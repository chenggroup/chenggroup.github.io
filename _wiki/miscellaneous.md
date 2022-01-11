---
Authors:
  - Yongbin Zhuang
  - Yunpei Liu
  - Jingfang Xiong
title: 杂项（Miscellaneous）
priority: 100.1

---

# Miscellaneous

**Put temporary or unclassied content here!**



## Run Process when you logout shell.

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

{% include alert.html type="danger" title="danger" content="千万不要运行 'rm -rf data.init/*' ，你会删除掉原路径下的所有文件！！！'" %}

## Slurm 管理系统

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

### 任务优先级设置（QoS）

默认情况下提交的任务Qos设置为normal，即填充在整个队列的末尾。如果任务比较紧急，可以向管理员报备申请使用emergency优先级，采用此优先级的任务默认排在队列顶。

使用方法如下，即在提交脚本中加入下行：

```bash
#SBATCH --qos emergency
```

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

 
