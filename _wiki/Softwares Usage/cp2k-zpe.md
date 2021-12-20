---
title: CP2K:ZPE
authors: Jinyuanhu

---

# CP2K: ZPE

## 学习目标

- ZPE基本原理

- CP2K Frequence设置

- CP2K Frequency计算结果检查

- 单分子Frequence计算注意事项

  

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
  NPROC_REP 192
  DX 0.02
  FULLY_PERIODIC
  #  THERMOCHEMISTRY TRUE
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
其中NPROC_REP为计算使用的总核数，通常与提交作业的lsf文件中的核数一致(总核数=节点数*核数)。
3. 



## CP2K Frequency计算结果检查

在[CP2K_INPUT](https://manual.cp2k.org/cp2k-8_1-branch/CP2K_INPUT.html) / [FORCE_EVAL](https://manual.cp2k.org/cp2k-8_1-branch/CP2K_INPUT/FORCE_EVAL.html) / [DFT](https://manual.cp2k.org/cp2k-8_1-branch/CP2K_INPUT/FORCE_EVAL/DFT.html)下

```cp2k
PLUS_U_METHOD .TRUE.
```

在[CP2K_INPUT](https://manual.cp2k.org/cp2k-8_1-branch/CP2K_INPUT.html) / [FORCE_EVAL](https://manual.cp2k.org/cp2k-8_1-branch/CP2K_INPUT/FORCE_EVAL.html) / [SUBSYS](https://manual.cp2k.org/cp2k-8_1-branch/CP2K_INPUT/FORCE_EVAL/SUBSYS.html) / [KIND](https://manual.cp2k.org/cp2k-8_1-branch/CP2K_INPUT/FORCE_EVAL/SUBSYS/KIND.html) / [DFT_PLUS_U](https://manual.cp2k.org/cp2k-8_1-branch/CP2K_INPUT/FORCE_EVAL/SUBSYS/KIND/DFT_PLUS_U.html)下

对想要+U的元素的对应KIND设置

```cp2k
&DFT_PLUS_U
    # 轨道角动量 0 s轨道 1 p轨道 2 d轨道 3 f轨道
    L 2 
    # 有效U值，记得写[eV]，不然默认为原子单位
    U_MINUS_J [eV]  3 
&END DFT_PLUS_U
```



## 单分子Frequence计算注意事项

如果我们想知道+U之后对应原子中，例如d轨道的电子，的占据情况。我们可以利用如下设置将其print在output中。

在[CP2K_INPUT](https://manual.cp2k.org/cp2k-8_1-branch/CP2K_INPUT.html) / [FORCE_EVAL](https://manual.cp2k.org/cp2k-8_1-branch/CP2K_INPUT/FORCE_EVAL.html) / [DFT](https://manual.cp2k.org/cp2k-8_1-branch/CP2K_INPUT/FORCE_EVAL/DFT.html) / [PRINT](https://manual.cp2k.org/cp2k-8_1-branch/CP2K_INPUT/FORCE_EVAL/DFT/PRINT.html) / [PLUS_U](https://manual.cp2k.org/cp2k-8_1-branch/CP2K_INPUT/FORCE_EVAL/DFT/PRINT/PLUS_U.html)下，

```cp2k
&PLUS_U MEDIUM
    ADD_LAST NUMERIC
&END PLUS_U
```

你会在output中得到如下输出

```cp2k
  DFT+U occupations of spin 1 for the atoms of atomic kind 3: Fe1

    Atom   Shell       d-2     d-1      d0     d+1     d+2   Trace
      37       1     1.068   1.088   1.047   1.093   1.069   5.365
      37       2     0.008   0.008   0.011   0.007   0.009   0.043
           Total     1.076   1.096   1.058   1.100   1.077   5.408

      38       1     1.064   1.102   1.047   1.089   1.086   5.388
      38       2     0.009   0.007   0.011   0.009   0.008   0.044
           Total     1.073   1.109   1.058   1.097   1.094   5.432
```




