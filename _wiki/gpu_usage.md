---
title: 使用集群上的 gpu
priority: 2.1
---

# 使用集群上的 gpu

## gpu队列概况

目前课题组GPU有两个IP地址：

- `210.34.15.205`：包含4个节点（`mgt g001 g002 g003`），每个节点上有8张2080 Ti。`mgt` 作为计算节点的同时作为管理节点。
- `121.192.191.51`：包含1个节点（`g001`），节点上有4张Tesla V100。登陆到51上可以使用。

两个节点均可联系管理员开通使用权限。

## 提交任务至 gpu

### LSF 作业管理系统

在GPU节点上，需要通过指定 `CUDA_VISIBLE_DEVICES` 来对任务进行管理。

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
示例如下：

```bash
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
表示目前该节点（ `g001` ）上5号卡正在被进程号为205527的进程 `lmp` 使用，占用显存为611 MB，gpu利用率为62%。


在 `210.34.15.205` 使用 deepmd 的提交脚本示例如下（目前 `large` 队列未对用户最大提交任务数设限制，Walltime 也无时间限制）：

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

目前205服务器上预置了两个检测脚本，针对不同需要对卡的使用进行划分。

可以使用检测脚本`/share/base/scripts/export_visible_devices`来确定 `$CUDA_VISIBLE_DEVICES` 的值，示例如下：

```bash
#!/bin/bash

#BSUB -q large
#BSUB -J train
#BSUB -o %J.stdout
#BSUB -e %J.stderr
#BSUB -n 4

module add cuda/9.2
module add deepmd/1.0
source /share/base/scripts/export_visible_devices

dp train input.json > train.log
```

`/share/base/scripts/export_visible_devices` 可以使用flag `-t mem` 控制显存识别下限，即使用显存若不超过 `mem` 的数值，则认为该卡未被使用。根据实际使用情况和经验，默认100 MB以下视为空卡，即可以向该卡提交任务。

也可以使用检测脚本`/share/base/scripts/avail_gpu.sh`来确定 `$CUDA_VISIBLE_DEVICES` 的值。`/share/base/scripts/avail_gpu.sh` 可以使用flag `-t util` 控制显卡利用率可用上限，即使用显卡利用率若超过 `util` 的数值，则认为该卡被使用。目前脚本默认显卡利用率低于5%视为空卡，即可以向该卡提交任务。

### Slurm 管理系统

目前本系统在 205 节点的 `g001` 节点测试中。

采用 Slurm 系统可以直接对 GPU 进行分配，因此不再需要上述的检测脚本。其提交脚本示例如下：

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

| LSF                  | Slurm                | 描述                                         |
| :------------------- | :------------------- | :------------------------------------------- |
| `bsub < script_file` | `sbatch script_file` | 提交任务，作业脚本名为`script_file`          |
| `bkill 123`          | `scancel 123`        | 取消任务，作业 ID 号为 123                   |
| `bjobs`              | `squeue`             | 浏览当前用户提交的作业任务                   |
| `bqueues`            | `sinfo`<br/>` sinfo -s` | 浏览当前节点和队列信息，'-s'命令表示简易输出 |
| `bhosts` | `sinfo -N` |查看当前节点列表|

作业提交脚本对照表：

| LSF                       | Slurm                                    | 描述                                                         |
| :------------------------ | :--------------------------------------- | :----------------------------------------------------------- |
| `#BSUB`                   | `#SBATCH`                                | 前缀                                                         |
| `-q queue_name`           | `-p queue_name` 或 `--partition=queue_name` | 指定队列名称                                                 |
| `-n 64`                   | `-n 64`                                  | 指定使用64个核                                               |
| ---- | `-N 1` |使用1个节点|
| `-W [hh:mm:ss]`           | `-t [minutes]` 或 `-t [days-hh:mm:ss]`  | 指定最大使用时间                                    |
| `-o file_name`           | `-o file_name`                           | 指定标准输出文件名                |
| `-e file_name`            | `-e file_name`                           | 指定报错信息文件名                                  |
| `-J job_name`             | `--job-name=job_name`                    | 作业名                                                  |
| `-M 128`                  | `-mem-per-cpu=128M` 或 `--mem-per-cpu=1G` | 限制内存使用量                              |
| `-R "span[ptile=16]"`     | `--tasks-per-node=16`                    | 指定每个核使用的节点数                                |


## dpgen提交gpu任务参数设置

### LSF系统

以训练步骤为例：

```json
{
  "train": [
    {
      "machine": {
        "machine_type": "lsf",
        "hostname": "210.34.15.205",
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
        "sleep": 20
      },
      "python_path": "/share/deepmd-1.0/bin/python3.6"
    }
  ],
  ......
}
```

### Slurm 系统

以训练步骤为例：

```json
{
  "train": [
    {
      "machine": {
        "machine_type": "slurm",
        "hostname": "210.34.15.205",
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

