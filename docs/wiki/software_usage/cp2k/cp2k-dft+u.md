---
title: CP2K:DFT+U
authors: 庄永斌
comments: true
---

# CP2K: DFT+U

## 学习目标

- 学习资料

- DFT+U基本原理

- CP2K DFT+U设置

- DFT+U 查看电子占据态

  

## 学习资料

Dudarev, S. L., Manh, D. N., & Sutton, A. P. (1997). Effect of Mott-Hubbard correlations on the electronic structure and structural stability of uranium dioxide. [*Philosophical Magazine B: Physics of Condensed Matter; Statistical Mechanics, Electronic, Optical and Magnetic Properties*, *75*(5), 613–628.](https://doi.org/10.1080/13642819708202343).

Dudarev, S. L., Botton, G. A., Savrasov, S. Y., Humphreys, C. J., & Sutton, A. P. (1998). Electron-energy-loss spectra and the structural stability of nickel oxide: An LSDA+U study. [*Physical Review B*, *57*(3), 1505–1509. ](https://doi.org/10.1103/PhysRevB.57.1505).

Himmetoglu, B.; Floris, A.; de Gironcoli, S.; Cococcioni, M. Hubbard-Corrected DFT Energy Functionals: The LDA+U Description of Correlated Systems. [International Journal of Quantum Chemistry 2013, 114 (1), 14–49.](https://doi.org/10.1002/qua.24521).

## DFT+U基本原理

DFT对于电子的描述是偏向离域化的，因此DFT可以较好地描述金属态固体。对于过渡金属系列的氧化物，例如Fe2O3，CoO，Co3O4，NiO等。过渡金属中仍然含有d电子。在固体中，d电子较为局域，且局域在过渡金属离子周围。此时单单使用DFT并不能很好的描述局域化的电子。我们可以通过加大d电子之间的静电排斥(U)来达到目的。



## CP2K DFT+U设置

在[CP2K_INPUT](https://manual.cp2k.org/cp2k-8_1-branch/CP2K_INPUT.html) / [FORCE_EVAL](https://manual.cp2k.org/cp2k-8_1-branch/CP2K_INPUT/FORCE_EVAL.html) / [DFT](https://manual.cp2k.org/cp2k-8_1-branch/CP2K_INPUT/FORCE_EVAL/DFT.html)下

```cp2k
PLUS_U_METHOD MULLIKEN
```
其中`MULLIKEN_CHARGES`不推荐， `LOWDIN`方法好像更准但是不能够算FORCES，cp2k v8.2版本后可以算FORCES，(详细参考)[https://groups.google.com/g/cp2k/c/BuIOSWDqJTc/m/fSL89NZaAgAJ]

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



## DFT+U  查看电子占据态

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
如果想看不加U的原子的占据情况，那可以给对应原子加一个非常小的U值，比如1e-20。






