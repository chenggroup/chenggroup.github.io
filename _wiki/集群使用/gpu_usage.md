---
title: 使用集群上的 GPU
priority: 1.03
---

# 使用集群上的 GPU

## GPU 队列概况

目前课题组GPU有6个节点：

- `c51-g001`: 节点上有 4 张 Tesla V100，采用队列名`gpu`进行提交。
- `c51-g002`: 节点上有 4 张 Tesla A100，采用队列名`gpu2`进行提交。
- `c51-m001 c51-m002 c51-m003 c51-m004`）: 每个节点上有 8 张 2080 Ti，采用队列名`gpu3`进行提交。

6个节点均可联系管理员开通使用权限。

## 队列选择指导（供参考）

**以下部分是一个简单的指导，仅供参考，请根据自己实际需要选用。**

`gpu3` 队列上有32张 Nvidia 2080Ti 显卡，每张卡提供约11 GB显存。基本上平时对百原子级别 DeePMD 势函数的训练乃至MD都可以完成，故平时DP-GEN流程使用该队列进行计算即可。

`gpu` 队列配置有4张 Nvidia Tesla V100 显卡，每张卡提供约32 GB显存，且提供完整的双精度加速支持，故适用于更大体系 DeePMD 的训练。对模型进行长训练时，也可使用此队列。同时，因其完整的双精度计算支持以及NV-LINK的引入，一些支持GPU加速的计算软件（如VASP 6.1+）也推荐在此节点上提交，并可用于多卡并行。

`gpu2` 队列配置有4张 Nvidia A100 显卡，每张卡提供80 GB显存，且提供完整的双精度加速支持，适用于需要更大体系 DeePMD 训练以及更大体系的GPU加速计算，也适用于更大Batch数据集的加载。但注意A100未提供NV-LINK和NV-Switch，故请勿进行多卡并行计算。同时，A100引入了MIG功能，可以将卡拆分为2-7个小型的GPU实例 (GI)，每个GI可以独立运行GPU计算任务，速度相比在同一张卡上直接同时运行多个任务的情况下有明显提升，但相比单任务速度下降50%以内。目前，该节点配置为1张完整的80 GB卡(3号卡)和3张切分为7个GI的卡(0-2号卡)，每个GI的速度大致与2080Ti相近，故可以用于DG-GEN训练。但由于LSF不能指定具体提交的卡，请检查自己的任务交到哪张卡、哪个GI上。我们仍在寻找方案如何控制这一提交，请注意。

关于`gpu2`队列的使用，更多内容请参考<a href="{{ site.baseurl }}{% link _wiki/集群使用/mig_usage.md %}">A100拆分实例使用说明</a>。

## 提交任务至 GPU

### LSF 作业管理系统（新版）

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
使用A100时，请设置为不超过8的整数，若为开启MIG的情况，请参考<a href="{{ site.baseurl }}{% link _wiki/集群使用/mig_usage.md %}">A100拆分实例使用说明</a>；
使用2080Ti时，请设置为不超过4的整数，否则均可能会出现资源空闲但无法使用的情况。如希望独占一张卡请使用`j_exclusive=yes`。

{% include alert.html type="tip" title="链接" content="使用新版 LSF 提交任务，不需要引入检测脚本或<code>CUDA_VISIBLE_DEVICES</code>控制使用的GPU。" %}

### A100特殊注意事项

请参考<a href="{{ site.baseurl }}{% link _wiki/集群使用/mig_usage.md %}">

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

### dpgen 提交 GPU 任务参数设置

请参考<a href="{{ site.baseurl }}{% link _wiki/软件使用/DP-GEN.md %}#">DP-GEN使用说明</a>。
