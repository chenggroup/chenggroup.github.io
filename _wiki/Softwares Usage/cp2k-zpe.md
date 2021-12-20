---
title: CP2K:ZPE
authors: Jinyuanhu

---

# CP2K: ZPE

## 学习目标

- ZPE基本原理

- CP2K Frequence设置

- CP2K Frequency计算结果检查

- ZPE求解

- Frequence计算注意事项

  

## ZPE基本原理

Dudarev, S. L., Manh, D. N., & Sutton, A. P. (1997). Effect of Mott-Hubbard correlations on the electronic structure and structural stability of uranium dioxide. *Philosophical Magazine B: Physics of Condensed Matter; Statistical Mechanics, Electronic, Optical and Magnetic Properties*, *75*(5), 613–628. https://doi.org/10.1080/13642819708202343

Dudarev, S. L., Botton, G. A., Savrasov, S. Y., Humphreys, C. J., & Sutton, A. P. (1998). Electron-energy-loss spectra and the structural stability of nickel oxide: An LSDA+U study. *Physical Review B*, *57*(3), 1505–1509. https://doi.org/10.1103/PhysRevB.57.1505



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
      LIST 1..320 # 计算时需要固定的原子对应的序号
    &END
  &END
&END MOTION
```

## CP2K Frequency计算结果检查

正常计算结束会输出project-VIBRATIONS-1.mol文件,里面[FREQ]模块即为计算得到的frequence(unit:cm^-1)

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
CP2K计算得到的Frequence是波长的倒数$\frac{1}{\lambda}$,单位为$cm^{-1}$,根据$\frac{1}{\omega}=\frac{\lambda}{c}$可以计算得到振动频率$\omega$,N对应计算的原子个数


## Frequence计算注意事项
(1) 由于PBC条件的限制，CP2K的Frequence计算结果中不包含平动频率，是否包含转动频率取决于体系的状态(CONSTRAINT)，通常振动频率远大于转动频率。

(2) 计算真空中一个分子的Frequence时，要去除盒子所有方向的周期性，通常可以用$20Å\times20Å\times20Å$的盒子进行测试，有时出现虚频系计算误差。



