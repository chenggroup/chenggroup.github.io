---
title: DeePMD-kit 使用入门
authors: 庄永斌
comments: true
---

# DeePMD-kit 2.0 使用入门

## 简介

DeePMD-kit是一个训练神经网络势能(Machine Learning Potential)的代码包。该包主要由张林峰（普林斯顿大学），王涵（北京应用物理与计算数学研究所）开发。黄剑兴和庄永斌曾经短时间参与开发。如有问题，可以向他们询问。
!!! warning None
    我们已经舍弃了1.x版本的教程。
以下为参考信息:

- [官网](http://www.deepmd.org)
- [官方文档](https://deepmd.readthedocs.io/en/latest/index.html)
- 安装方法:  [Installation Guide](../software_installation/softwares.md#deepmd-installation-guide)

!!! warning None
    此页面仅限提供贡献者对于该软件的理解，如有任何问题请联系贡献者

## 第一次尝试

### 运行第一次机器学习

如果你正在使用chenglab51集群，请使用`lsf`脚本来提交deepmd任务。

请从github下载DeePMD-kit的代码，我们将会使用里面的水模型做为例子。

```bash
git clone https://github.com/deepmodeling/deepmd-kit.git
```

首先进入含有水模型的例子的目录

```bash 
cd <deepmd repositoy>/examples/water/se_e2_a/
```

你会看到`input.json`文件，这是DeePMD-kit使用的输入文件。现在复制`/data/share/base/script/deepmd.lsf`到当前文件夹，并且修改它。

```bash
cp /data/share/base/script/deepmd.lsf ./
vim deepmd.lsf
```

!!! warning None
    如果调用的是1.0的版本，需要在learning_rate下加入decay_rate关键词，一般设为0.95.

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
module add cuda/10.0 deepmd/2.0

# automatic select the gpu
source /data/share/base/script/find_gpu.sh

dp train input.json -l train.log
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
#  step      rmse_val    rmse_trn    rmse_e_val  rmse_e_trn    rmse_f_val  rmse_f_trn         lr
      0      1.69e+01    1.58e+01      1.52e+00    5.69e-01      5.35e-01    5.00e-01    1.0e-03
   1000      4.74e+00    4.68e+00      3.88e-02    4.02e-01      1.50e-01    1.48e-01    1.0e-03
   2000      5.06e+00    3.93e+00      1.86e-01    1.54e-01      1.60e-01    1.24e-01    1.0e-03
   3000      4.73e+00    4.34e+00      9.08e-02    3.90e-01      1.49e-01    1.37e-01    1.0e-03
   4000      4.65e+00    6.09e+00      2.24e-01    1.92e-01      1.47e-01    1.93e-01    1.0e-03
   5000      3.84e+00    3.25e+00      5.26e-02    2.40e-02      1.25e-01    1.06e-01    9.4e-04
   6000      4.17e+00    2.78e+00      6.35e-02    3.89e-02      1.36e-01    9.03e-02    9.4e-04
   7000      3.24e+00    3.00e+00      5.55e-02    8.58e-03      1.05e-01    9.76e-02    9.4e-04
   8000      2.97e+00    2.83e+00      2.97e-02    2.46e-02      9.68e-02    9.22e-02    9.4e-04
   9000      1.01e+01    6.92e+00      1.36e-01    1.89e-01      3.28e-01    2.25e-01    9.4e-04
  10000      3.73e+00    3.39e+00      4.38e-02    3.23e-02      1.25e-01    1.14e-01    8.9e-04
  11000      3.51e+00    2.76e+00      1.31e-01    3.47e-01      1.17e-01    8.98e-02    8.9e-04
  12000      2.59e+00    2.89e+00      1.35e-01    1.18e-01      8.57e-02    9.65e-02    8.9e-04
  13000      5.65e+00    4.68e+00      3.08e-01    3.28e-01      1.88e-01    1.55e-01    8.9e-04
```

这些数字展示了当前机器学习模型对于数据预测的误差有多大。 `rmse_e_trn` 意味着在测试集上使用机器学习模型预测的能量误差会有多大。 `rmse_e_val` 意味着在训练集上使用机器学习模型预测的能量误差会有多大。 `rmse_f_tst` and `rmse_f_trn` 表示相同意义，不过是对于力的预测. 你可以使用`Matplotlib` Python包进行作图。

## 使用进阶

### 准备训练数据

前半部分仅仅是让你运行DeePMD-kit进行训练。为了训练一个针对你的体系的模型，你需要自己来准备数据。这些数据都是第一性原理计算得到的数据。这些数据可以是单点能计算得到的数据，或者是分子动力学模拟得到的数据。作为数据集需要的数据有：

- 体系的结构文件：`coord.npy`
- 体系的结构文件对应的元素标记：`type.raw`
- 体系的结构文件对应的能量：`energy.npy`
- 体系的结构文件对应的力：`force.npy`
- 体系的结构文件对应的晶胞大小，如果是非周期性体系，请在训练文件里准备一个超大周期边界条件：`box.npy`

代码块里的文件名为DeePMD-kit使用的命名。`npy`后缀为Python的numpy代码包生成的文件，请在此之前学习numpy。如果你使用`cp2k`得到数据，你会有 `*pos-1.xyz` 和 `*frc-1.xyz` 文件。你可以使用[帮助](#extra-support)的脚本转化成DeePMD-kit的数据集格式。

现在我们来看看DeePMD-kit的训练数据格式。之前我们训练的水模型的数据集储存在 `<deepmd repository>/examples/water/data/data_0`. 让我们来看看数据集的目录结构：

```bash
# directory structre for training data
.
├── data_0
│   ├── set.000
│   │   ├── box.npy
│   │   ├── coord.npy
│   │   ├── energy.npy
│   │   └── force.npy
│   ├── type.raw
│   └── type_map.raw
├── data_1
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
│   ├── type.raw
│   └── type_map.raw
├── data_2
│   ├── set.000
│   │   ├── box.npy
│   │   ├── coord.npy
│   │   ├── energy.npy
│   │   └── force.npy
│   ├── type.raw
│   └── type_map.raw
└── data_3
    ├── set.000
    │   ├── box.npy
    │   ├── coord.npy
    │   ├── energy.npy
    │   └── force.npy
    ├── type.raw
    └── type_map.raw
```

显然，我们会看到`type.raw`文件和一堆以`set`开头的目录。`type.raw`文件记录了体系的元素信息。如果你打开你会发现它仅仅记录了一堆数字。这些数字对应着你在`water_se_a.json`中`"type_map":["O","H"]`的信息。此时`0`代表`O`,`1`代表`H`。对应着`["O","H"]`中的位置，其中第一位为0。

```bash
0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
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
         "rcut_smth":    0.50,
         "rcut":     6.00,
         "neuron":       [25, 50, 100],
         "resnet_dt":    false,
         "axis_neuron":  16,
         "seed":     1,
         "_comment":     " that's all"
     },
```
在"training"的"training_data"下
- `"systems":  ["../data/data_0/", "../data/data_1/", "../data/data_2/"]`: 设置包含训练数据的目录。
- `"batch_size": auto`, 这个会根据体系原子数进行分配，不过我们自己通常设置为1，因为体系原子数有400-800个左右。

```json
	"training_data": {
	    "systems":		["../data/data_0/", "../data/data_1/", "../data/data_2/"],
	    "batch_size":	"auto",
	    "_comment":		"that's all"
	}
```
在"training"的"validation_data"下
- `"systems":  ["../data/data_3"]`: 设置包含测试数据的目录。
- `"batch_size": 1`, 这个会根据体系原子数进行分配，不过我们自己通常设置为1，因为体系原子数有400-800个左右。
- `"numb_btch": 3` , 每次迭代中，测试的结构数量为`batch_size`乘以`numb_btch`。
- 更多参数说明，请参考官方文档：[https://deepmd.readthedocs.io/en/latest/train-input.html](https://deepmd.readthedocs.io/en/latest/train-input.html)

!!! warning None
    记住在集群上训练，请使用lsf脚本。

### 开始你的训练

使用如下命令开始:

```bash
dp train input.json
```

!!! warning None
    记住在集群上训练，请使用lsf脚本。



### 重启你的训练

使用以下命令重启:

```bash
dp train input.json --restart model.ckpt
```

!!! warning None
    记住在集群上训练，请使用lsf脚本。



## 使用生成的势能函数进行分子动力学(MD)模拟

当我们完成训练之后，我们需要根据节点文件(`model.ckpt*`)冻结(Freeze)出一个模型来。

利用如下命令，可以冻结模型：

```bash
dp freeze
```

你将会得到一个`*.pb`文件。利用此文件可以使用`LAMMPS`, `ASE`等软件进行分子动力学模拟。

## 利用压缩模型进行产出(Production)

机器学习势能`*.pb`文件进行MD模拟虽然已经非常迅速了。但是还有提升的空间。首先我们需要用1.3/2.0以上版本的deepmd进行训练势能函数，并得到`*.pb`文件。利用1.2版本的deepmd训练得到势能函数也不用担心。可以利用以下命令对1.2版本的势能函数进行转换：

```bash
module load deepmd/1.2	 # convert-to-1.3 是 1.2 版本的一个 subcommand
dp convert-to-1.3 -i 1.2-model.pb -o 1.3-model.pb
```

建议将原训练文件夹备份后复制，我们利用如下命令进行压缩（文件夹下应该含有对应的`input.json`文件和checkpoint文件）：
如果你用的是`deepmd/compress module`，那么则是版本为1.3的model。
```bash
module load deepmd/compress
dp compress input.json -i normal-model.pb -o compressed-model.pb -l compress.log
```

如果你用的是`deepmd/2.0 module`，那么则是版本为2.0的model。

```bash
module load deepmd/2.0
dp compress -i normal-model.pb -o compressed-model.pb -l compress.log
```

### 压缩模型与原始模型对比

测试2080Ti, 显存11G

| 体系                 | 原子数 | 提速前 (ns/day) | 提速后(ns/day) | 提升倍率 |
| -------------------- | ------ | --------------- | -------------- | -------- |
| LIGePS               | 5000   | 0.806           | 3.569          | 4.42     |
| SnO2/water interface | 6021   | 0.059           | 0.355          | 6.01     |
| SnO2/water interface | 5352   | 0.067           | 0.382          | 5.70     |
| SnO2/water interface | 2676   | 0.132           | 0.738          | 5.59     |
| SnO2/water interface | 1338   | 0.261           | 1.367          | 5.23     |
| SnO2/water interface | 669    | 0.501           | 2.236          | 4.46     |
| LiGePS               | 400    | 7.461           | 23.992         | 3.21     |
| Cu13                 | 13     | 51.268          | 65.944         | 1.28     |

SnO2/water interface: 原始模型Maximum 6021 ——> 压缩模型Maximum 54189个原子

## Trouble Shooting

### warning: loc idx out of lower bound

Solution: https://github.com/deepmodeling/deepmd-kit/issues/21

### ValueError: NodeDef missing attr 'T' from ...

当一个模型使用 deepmd/1.2 训练，但是用更高版本的 deepmd-kit (> v1.3) 进行 lammps 任务的时候经常会报这个错，例子：

* [error: Not found: No attr named 'T' in NodeDef when running lammps](https://github.com/deepmodeling/deepmd-kit/discussions/417)

但是，现在发现这个报错在压缩 v1.3 版本模型的时候也会出现。使用下列命令：

```bash
dp compress ${input} --checkpoint-folder ${ckpt} 1.3-model.pb -o compressed-model.pb -l compress.log
```

其中`${input}`和`${ckpt}`分别是对应模型的输入脚本所在路径和检查点目录。在这个例子里，我们仅把需要压缩的模型复制到了工作文件夹下，输入脚本所在路径和检查点目录人工指认。至于为什么这样会报错 ‘ValueError’，目前还没有找到原因。

因此，我们建议**备份之前的训练文件夹，在训练文件夹的一个 copy 下进行压缩任务 **。


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

## 升级到DeePMD-kit 2.0

目前 DeePMD-kit 2.0 正式版已经发布，相比旧版已有众多提升，且压缩模型为正式版特性。目前我们集群上已安装 DeePMD-kit 2.0.3。

### 输入文件

DeePMD-kit 2.0 相比 1.x 在输入文件上做了一定改动，以下给出一个 DeePMD-kit 2.0 输入文件的例子：

```json
{
    "_comment": " model parameters",
    "model": {
        "type_map": [
            "O",
            "H"
        ],
        "descriptor": {
            "type": "se_e2_a",
            "sel": [
                46,
                92
            ],
            "rcut_smth": 0.50,
            "rcut": 6.00,
            "neuron": [
                25,
                50,
                100
            ],
            "resnet_dt": false,
            "axis_neuron": 16,
            "seed": 1,
            "_comment": " that's all"
        },
        "fitting_net": {
            "neuron": [
                240,
                240,
                240
            ],
            "resnet_dt": true,
            "seed": 1,
            "_comment": " that's all"
        },
        "_comment": " that's all"
    },
    "learning_rate": {
        "type": "exp",
        "decay_steps": 5000,
        "start_lr": 0.001,
        "stop_lr": 3.51e-8,
        "_comment": "that's all"
    },
    "loss": {
        "type": "ener",
        "start_pref_e": 0.02,
        "limit_pref_e": 1,
        "start_pref_f": 1000,
        "limit_pref_f": 1,
        "start_pref_v": 0,
        "limit_pref_v": 0,
        "_comment": " that's all"
    },
    "training": {
        "training_data": {
            "systems": [
                "../data/data_0/",
                "../data/data_1/",
                "../data/data_2/"
            ],
            "batch_size": "auto",
            "_comment": "that's all"
        },
        "validation_data": {
            "systems": [
                "../data/data_3"
            ],
            "batch_size": 1,
            "numb_btch": 3,
            "_comment": "that's all"
        },
        "numb_steps": 1000000,
        "seed": 10,
        "disp_file": "lcurve.out",
        "disp_freq": 100,
        "save_freq": 1000,
        "_comment": "that's all"
    },
    "_comment": "that's all"
}
```

DeePMD-kit 2.0 提供了对验证集（Validation Set）的支持，因而用户可指定某一数据集作为验证集，并输出模型在该数据集上的误差。
相比旧版而言，新版输入文件参数的具体含义变化不大，除了对数据集的定义外，大部分参数含义保持一致。

以下列出一些需要注意的事项：

1. 训练数据集不再直接写在 `training` 下，而是写在 `training` 的子键 `training_data` 下，格式如下所示：
   ```json
   "training_data": {
            "systems": [
                "../data/data_0/",
                "../data/data_1/",
                "../data/data_2/"
            ],
            "batch_size": "auto"
        }
   ```
   默认情况下，每一训练步骤中，DeePMD-kit随机从数据集中挑选结构加入本轮训练，这一步骤加入数据的多少取决于 `batch_size` 的大小，此时，各 system 中数据被使用的概率是均等的。
   若希望控制各 system 数据的权重，可使用 `auto_prob` 来控制，其参数选项如下所示
      - `prob_uniform`: 各 system 数据权重均等。
      - `prob_sys_size`: 各 system 数据的权重取决于其各自的大小。
      - `prob_sys_size`: 写法示例如下：`sidx_0:eidx_0:w_0; sidx_1:eidx_1:w_1;...`。 该参数中，`sidx_i` 和 `eidx_i` 表示第 `i` 组数据的起止点，规则同 Python 语法中的切片，`w_i` 则表示该组数据的权重。在同一组中，各 system 数据的权重取决于各自的大小。
   `batch_size` 的值可手动设定，根据经验一般根据“乘以原子数≤32”的规则设定。新版则支持自动设定，若设定为`"auto"`则表示按照此规则自动设置，若设定为`"auto:N"`则根据“乘以原子数≤N”的规则设定。
2. `save_ckpt`, `load_ckpt`, `decay_rate` 等为过时参数，若由 1.x 迁移，请删除这些参数，否则会导致报错。
3. `n_neuron` 更名为 `neuron`， `stop_batch` 更名为 `numb_steps`，请注意更改。对应地，decay rate 由 `start_lr` 和 `stop_lr` 决定。
4. `lcurve.out` 中删除了测试数据的 RMSE 值，因此旧版作图脚本需要对应修改，减少列数（能量在第3列，力在第4列）。若指定了验证集，则会输出模型在验证集上的 RMSE。

更多详细说明，请参见[官方文档](https://docs.deepmodeling.org/projects/deepmd/en/latest/)。
