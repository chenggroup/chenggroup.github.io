---
title: 使用A100切分的GPU实例
comments: true
---

# 使用集群上的 GPU —— 使用A100切分的GPU实例

目前Zeus上已经部署了`c51-g002`节点，安装有4张Nvidia Tesla A100加速卡。Nvidia官方在A100发布后引入了Multi-Instance GPU(MIG)技术，可以将一张A100拆分为最多7个GPU实例(GPU Instance)，在此基础上可以创建计算实例(Computing Instance)。

拆分工作需要管理员权限，因而管理员已经事先将其中的3张卡拆分为7个GI并创建CI，因此目前`c51-g002`节点可以同时使用至多22个GPU实例。

受限于现有的调度系统，如果你希望使用Zeus上的A100来进行计算，请仔细阅读以下操作指引。

## 常规使用

目前，`c51-g002`节点上的0号卡尚未开启MIG功能，因此使用上基本与V100一样。为了调度方便，请**务必**使用`j_exclusive=yes`选项以确保任务可以正确调度到0号卡。如果使用DP-GEN，请设置`gpu_exclusive`为`true`。

!!! danger "注意"
    <p>不要心存侥幸设置<code>j_exclusive=no</code>，你会惊奇地发现任务可能被提交到其他卡上，因而无法尽情地享用80GB大显存。同时这也会使得其他人的任务被提交到0号卡上，从而产生干扰。</p>

由于A100仅支持CUDA 11.1以上版本，故请注意使用的软件版本。以DeePMD-kit为例，目前集群上只有`deepmd/2.0-cuda11.3`兼容，因此请务必注意势函数和使用的DeePMD的版本，以免出现报错。

以下给出示例提交脚本：

```bash
#!/bin/bash
#BSUB -q gpu2
#BSUB -W 24:00
#BSUB -J deepmd
#BSUB -o %J.stdout
#BSUB -e %J.stderr
#BSUB -n 11
#BSUB -gpu "num=1:mode=shared:mps=no:j_exclusive=yes"
#BSUB -R "span[ptile=11]"

# add modulefiles
module add deepmd/2.0-cuda11.3

dp train input.json 1>> train.log 2>> train.err
```

请参考`/data/share/base/scripts`下的实例，可复制粘贴使用。（带有A100标注，不带MIG后缀）

这里设置`-n 11`是考虑到GI调度的要求，我们需要防止出现多于22个任务同时运行在A100上。

## 使用MIG切分的GI

受限于现有LSF调度系统，尚且无法直接完成对GI的调度。因此我们需要另辟蹊径，所幸`j_exclusive=no`的情况下可以让任务正确识别到开启了MIG的卡，但也仅限于此了。我们需要进一步让任务正确分配到空闲的CI上，而非默认的第一个（通常编号为7）。

!!! danger "注意"
    <p>不要心存侥幸设置<code>j_exclusive=yes</code>，你会惊奇地发现如果有人用了0号卡，你的任务会处于PEND状态，这是因为LSF认为其他卡均非空。</p>

!!! danger "注意"
    <p>也请不要参考LSF官方文档对于这里的说明，我们的版本不兼容MIG选项。</p>

实际上英伟达官方指导中，若要手动使用CI，需要指定`CUDA_VISIBLE_DEVICES`为对应的UUID。通过ssh登陆到`c51-g002`节点上，运行以下命令：

```bash
nvidia-smi -L
```

可以得到以下输出：

```bash
GPU 0: A100 80GB PCIe (UUID: GPU-558ce120-5b8b-16a1-87d4-ce157bba3e9d)
GPU 1: A100 80GB PCIe (UUID: GPU-162e30f5-cc45-efb9-1e81-19337f4919ce)
  MIG 1g.10gb Device 0: (UUID: MIG-GPU-162e30f5-cc45-efb9-1e81-19337f4919ce/7/0)
  MIG 1g.10gb Device 1: (UUID: MIG-GPU-162e30f5-cc45-efb9-1e81-19337f4919ce/8/0)
  MIG 1g.10gb Device 2: (UUID: MIG-GPU-162e30f5-cc45-efb9-1e81-19337f4919ce/9/0)
  MIG 1g.10gb Device 3: (UUID: MIG-GPU-162e30f5-cc45-efb9-1e81-19337f4919ce/11/0)
  MIG 1g.10gb Device 4: (UUID: MIG-GPU-162e30f5-cc45-efb9-1e81-19337f4919ce/12/0)
  MIG 1g.10gb Device 5: (UUID: MIG-GPU-162e30f5-cc45-efb9-1e81-19337f4919ce/13/0)
  MIG 1g.10gb Device 6: (UUID: MIG-GPU-162e30f5-cc45-efb9-1e81-19337f4919ce/14/0)
GPU 2: A100 80GB PCIe (UUID: GPU-b43c9a60-fe1a-73ec-06b5-59e6e8b25747)
  MIG 1g.10gb Device 0: (UUID: MIG-GPU-b43c9a60-fe1a-73ec-06b5-59e6e8b25747/7/0)
  MIG 1g.10gb Device 1: (UUID: MIG-GPU-b43c9a60-fe1a-73ec-06b5-59e6e8b25747/8/0)
  MIG 1g.10gb Device 2: (UUID: MIG-GPU-b43c9a60-fe1a-73ec-06b5-59e6e8b25747/9/0)
  MIG 1g.10gb Device 3: (UUID: MIG-GPU-b43c9a60-fe1a-73ec-06b5-59e6e8b25747/10/0)
  MIG 1g.10gb Device 4: (UUID: MIG-GPU-b43c9a60-fe1a-73ec-06b5-59e6e8b25747/11/0)
  MIG 1g.10gb Device 5: (UUID: MIG-GPU-b43c9a60-fe1a-73ec-06b5-59e6e8b25747/12/0)
  MIG 1g.10gb Device 6: (UUID: MIG-GPU-b43c9a60-fe1a-73ec-06b5-59e6e8b25747/13/0)
GPU 3: A100 80GB PCIe (UUID: GPU-6fc20abf-dbd6-c875-17d0-8b5b579c9792)
  MIG 1g.10gb Device 0: (UUID: MIG-GPU-6fc20abf-dbd6-c875-17d0-8b5b579c9792/7/0)
  MIG 1g.10gb Device 1: (UUID: MIG-GPU-6fc20abf-dbd6-c875-17d0-8b5b579c9792/8/0)
  MIG 1g.10gb Device 2: (UUID: MIG-GPU-6fc20abf-dbd6-c875-17d0-8b5b579c9792/9/0)
  MIG 1g.10gb Device 3: (UUID: MIG-GPU-6fc20abf-dbd6-c875-17d0-8b5b579c9792/11/0)
  MIG 1g.10gb Device 4: (UUID: MIG-GPU-6fc20abf-dbd6-c875-17d0-8b5b579c9792/12/0)
  MIG 1g.10gb Device 5: (UUID: MIG-GPU-6fc20abf-dbd6-c875-17d0-8b5b579c9792/13/0)
  MIG 1g.10gb Device 6: (UUID: MIG-GPU-6fc20abf-dbd6-c875-17d0-8b5b579c9792/14/0)
```

可以看到，1-3号GPU各自拥有了7个独立的MIG Device，各自的UUID列在括号里。

但是，如果你试图把任务直接交上去，并且手动指定一个UUID，则会发现很可能你的任务没有跑在想要的卡上，甚至在CPU上运行。这是因为LSF调度下，只有一张卡可见，因此只有该可见卡的UUID才有效。

因此，无论怎样，我们都需要一个脚本来监测自己目前位于哪张卡，该卡上有哪几个GI空闲。

管理员提供了一个脚本放置在`/data/share/base/tools/mig_check.py`，可输出当前可用的UUID。该脚本已经设置好执行环境，因而直接运行即可，不要用本地的Python环境来执行。
以下给出一个示例提交脚本：

```bash
#BSUB -e %J.err
#BSUB -o %J.out
#BSUB -n 1
#BSUB -R 'span[ptile=1]'
#BSUB -q gpu2
#BSUB -gpu 'num=1:mode=shared:j_exclusive=no'
#BSUB -J train
#BSUB -W 24:00

module load deepmd/2.0-cuda11.3

export CUDA_VISIBLE_DEVICES=`/data/share/base/tools/mig_check.py`

dp train input.json 1>> train.log 2>> train.err

```

请设置使用1个CPU核以免没有足够多的CPU数供任务提交。

如果使用新版DP-GEN或DPDispatcher来调度任务，请加入新的环境变量选项。以下给出一个`resources`部分的示例：

```json
"resources": {
    "number_node": 1,
    "cpu_per_node": 1,
    "gpu_per_node": 1,
    "queue_name": "gpu2",
    "group_size": 1,
    "kwargs": {
      "gpu_usage": true,
      "gpu_new_syntax": true,
      "gpu_exclusive": false
    },
    "custom_flags": [
      "#BSUB -J train",
      "#BSUB -W 24:00"
    ],
    "strategy": {"if_cuda_multi_devices": false},
    "module_list": ["deepmd/2.0-cuda11.3"],
    "envs": {"CUDA_VISIBLE_DEVICES": "`/data/share/base/tools/mig_check.py`"},
    "wait_time": 60
}
```

请务必设置`gpu_exclusive`为`false`以确保任务正确提交到1-3号卡；请务必设置`if_cuda_multi_devices`为`false`以免自动写入`CUDA_VISIBLE_DEVICES`。同时经过实践，30 s的等待时间对于训练任务可能太短，或需要60s。
