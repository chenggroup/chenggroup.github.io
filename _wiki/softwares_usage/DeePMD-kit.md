---
title: DeePMD-kit 使用入门
authors: 庄永斌
priority: 2.2
---

# DeePMD-kit 使用入门

## 简介

DeePMD-kit是一个训练神经网络势能(Machine Learning Potential)的代码包。该包主要由张林峰（普林斯顿大学），王涵（北京应用物理与计算数学研究所）开发。黄剑兴和庄永斌曾经短时间参与开发。如有问题，可以向他们询问。

以下为参考信息:

- [官网](http://www.deepmd.org)
- 安装方法:  [Installation Guide]({{ site.baseurl }}/wiki/softwares#deepmd-installation-guide)

{% include alert.html type="warning" content="此页面仅限提供贡献者对于该软件的理解，如有任何问题请联系贡献者" %}

## 第一次尝试

### 运行第一次机器学习

如果你正在使用chenglab51集群，请使用`lsf`脚本来提交deepmd任务。

请从github下载DeePMD-kit的代码，我们将会使用里面的水模型做为例子。

```bash
git clone https://github.com/deepmodeling/deepmd-kit.git
```

首先进入含有水模型的例子的目录

```bash 
cd <deepmd repositoy>/examples/water/train/
```

你会看到许多`json`为后缀的文件。这些都是DeePMD-kit使用的输入文件。我们只需要使用`water_se_a.json`文件作为例子。现在复制制`/share/base/script/deepmd.lsf`到当前文件夹，并且修改它。

```bash
cp /share/base/script/deepmd.lsf ./
vim deepmd.lsf
```

{% include alert.html type="warning" content="如果调用的是1.0的版本，需要在learning_rate下加入decay_rate关键词，一般设为0.95." %}

你现在仅需要修改`lsf`脚本中的输入文件名称即可。把脚本中的`input.json`替换成`water_se_a.json`。

```bash
#!/bin/bash

#BSUB -q gpu
#BSUB -W 24:00
#BSUB -J train
#BSUB -o %J.stdout
#BSUB -e %J.stderr
#BSUB -n 8
#BSUB -R "span[ptile=8]"
# ============================================
# modify the number of cores to use
# according to the number of GPU you select
# for example, 8 cores for one GPU card
# while there are 32 cores in total
# ============================================

# add modulefiles
module add cuda/10.0 deepmd/1.0

# automatic select the gpu
source /share/base/script/find_gpu.sh

dp train input.json 1>> train.log 2>> train.log 
```

使用如下命令提交任务：

```bash
#submit your job
bsub < deepmd.lsf
#check your job by
bjobs 
```

当任务执行中，当前目录会生成以下文件：

- `train.log`: 训练的记录文件
- `lcurve.out`: 机器学习的学习曲线
- `model.ckpt.data-00000-of-00001`, `model.ckpt.index`, `checkpoint`, `model.ckpt.meta`: 以上三个为训练存档点

非常好！已经成功开始第一次机器学习训练了！

### 浏览输出文件

使用 `less` 命令来浏览输出文件

```bash
less train.log
```

你将会看到如下内容

```bash
# DEEPMD: initialize model from scratch
# DEEPMD: start training at lr 1.00e-03 (== 1.00e-03), final lr will be 3.51e-08
2019-12-07 00:03:49.659876: I tensorflow/stream_executor/platform/default/dso_loader.cc:42] Successfully opened dynamic library libcublas.so.10.0
# DEEPMD: batch     100 training time 5.95 s, testing time 0.18 s
# DEEPMD: batch     200 training time 4.58 s, testing time 0.20 s
# DEEPMD: batch     300 training time 4.56 s, testing time 0.14 s
# DEEPMD: batch     400 training time 4.49 s, testing time 0.13 s
# DEEPMD: batch     500 training time 4.60 s, testing time 0.14 s
# DEEPMD: batch     600 training time 4.61 s, testing time 0.15 s
# DEEPMD: batch     700 training time 4.43 s, testing time 0.18 s
# DEEPMD: batch     800 training time 4.59 s, testing time 0.13 s
# DEEPMD: batch     900 training time 4.41 s, testing time 0.17 s
# DEEPMD: batch    1000 training time 4.66 s, testing time 0.11 s
# DEEPMD: saved checkpoint model.ckpt
# DEEPMD: batch    1100 training time 4.45 s, testing time 0.15 s
# DEEPMD: batch    1200 training time 4.37 s, testing time 0.14 s
```

在`batch`后面的数字表明程序已经放入了多少数据进行训练。这个数字的显示间隔，即100，是在输入文件的`"disp_freq":  100` 设置的。

现在来看看你的学习曲线 `lcurve.out`

```bash
less lcurve.out
```

你将会看到：

```bash
# batch      l2_tst    l2_trn    l2_e_tst  l2_e_trn    l2_f_tst  l2_f_trn         lr
      0    3.25e+01  3.29e+01    1.03e+01  1.03e+01    8.08e-01  8.23e-01    1.0e-03
    100    2.58e+01  2.54e+01    1.76e+00  1.77e+00    8.08e-01  7.94e-01    1.0e-03
    200    2.55e+01  2.59e+01    2.18e-01  2.26e-01    8.05e-01  8.19e-01    1.0e-03
    300    2.46e+01  2.51e+01    1.41e-01  1.45e-01    7.79e-01  7.94e-01    1.0e-03
    400    2.21e+01  2.11e+01    1.63e-01  1.67e-01    7.00e-01  6.67e-01    1.0e-03
    500    1.92e+01  1.91e+01    6.77e-03  2.49e-03    6.07e-01  6.04e-01    1.0e-03
    600    1.62e+01  1.65e+01    1.18e-01  1.19e-01    5.13e-01  5.23e-01    1.0e-03
    700    1.26e+01  1.21e+01    8.76e-02  8.19e-02    3.99e-01  3.82e-01    1.0e-03
    800    1.39e+01  1.30e+01    5.62e-02  5.15e-02    4.41e-01  4.11e-01    1.0e-03
    900    1.11e+01  1.13e+01    1.46e-01  1.44e-01    3.52e-01  3.57e-01    1.0e-03
   1000    9.13e+00  8.58e+00    3.56e-02  3.83e-02    2.89e-01  2.71e-01    1.0e-03
   1100    8.73e+00  8.32e+00    5.57e-02  6.26e-02    2.76e-01  2.63e-01    1.0e-03
   1200    7.69e+00  7.71e+00    8.64e-02  8.69e-02    2.43e-01  2.44e-01    1.0e-03
```

这些数字展示了当前机器学习模型对于数据预测的误差有多大。 `l2_e_tst` 意味着在测试集上使用机器学习模型预测的能量误差会有多大。 `l2_e_trn` 意味着在训练集上使用机器学习模型预测的能量误差会有多大。 `l2_f_tst` and `l2_f_trn` 表示相同意义，不过是对于力的预测. 你可以使用`Matplotlib` Python包进行作图。

## 使用进阶

### 准备训练数据

前半部分仅仅是让你运行DeePMD-kit进行训练。为了训练一个针对你的体系的模型，你需要自己来准备数据。这些数据都是第一性原理计算得到的数据。这些数据可以是单点能计算得到的数据，或者是分子动力学模拟得到的数据。作为数据集需要的数据有：

- 体系的结构文件：`coord.npy`
- 体系的结构文件对应的元素标记：`type.raw`
- 体系的结构文件对应的能量：`energy.npy`
- 体系的结构文件对应的力：`force.npy`
- 体系的结构文件对应的晶胞大小，如果是非周期性体系，请在训练文件里准备一个超大周期边界条件：`box.npy`

代码块里的文件名为DeePMD-kit使用的命名。`npy`后缀为Python的numpy代码包生成的文件，请在此之前学习numpy。如果你使用`cp2k`得到数据，你会有 `*pos-1.xyz` 和 `*frc-1.xyz` 文件。你可以使用[帮助](#extra-support)的脚本转化成DeePMD-kit的数据集格式。

现在我们来看看DeePMD-kit的训练数据格式。之前我们训练的水模型的数据集储存在 `<deepmd repository>/examples/water/data/`. 让我们来看看数据集的目录结构：

```bash
# directory structre for training data
.
├── data
│   ├── set.000
│   │   ├── box.npy
│   │   ├── coord.npy
│   │   ├── energy.npy
│   │   └── force.npy
│   ├── set.001
│   │   ├── box.npy
│   │   ├── coord.npy
│   │   ├── energy.npy
│   │   └── force.npy
│   ├── set.002
│   │   ├── box.npy
│   │   ├── coord.npy
│   │   ├── energy.npy
│   │   └── force.npy
│   ├── set.003
│   │   ├── box.npy
│   │   ├── coord.npy
│   │   ├── energy.npy
│   │   └── force.npy
│   └── type.raw
```

显然，我们会看到`type.raw`文件和一堆以`set`开头的目录。`type.raw`文件记录了体系的元素信息。如果你打开你会发现它仅仅记录了一堆数字。这些数字对应着你在`water_se_a.json`中`"type_map":["O","H"]`的信息。此时`0`代表`O`,`1`代表`H`。对应着`["O","H"]`中的位置，其中第一位为0。

```bash
0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1   1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1   1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
```

`box.npy`, `coord.npy`, `energy.npy` 和 `force.npy` 储存的信息在上文已经说过。唯一需要注意的是这些文件都储存着一个超大的矩阵。如果我们有Y个结构，每个结构有X个原子。`box.npy`, `coord.npy`, `energy.npy` 和 `force.npy` 对应的矩阵形状分别是 (Y, 9), (Y, X\*3), (Y, 1), (Y, X\*3)。

### 设置你的输入文件

输入文件是`json`文件。你可以使用之前我们的`json`文件进行细微改动就投入到自己体系的训练中。这些需要修改的关键词如下：

- `type": "se_a"`: 设置描述符（descriptor）类型。一般使用`se_a`。
- `"sel": [46, 92]`: 设置每个原子的截断半径内所拥有的最大原子数。注意这里的两个数字46，92分别对应的是`O`原子和`H`原子。与你在`type_map`里设置的元素类型是相对应的。

```json
"descriptor" :{
         "type":     "se_a",
         "sel":      [46, 92],
         "rcut_smth":    5.80,
         "rcut":     6.00,
         "neuron":       [25, 50, 100],
         "resnet_dt":    false,
         "axis_neuron":  16,
         "seed":     1,
         "_comment":     " that's all"
     },
```

- `"systems":  ["../data/"]`: 设置包含训练数据的目录。
- `"set_prefix": "set"`: 上文中是不是有介绍一些以`set` 开头的目录。就是它们

```json
     "systems":  ["../data/"]
     "set_prefix":   "set",
```

- `"batch_size": 1`: 每个批次（batch）的大小，该数字代表结构数量。记住每一次迭代会放一个批次的结构进入训练。
- `"numb_test": 10` : 每次迭代中，测试集的结构数量。注意测试集是随机从数据集里挑选的，如果有多个数据集或多个set，那么一般只会从最后一个目录里挑选。

### 开始你的训练

使用如下命令开始:

```bash
dp train input.json
```

{% include alert.html type="warning" content="记住在集群上训练，请使用lsf脚本。" %}



### 重启你的训练

使用以下命令重启:

```bash
dp train input.json --restart model.ckpt
```

{% include alert.html type="warning" content="记住在集群上训练，请使用lsf脚本。" %}



## Trouble Shooting

### warning: loc idx out of lower bound

Solution: https://github.com/deepmodeling/deepmd-kit/issues/21

## Extra Support

### Script for convertion from cp2k xyz to numpy set

```python
from ase.io import read
import numpy as np
import os, sys
import glob
import shutil


#############################
# USER INPUT PARAMETER HERE #
#############################

# input data path here, string, this directory should contains
#   ./data/*frc-1.xyz ./data/*pos-1.xyz
data_path = "./data"

#input the number of atom in system
atom_num = 189

#input cell paramter here
cell = [[10.0,0,0],[0,10.0,0],[0,0,10.0]]

# conversion unit here, modify if you need
au2eV = 2.72113838565563E+01
au2A = 5.29177208590000E-01


####################
# START OF PROGRAM #
####################

def xyz2npy(pos, atom_num, output, unit_convertion=1.0):
    total = np.empty((0,atom_num*3), float)
    for single_pos in pos:
        tmp=single_pos.get_positions()
        tmp=np.reshape(tmp,(1,atom_num*3))
        total = np.concatenate((total,tmp), axis=0)
    total = total * unit_convertion
    np.save(output, total)

def energy2npy(pos, output, unit_convertion=1.0):
     total = np.empty((0), float)
     for single_pos in pos:
         tmp=single_pos.info.pop('E')
         tmp=np.array(tmp,dtype="float")
         tmp=np.reshape(tmp,1)
         total = np.concatenate((total,tmp), axis=0)
     total = total * unit_convertion
     np.save(output,total)

def cell2npy(pos, output, cell, unit_convertion=1.0):
    total = np.empty((0,9),float)
    frame_num = len(pos)
    cell = np.array(cell, dtype="float")
    cell = np.reshape(cell, (1,9))
    for frame in range(frame_num):
        total = np.concatenate((total,cell),axis=0)
    total = total * unit_convertion
    np.save(output,total)

def type_raw(single_pos, output):
    element = single_pos.get_chemical_symbols()
    element = np.array(element)
    tmp, indice = np.unique(element, return_inverse=True)
    np.savetxt(output, indice, fmt='%s',newline=' ')


# read the pos and frc
data_path = os.path.abspath(data_path)
pos_path = os.path.join(data_path, "*pos-1.xyz")
frc_path = os.path.join(data_path, "*frc-1.xyz")
#print(data_path)
pos_path = glob.glob(pos_path)[0]
frc_path = glob.glob(frc_path)[0]
#print(pos_path)
#print(frc_path)
pos = read(pos_path, index = ":" )
frc = read(frc_path, index = ":" )

# numpy path
set_path = os.path.join(data_path, "set.000")
if os.path.isdir(set_path):
    print("detect directory exists\n now remove it")
    shutil.rmtree(set_path)
    os.mkdir(set_path)
else:
    print("detect directory doesn't exist\n now create it")
    os.mkdir(set_path)
type_path = os.path.join(data_path, "type.raw")
coord_path = os.path.join(set_path, "coord.npy")
force_path = os.path.join(set_path, "force.npy")
box_path = os.path.join(set_path, "box.npy")
energy_path = os.path.join(set_path, "energy.npy")


#tranforrmation
xyz2npy(pos, atom_num, coord_path)
xyz2npy(frc, atom_num, force_path, au2eV/au2A)
energy2npy(pos, energy_path, au2eV)
cell2npy(pos, box_path, cell)
type_raw(pos[0], type_path)

```

