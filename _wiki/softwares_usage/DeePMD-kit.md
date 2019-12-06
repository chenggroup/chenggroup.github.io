---
Title: DeePMD-kit Usage Guide
Authors: Yongbin Zhuang

---

# DeePMD-kit Usage Guide

## Short Introduction

DeePMD-kit is a tool used to train Machine Learning Potential which mainly develped by Linfeng Zhang, Han Wang. Jianxing Huang and Yongbin Zhuang had a short time involving the develpment and implementation of DeePMD-kit. If there has any question, ask them.

The following link is for your information:

- [Official Website](http://www.deepmd.org)

- For Install this code: see [Installation Guide](#{{ site.baseurl }}/wiki/softwares#deepmd-installation-guide)

  



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

