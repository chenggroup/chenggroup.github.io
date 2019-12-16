---
title: 使用集群上的 gpu
---

# 使用集群上的 gpu

## 提交任务至 gpu

在 `210.34.15.205` 上，可直接使用 lsf 为任务自动分配 gpu 资源，而不用指定 `CUDA_VISIBLE_DEVICES` 。

```bash
#!/bin/bash

#BSUB -q large
#BSUB -W 24:00
#BSUB -J test
#BSUB -o %J.stdout
#BSUB -e %J.stderr
#BSUB -n 1
#BSUB -R "rusage[ngpus_excl_p=1]"
```

> lsf 提交脚本需要含有 `BSUB -R` 选项，且不要包含 `export $CUDA_VISIBLE_DEVICES`

比如，在 `210.34.15.205` 使用 dpgen 的提交脚本如下（目前 `large` 队列未对用户最大提交任务数设限制，Walltime暂定为10天）：

```bash
#!/bin/bash

#BSUB -q large
#BSUB -J train
#BSUB -o %J.stdout
#BSUB -e %J.stderr
#BSUB -n 1
#BSUB -R "select[ngpus>0] rusage[ngpus_excl_p=1]"

module add deepmd/1.0.2
dp train input.json > train.log
```

{%

include warning.html type="warning" title="注意"

content="在提交脚本里指定\`CUDA_VISIBLE_DEVICES\` 会导致\`device not available\`的错误，进而可能导致整个LSF系统无法正确使用GPU。"

%}

