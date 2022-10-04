---
title: CP2K:NEB
authors: 庄永斌
comments: true
---

# CP2K: Nudged Elastic Band

## 学习目标

- 学习资料

- NEB 基本原理

- CP2K NEB设置


## 学习资料

Henkelman, G., Uberuaga, B. P. & Jónsson, H. A climbing image nudged elastic band method for finding saddle points and minimum energy paths. J Chem Phys 113, 9901–9904 (2000).

## NEB 基本原理  

当确定反应物和产物结构后可以找到从反应物到产物的能量最小路径(Minimum Energy Path, MEP). 在能量最小路径上的任意一个结构中，作用在原子上的力都为0. NEB是一种寻找MEP的方法。首先NEB在反应物结构和产物结构之间建立一套结构(称为image或者replica)。 这些相邻的image之间用弹簧力连接(spring force)，形成一条类橡皮筋(Elastic Band)的构造。通过最小化这个Band的力，即可得到MEP。

## CP2K NEB设置

首先把RUN_TYPE设置为`BAND`
```cp2k
&GLOBAL
    RUN_TYPE BAND
&END GLOBAL
```

其次是MOTION部分
```cp2k
&MOTION
    &BAND
        # 提交任务时 总cpu数目为NROC_REP*NUMBER_OF_REPLICA
        NROC_REP 24 #一个image要用多少cpu来算
        NUMBER_OF_REPLICA 8 #创造多少image, 这里是包含初始结构和最终结构的数目。 
        BAND_TYPE CI-NEB #使用Climbing Image NEB方法，具体内容参照文献SEC. IV
        K_SPRING 0.05 弹簧振子的强度，理论上弹簧振子强度不会影响优化的结果
        &CONVERGENCE_CONTROL # 跟结构优化类似
            MAX_FORCE 0.0030
            RMS_FORCE 0.0050
            MAX_DR 0.002
            RMS_DR 0.005
        &END CONVERGENCE_CONTROL
        ROTATE_FRAMES F
        ALIGN_FRAMES F
        &CI_NEB 
            NSTEPS_IT  2 # 在变成CI之前，需要跑正常NEB, 这里设置跑正常NEB的回合数目
        &END CI_NEB
        &OPTIMIZE_BAND
            OPT_TYPE DIIS
            &DIIS
                NO_LS T
                MAX_STEPS 1000
                N_DIIS 3
            &END DIIS
        &END OPTIMIZE_BAND
        &REPLICA #初始结构的坐标
            &COORD
            @include init.xyz # 只包含坐标xyz，不需要元素，
            &END COORD
        &END REPLICA
        &REPLICA # 最终结构的坐标
            &COORD
            @include fin.xyz # 只包含坐标xyz，不需要元素，
            &END COORD
        &END REPLICA
    &END BAND
&END MOTION
```
