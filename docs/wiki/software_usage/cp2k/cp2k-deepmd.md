---
title: CP2K:DeePMD-kit插件
author: Yunpei Liu
comments: true
---

# CP2K: DeePMD-kit插件

## 学习目标

- 用 CP2K 调用 DeePMD-kit 以进行 MLMD 模拟
- Constrained MD 的参数设置

## 学习资料

CP2K官方手册：

- [Section DEEPMD](https://manual.cp2k.org/trunk/CP2K_INPUT/FORCE_EVAL/MM/FORCEFIELD/NONBONDED/DEEPMD.html) 
- [Section CONSTRAINT](https://manual.cp2k.org/trunk/CP2K_INPUT/MOTION/CONSTRAINT.html) 

## 适用版本

以下教程适用于最新版本加入 DeePMD 支持的 CP2K。
Zeus集群上的 `cp2k/2024.2-dev` 和 `deepmd/2.2.7` （未编译MPI和DFT支持） 可以运行以下教程。

注意 `cp2k/2024.2-dev` 的作业脚本写法如下：

```bash
module load gcc/9.3.0
module load intel/17.5.239
module load cuda/11.8
module load mpi/openmpi/4.1.6-gcc
module load cp2k/2024.2-dev
```

## CP2K MD Section 的输入文件

请先了解CP2K的输入文件语法，指路：

- [CP2K:能量与力的计算](./cp2k-e-f.md) 
- [CP2K:REFTRAJ根据已有MD轨迹计算](./cp2k-reftraj.md)。

由于 MLMD 通常会需要纳秒甚至更长时间尺度的模拟，若未进行适当配置，可能会产生过长的输出文件，因此我们在 `GLOBAL` 下做以下调整:

```bash
&GLOBAL
   PROJECT pmf # (1)!
   RUN_TYPE MD
   PRINT_LEVEL SILENT # (2)!
   WALLTIME 95:00:00 # (3)!
&END GLOBAL
```

1.  根据自己的项目名修改，决定输出文件的名称
2.  如果跑DeePMD, 请务必设置为 **`SILENT`**, 防止输出文件过大
3.  推荐稍短于作业的 Walltime 以免截断轨迹

然后我们配置如下的力场参数：

```bash
&FORCE_EVAL
   METHOD FIST
   &MM
      &FORCEFIELD
         &NONBONDED
            &DEEPMD
               ATOMS C O Pt
               ATOMS_DEEPMD_TYPE 0 1 2 # (1)!
               POT_FILE_NAME ../graph.000.pb
            &END DEEPMD
         &END NONBONDED
         IGNORE_MISSING_CRITICAL_PARAMS .TRUE. # (2)!
      &END FORCEFIELD
      &POISSON
         &EWALD
            EWALD_TYPE none
         &END EWALD
      &END POISSON
   &END MM
   ...
&END FORCE_EVAL
```

1.  与元素列表对应，元素在 `type_map` 中的索引顺序
2.  :warning: 请保留这一行以忽略未定义参数

通常 MLMD 轨迹文件不需要每步都输出，因而通过以下方式设置输出间隔：

```bash
&MOTION
   ...
   &MD
      ...
      &PRINT
         &ENERGY
            &EACH
               MD 100 # (1)!
            &END EACH
         &END ENERGY
      &END PRINT
   &END MD
   &PRINT
      &CELL
         &EACH
            MD 100 # (2)!
         &END EACH
      &END CELL
      &FORCES
         &EACH
            MD 100 # (3)!
         &END EACH
      &END FORCES
      &RESTART_HISTORY
         &EACH
            MD 200000 # (4)!
         &END EACH
      &END RESTART_HISTORY
      &TRAJECTORY
         &EACH
            MD 100 # (5)!
         &END EACH
      &END TRAJECTORY
   &END PRINT
&END MOTION
```

1.  此处修改ener的输出频率，通常与结构轨迹保持一致
2.  此处修改晶胞参数的输出频率，注意如果晶胞参数不变可不写这一部分
3.  此处修改力轨迹的输出频率，通常与结构轨迹保持一致
4.  此处修改restart文件的输出频率，可根据 Walltime 和总步数进行估计
5.  此处修改结构轨迹的输出频率
