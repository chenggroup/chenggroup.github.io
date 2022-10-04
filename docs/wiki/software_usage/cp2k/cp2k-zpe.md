---
title: CP2K:ZPE
authors: Jinyuanhu
comments: true
---

# CP2K: ZPE(Zero-point energy)

## 学习目标

- ZPE基本原理

- CP2K Frequence设置

- CP2K Frequency计算结果检查

- ZPE求解

- 注意事项

  

## ZPE基本原理

零点能(ZPE)是量子力学系统可能具有的最低可能能量，此时系统所处的态称为基态；所有量子力学系统都有零点能。与经典力学不同，量子系统在Heisenberg不确定性原理所描述的最低能量状态下不断波动。

我们在计算吉布斯自由能($G=E_{DFT}+ZPE-TS^\circ$)时会涉及到零点振动能，零点振动能的计算公式为：

$ZPE=\sum_{i=0}^{3N}\frac{\hbar\omega}{2}$

因此我们需借助CP2K计算得到振动频率$\omega$。

Boyer, T. H. Quantum Energy and Long-Range Forces. Ann. Phys 1970, 56, 474–503.

Girod, M.; Grammaticos, B. The Zero-Point Energy Correction and Its Effect on Nuclear Dynamics. Nucl. Physics, Sect. A 1979, 330 (1), 40–52. https://doi.org/10.1016/0375-9474(79)90535-9.

## CP2K Frequence设置

1. 设置[CP2K INPUT](https://manual.cp2k.org/cp2k-8_1-branch/CP2K_INPUT.html) / [GLOBAL](https://manual.cp2k.org/cp2k-8_2-branch/CP2K_INPUT/GLOBAL.html) / [RUN_TYPE](https://manual.cp2k.org/cp2k-8_2-branch/CP2K_INPUT/GLOBAL.html#list_RUN_TYPE)

```cp2k
RUN_TYPE  VIBRATIONAL_ANALYSIS
```
2. 在[CP2K INPUT](https://manual.cp2k.org/cp2k-8_1-branch/CP2K_INPUT.html) / [VIBRATIONAL_ANALYSIS](https://manual.cp2k.org/cp2k-8_2-branch/CP2K_INPUT/VIBRATIONAL_ANALYSIS.html)下

```cp2k
&VIBRATIONAL_ANALYSIS
  NPROC_REP 192  # 总核数=节点数*核数（通常与提交作业cp2k.lsf文件中的核数一致）
  DX 0.02
  FULLY_PERIODIC
  &PRINT
    &MOLDEN_VIB
    &END
    &CARTESIAN_EIGS
    &END
    &PROGRAM_RUN_INFO
      &EACH
        REPLICA_EVAL 1
      &END
    &END
  &END PRINT
&END VIBRATIONAL_ANALYSIS
```

3. 在[CP2K INPUT](https://manual.cp2k.org/cp2k-8_1-branch/CP2K_INPUT.html) / [MOTION](https://manual.cp2k.org/cp2k-8_2-branch/CP2K_INPUT/MOTION.html)下

```cp2k
&MOTION
  &CONSTRAINT
    &FIXED_ATOMS
      LIST 1..320 # 计算时需要固定的无关原子对应的序号
    &END
  &END
&END MOTION
```

## CP2K Frequency计算结果检查

正常计算结束会输出project-VIBRATIONS-1.mol文件,里面[FREQ]模块即为计算得到的frequence(unit:$cm^{-1}$)

```cp2k
[FREQ]
      204.783042
      296.784083
      379.892297
      414.559665
      913.554709
     3650.225071
```

在CP2K计算NEB的过程中寻找过度态时，过渡态的Frequence中会有虚频，对应负值：

```cp2k
[FREQ]
     -150.004617
       76.011787
       90.652110
      105.659737
      114.363774
      118.342870
      125.738357
      ……
```

## ZPE求解

$ZPE=\sum_{i=0}^{3N}\frac{\hbar\omega_i}{2}$

CP2K计算得到的Frequence是波长的倒数$\frac{1}{\lambda}$,单位为$cm^{-1}$,根据$\frac{1}{\omega}=\frac{\lambda}{c}$可以计算得到振动频率$\omega$；

N对应计算的原子个数。


## 注意事项

(1) 由于PBC条件的限制，CP2K的Frequence计算结果中不包含平动频率，是否包含转动频率取决于体系的状态(CONSTRAINT)，通常振动频率远大于转动频率。

(2) 计算真空中一个分子的Frequence时，要去除盒子所有方向的周期性，通常可以用$20Å\times20Å\times20Å$的盒子进行测试。

(3) 使用CP2K计算一个稳定结构式的频率时，也常会出现多个虚频。这是CP2K计算使用GTH赝势时存在的一个问题。详细内容请参考(https://groups.google.com/forum/?fromgroups#!topic/cp2k/DVCV0epl7Wo)

解决方案有四种：

a. 使用NLCC赝势(http://arxiv.org/abs/1212.6011)。不过NLCC赝势很不完整，只有B-Cl的元素有，且只提供了PBE泛函的赝势。

b. 增大CUTOFF，使用600 Ry以上的CUTOFF。

c. 在XC_GRID部分使用平滑参数SMOOTING，不推荐使用。

d. 在XC_GRID部分使用USE_FINER_GRID。加上这个参数后，XC部分的格点的精度提高为4*CUTOFF。


