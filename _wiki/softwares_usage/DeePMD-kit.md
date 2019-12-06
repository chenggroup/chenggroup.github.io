---
title: DeePMD-kit Usage Guide
authors: Yongbin Zhuang

---

# DeePMD-kit Usage Guide

## Short Introduction

DeePMD-kit is a tool used to train Machine Learning Potential which mainly develped by Linfeng Zhang, Han Wang. Jianxing Huang and Yongbin Zhuang had a short time involving the develpment and implementation of DeePMD-kit. If there has any question, ask them.

The following link is for your information:

- [Official Website](http://www.deepmd.org)

- For Install this code: see [Installation Guide]({{ site.baseurl }}/wiki/softwares#deepmd-installation-guide)

  

## First Taste

### Run you first Machine Learning Training

If you are in the chenglab51 cluster, use deepmd by `lsf` script. Please download the deepmd-kit from github, we will use example of water.

```bash
git clone https://github.com/deepmodeling/deepmd-kit.git
```

Now go to the directory containing water example

```bash 
cd <deepmd repositoy>/examples/water/train/
```

You will see many `json` file inside. These are example files of deepmd training input. Just take file `water_se_a.json`. Copy the `lsf` script from `/share/base/script/deepmd.lsf ` to this directory and open it. 

```bash
cp /share/base/script/deepmd.lsf ./
vim deepmd.lsf
```

You will have to modify the input file name in the `lsf` script. In the last line `dp train input.json 1>> train.log 2>> train.log `. Replace `input.json` into `water_se_a.json`. And change the value of `CUDA_VISIBLE_DEVICES` to one of the number in 0, 1, 2, 3. This command select which GPU you will use in training. For g001, there exist four GPUs. Make sure that your task is not submitted to the GPU which is current running the task of other people. To check which GPU is available, use command `ssh g001`, then `nvidia-smi`, you will see the GPU usage.

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

# select the very GPU(0,1,2,3) for training
CUDA_VISIBLE_DEVICES=0

dp train input.json 1>> train.log 2>> train.log 
```

Submit the job by:

```bash
#submit your job
bsub < deepmd.lsf
#check your job by
bjobs 
```

When your job is runing, you will find following new files in your directory

- `train.log`: log file containing your training information
- `lcurve.out`: learning curve of machine learning process
- `model.ckpt.data-00000-of-00001`, `model.ckpt.index`, `checkpoint`, `model.ckpt.meta`: check point file used to restart deepmd training

Congratulation! You have successfuly run your first deepmd training.

### Browse Output file

Use `less` command to browse your files

```bash
less train.log
```

You will see following message in the end of your file

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

The number following from batch is how many structure you have put into training so far. This batch number will appear after every 100 batches training. The training time is the time you training 100 batches. Testing Time is the time you test the current machine learning model. The frequence of print message is set on the line `"disp_freq":  100` in the `water_se_a.json` file. This means after every 100 batch training you will get a message.

Browse your `lcurve.out`

```bash
less lcurve.out
```

You will see,

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

These numbers show the error of current machine learning model on the training set and testing set. Let's focus on the column, `l2_e_tst`, `l2_e_trn`, `  l2_f_tst` and ` l2_f_trn`. `l2_e_tst` means the error for the predicted energy on the testing set. `l2_e_trn` means the error for energy on the training set.  `  l2_f_tst` and ` l2_f_trn` are same as above but they are for forces.



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

