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

- Henkelman, G. & Jónsson, H. Improved tangent estimate in the nudged elastic band method for finding minimum energy paths and saddle points.  J. Chem. Phys. 113, 9978–9985 (2000).
  
- Henkelman, G., Uberuaga, B. P. & Jónsson, H. A climbing image nudged elastic band method for finding saddle points and minimum energy paths. J Chem Phys 113, 9901–9904 (2000).

## NEB 基本原理  

当确定反应物和产物结构后可以找到从反应物到产物的能量最小路径(Minimum Energy Path, MEP). 处于能量最小路径上的任意一个结构中，作用在原子上并垂直于MEP的力分量都为0. NEB是一种寻找MEP的方法。首先NEB在反应物结构和产物结构之间建立一套结构(称为image或者replica)。 这些相邻的image之间用弹簧力连接(spring force)，形成一条类橡皮筋(Elastic Band)的构造。其中每个image受到垂直于MEP的真正的力同时受到平行于MEP的弹簧力，通过最小化这个Band的力，即可得到MEP。

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
            @include init.xyz # 第一种方法，只包含坐标xyz，不需要元素
            &END COORD
        &END REPLICA
        &REPLICA # 最终结构的坐标
            &COORD
            @include fin.xyz # 只包含坐标xyz，不需要元素，
            &END COORD
        &END REPLICA
        &REPLICA # 最终结构的坐标
            COORD_FILE_NAME ./tr7.xyz # 第二种方法，这个是正常的xyz文件
        &END REPLICA
        &PROGRAM_RUN_INFO # 看REPLICA间的距离
            INITIAL_CONFIGURATION_INFO
        &END
    &END BAND
&END MOTION
```
注意到如果只定义两个`REPLICA` section，并且小于你的`NUMBER_OF_REPLICA`，那么剩余的`REPLICA`结构将会由CP2K自己生成。
如果定义的`REPLICA` section数目等于`NUMBER_OF_REPLICA`，那么CP2K将不会自动生成`REPLICA`的结构。



## 重新启动NEB

在cp2k input文件里加入`EXT_RESTART` section。并且将`xxx-1.restart`改成你的真实的restart文件。
```cp2k
&EXT_RESTART
  RESTART_BAND
  RESTART_FILE_NAME   xxx-1.restart
&END
```
同时，我们可以利用之前的波函数RESTART,只需要在`FORCE_EVAL/DFT/SCF`下设置
```cp2k
SCF_GUESS RESTART
```
即可。
假设你的PROJECT NAME 是 `water`，见`GLOBAL/PROJECT`，同时你的`NUMBER_OF_REPLICA`为8, 那么你将会生成如下文件
```shell
water-BAND01-RESTART.wfn
water-BAND02-RESTART.wfn
water-BAND03-RESTART.wfn
water-BAND04-RESTART.wfn
water-BAND05-RESTART.wfn
water-BAND06-RESTART.wfn
water-BAND07-RESTART.wfn
water-BAND08-RESTART.wfn
```
其中BAND后面的数字代表`REPLICA`的序数。在重新启动时，则会自动读取这些波函数。如果波函数是通过其他方法生成或者提前准备好的，也可以通过更改波函数的名称使其符合上述规则来启动NEB。