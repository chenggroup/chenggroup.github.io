---
title: CP2K:能量与力的计算
authors: Yongbin Zhuang
comments: true
---

# CP2K能量与力的计算

## 学习目标

- 认识CP2K的基础输入文件

- 认识CP2K输入文件的主要部分

- 运行计算

  

[计算文件下载](https://github.com/chenggroup/cp2k_tutorial/tree/main/00.calculate_energy_and_force)

本教程改编自[CP2K原教程](https://www.cp2k.org/howto:static_calculation)，以半导体和OT为例子，更符合组内需求。

## 认识CP2K的基础输入文件

原则上来说CP2K的输入文件只需要三个，一个是输入参数的设置文件`input.inp`，一个是赝势的参数文件`GTH_POTENTIALS`，一个是基组的参数文件`BASIS_SET`。

在集群上，管理员已经把`GTH_POTENTIALS`和`BASIS_SET`放置在特定文件夹，并且使用[特殊的链接方法](./cp2k.md#设置cp2k环境变量)可以让CP2K程序自动寻找到。因此在后文中涉及到赝势和基组的部分可以直接填写对应的文件名称。

## 认识CP2K输入文件的主要部分

现在让我们打开`input.inp`

CP2K的输入文件主要包含两个SECTION.

- "GLOBAL": 一些让CP2K跑起来的通用选项，比如任务名称，任务类型。
- "FORCE_EVAL": 包含了所有跟求解原子的力有关的参数设置，也包括了原子的坐标信息

现在我们先看`GLOBAL` 

```
 &GLOBAL
   PROJECT Universality
   RUN_TYPE ENERGY_FORCE
   PRINT_LEVEL
 &END GLOBAL
```

当要计算体系的力和能量时，我们必须在`RUN_TYPE`中对计算的类型进行指定。比如`RUN_TYPE ENERGY_FORCE`就是对当前的体系进行力和能量的计算。其他类型的计算可以在CP2K手册里找到。

`PROJECT`定义了这个计算的项目名称，通常被用来命名一些输出文件。

`PRINT_LEVEL`定义了CP2K `output`文件里输出信息量的大小。

现在我们接着看`FORCE_EVAL`

```
METHOD Quickstep
```

`METHOD Quickstep`表明选择了使用密度泛函理论(Density Functional Theory)中的GPW方法进行计算原子受力。

```
   &SUBSYS
     &CELL
       ABC [angstrom]    4.593 4.593 2.959
     &END CELL
     &COORD
 @include rutile.xyz
     &END COORD
     &KIND O
       BASIS_SET DZVP-MOLOPT-SR-GTH
       POTENTIAL GTH-PBE-q6
     &END KIND
     &KIND Ti
       BASIS_SET DZVP-MOLOPT-SR-GTH
       POTENTIAL GTH-PBE-q12
     &END KIND
   &END SUBSYS
```

Subsection `SUBSYS`定义了模拟的晶胞大小(ABC晶胞长度角度等)和原子坐标的初始结构. 有关于`@include`的用法，请参考[这里](https://manual.cp2k.org/cp2k-8_2-branch/index.html)

Subsection `KIND` 定义了计算中出现的元素。对于每一种元素必须要有一个对应的`KIND` Section. 然后在`KIND`里面定义它的基组(BASIS_SET)和赝势(POTENTIAL)。

BASIS_SET和POTENTIAL的名称一定要对应到基组文件里和赝势文件里存在的条目。

```
 O GTH-PBE-q6 GTH-PBE
     2    4
      0.24455430    2   -16.66721480     2.48731132
     2
      0.22095592    1    18.33745811
      0.21133247    0

```



Subsection `CELL` 定义了模拟中的晶胞大小。 此例子中，ABC指的是晶胞的边长。如不额外指定角度，默认为90, 90, 90度。`[angstrom]`是指定长度单位。

Subsection `COORD`定义初始的原子坐标。 原子位置的默认格式为

```
<ATOM_KIND> X Y Z
```

X Y Z 为笛卡尔坐标，单位为Angstrom。如果添加`SCALED .TRUE.`，便是分数坐标。

Subsection `DFT` 控制了所有跟DFT计算有关的细节。该Subsection只有当你把method选择为`quickstep`时才会起作用。

```
BASIS_SET_FILE_NAME  BASIS_SET
POTENTIAL_FILE_NAME  GTH_POTENTIALS
```

`BASIS_SET_FILE_NAME`和`POTENTIAL_FILE_NAME`定义了基组和赝势的文件路径。由于管理员已经在集群上设置好了路径，用户直接填写这两个文件名即可。

```
&QS
  EPS_DEFAULT 1.0E-13
&END QS
```

Subsection`QS`包含了一些通用的控制参数。`EPS_DEFAULT`设置了所有`quickstep`会用到的默认容忍度。

```
     &MGRID
       CUTOFF 400
       REL_CUTOFF 60
     &END MGRID
```



Subsection `MGRID` 定义了如何使用`quickstep`中的积分网格。`quickstep`使用了多网格方法来表示高斯函数。比较窄和尖的高斯函数会被投影到更精细的网格，而宽和顺滑的高斯函数则相反。在这个例子中，我们告诉代码需要设置最精细的网格为400Ry，并且REL_CUTOFF为60Ry。关于CUTOFF和REL_CUTOFF方面请[阅读](https://www.cp2k.org/howto:converging_cutoff)

Subsection `XC`

```
     &XC
       &XC_FUNCTIONAL PBE
       &END XC_FUNCTIONAL
     &END XC

```

这里定义了我们想使用的交换-关联密度泛函，在这个例子中我们选择了PBE泛函。P泛函要与基组和赝势的选择一致。

```
     &SCF
       SCF_GUESS ATOMIC
       EPS_SCF 3.0E-7
       MAX_SCF 50
       &OUTER_SCF
         EPS_SCF 3.0E-7
         MAX_SCF 10
       &END OUTER_SCF
       &OT
         MINIMIZER DIIS
         PRECONDITIONER FULL_SINGLE_INVERSE
       &END OT
     &END SCF
```

`SCF_GUESS`设置了应该如何生成初始的尝试电子密度。在这个例子中，初始密度是由原子电荷密度重叠生成的。一个好的电子密度可以帮助CP2K快速得到收敛结果。`EPS_SCF`设置了电子密度差异的容忍度（收敛精度要求）。这个会覆盖`EPS_DEFAULT`设置的值。`MAX_SCF`指最多会迭代多少次。

Subsection `OUTER_SCF`这里暂时先不多介绍，但是一般精度设置要跟以上的EPS_SCF一样。以上的SCF为INNER_SCF。`OUTER_SCF`设置`MAX_SCF` 为10。在计算中实际上会迭代的次数是`INNER_SCF`乘以`OUTER_SCF`，即50*10，500次。

Subsection `OT`是利用Orbital Transformation的方法来优化波函数。

```
&PRINT
  &FORCES ON
  &END FORCES
&END PRINT
```

这个subsection可以在output里打印出体系的原子受力。

## 运行计算

正常运行CP2K的方法为

```
mpirun -n 32 cp2k.popt input.inp > output & 
```

在集群上，我们使用lsf脚本文件提交，这行命令已经写在了脚本文件里，请直接提交。

## 输出结果

在任务结束后，你会得到如下文件

- `output`
- `Universality-RESTART.wfn`
- `Universality-RESTART.wfn.bak-1`
- `Universality-RESTART.wfn.bak-2`
- `Universality-RESTART.wfn.bak-3`

文件`output`包含了计算的主要输出。`Universality-RESTART.wfn`是计算最后得到波函数。`Universality-RESTART.wfn.bak-<n>`记录了最后第\<n\>步前SCF得到的波函数。此例中，`Universality-RESTART.wfn.bak-1`是SCF最后一步的波函数。

但你想要利用波函数重启计算时，可以改为`SCF_GUESS RESTART`

他会自动从`<PROJECT_NAME>-RESTART.wfn`文件开始重启计算。

我们现在详细看一下`output`文件里的部分

```

 SCF WAVEFUNCTION OPTIMIZATION

  ----------------------------------- OT ---------------------------------------
  Minimizer      : DIIS                : direct inversion
                                         in the iterative subspace
                                         using   7 DIIS vectors
                                         safer DIIS on
  Preconditioner : FULL_SINGLE_INVERSE : inversion of
                                         H + eS - 2*(Sc)(c^T*H*c+const)(Sc)^T
  Precond_solver : DEFAULT
  stepsize       :    0.08000000                  energy_gap     :    0.08000000
  eps_taylor     :   0.10000E-15                  max_taylor     :             4
  ----------------------------------- OT ---------------------------------------

  Step     Update method      Time    Convergence         Total energy    Change
  ------------------------------------------------------------------------------
     1 OT DIIS     0.80E-01    0.5     0.15753643      -176.9839582002 -1.77E+02
     2 OT DIIS     0.80E-01    0.8     0.09878604      -178.9306891883 -1.95E+00
     3 OT DIIS     0.80E-01    0.8     0.04863529      -179.6564913758 -7.26E-01
     4 OT DIIS     0.80E-01    0.8     0.03582212      -179.9871432342 -3.31E-01
     5 OT DIIS     0.80E-01    0.8     0.02520552      -180.2247770848 -2.38E-01
     6 OT DIIS     0.80E-01    0.8     0.01876959      -180.4037691134 -1.79E-01
     7 OT DIIS     0.80E-01    0.8     0.01356216      -180.5257615047 -1.22E-01
     8 OT DIIS     0.80E-01    0.8     0.01016476      -180.5867232155 -6.10E-02
     9 OT DIIS     0.80E-01    0.8     0.00712662      -180.6348174041 -4.81E-02
    10 OT DIIS     0.80E-01    0.8     0.00528671      -180.6543176954 -1.95E-02
    11 OT DIIS     0.80E-01    0.8     0.00401555      -180.6682811925 -1.40E-02
    12 OT DIIS     0.80E-01    0.8     0.00331228      -180.6769383021 -8.66E-03
    13 OT DIIS     0.80E-01    0.8     0.00273633      -180.6824801501 -5.54E-03
    14 OT DIIS     0.80E-01    0.8     0.00227705      -180.6858569326 -3.38E-03
    15 OT DIIS     0.80E-01    0.8     0.00189452      -180.6891762522 -3.32E-03
    16 OT DIIS     0.80E-01    0.8     0.00163117      -180.6913433711 -2.17E-03
    17 OT DIIS     0.80E-01    0.8     0.00137647      -180.6931734207 -1.83E-03
    18 OT DIIS     0.80E-01    0.8     0.00119961      -180.6942368984 -1.06E-03
    19 OT DIIS     0.80E-01    0.9     0.00100873      -180.6952066209 -9.70E-04
    20 OT DIIS     0.80E-01    0.8     0.00084472      -180.6960712607 -8.65E-04
    21 OT DIIS     0.80E-01    0.9     0.00073811      -180.6966143834 -5.43E-04
    22 OT DIIS     0.80E-01    0.8     0.00062100      -180.6969845494 -3.70E-04
    23 OT DIIS     0.80E-01    0.8     0.00052079      -180.6972986282 -3.14E-04
    24 OT DIIS     0.80E-01    0.8     0.00044814      -180.6975096788 -2.11E-04
    25 OT DIIS     0.80E-01    0.8     0.00038815      -180.6976499085 -1.40E-04
    26 OT DIIS     0.80E-01    0.8     0.00034010      -180.6977592686 -1.09E-04
    27 OT DIIS     0.80E-01    0.8     0.00029429      -180.6978276824 -6.84E-05
    28 OT DIIS     0.80E-01    0.8     0.00025218      -180.6979007896 -7.31E-05
    29 OT DIIS     0.80E-01    0.8     0.00022927      -180.6979456455 -4.49E-05
    30 OT DIIS     0.80E-01    0.8     0.00020201      -180.6979830729 -3.74E-05
    31 OT DIIS     0.80E-01    0.8     0.00017896      -180.6980145219 -3.14E-05
    32 OT DIIS     0.80E-01    0.8     0.00016066      -180.6980416001 -2.71E-05
    33 OT DIIS     0.80E-01    0.8     0.00014606      -180.6980603801 -1.88E-05
    34 OT DIIS     0.80E-01    0.8     0.00012970      -180.6980811127 -2.07E-05
    35 OT DIIS     0.80E-01    0.8     0.00011431      -180.6980956614 -1.45E-05
    36 OT DIIS     0.80E-01    0.8     0.00009560      -180.6981114298 -1.58E-05
    37 OT DIIS     0.80E-01    0.8     0.00008482      -180.6981210277 -9.60E-06
    38 OT DIIS     0.80E-01    0.8     0.00007281      -180.6981278770 -6.85E-06
    39 OT DIIS     0.80E-01    0.8     0.00006188      -180.6981329264 -5.05E-06
    40 OT DIIS     0.80E-01    0.8     0.00005294      -180.6981368983 -3.97E-06
    41 OT DIIS     0.80E-01    0.8     0.00004688      -180.6981391197 -2.22E-06
    42 OT DIIS     0.80E-01    0.8     0.00004055      -180.6981410282 -1.91E-06
    43 OT DIIS     0.80E-01    0.8     0.00003559      -180.6981421977 -1.17E-06
    44 OT DIIS     0.80E-01    0.8     0.00003040      -180.6981432648 -1.07E-06
    45 OT DIIS     0.80E-01    0.8     0.00002734      -180.6981439881 -7.23E-07
    46 OT DIIS     0.80E-01    0.8     0.00002451      -180.6981445033 -5.15E-07
    47 OT DIIS     0.80E-01    0.8     0.00002178      -180.6981449169 -4.14E-07
    48 OT DIIS     0.80E-01    0.8     0.00001953      -180.6981452985 -3.82E-07
    49 OT DIIS     0.80E-01    0.8     0.00001795      -180.6981455598 -2.61E-07
    50 OT DIIS     0.80E-01    0.8     0.00001622      -180.6981458123 -2.52E-07

  Leaving inner SCF loop after reaching    50 steps.


  Electronic density on regular grids:        -47.9999999967        0.0000000033
  Core density on regular grids:               48.0000000000       -0.0000000000
  Total charge density on r-space grids:        0.0000000033
  Total charge density g-space grids:           0.0000000033

  Overlap energy of the core charge distribution:               0.00000000000007
  Self energy of the core charge distribution:               -379.90298629198736
  Core Hamiltonian energy:                                    102.12467948924306
  Hartree energy:                                             125.99881317904760
  Exchange-correlation energy:                                -28.91865218857406

  Total energy:                                              -180.69814581227070

  outer SCF iter =    1 RMS gradient =   0.16E-04 energy =       -180.6981458123
```

以上显示了我们使用OT DIIS方法进行计算。现在计算已经进行了50个SCF迭代。当然现在还未达到收敛限。我们可以看到最后一个`outer SCF iter = 1`也就是说一个outer SCF包含了一个完整的innter SCF。

```
 ATOMIC FORCES in [a.u.]

 # Atom   Kind   Element          X              Y              Z
      1      1      Ti          0.00000026    -0.00000079     0.00000063
      2      1      Ti          0.00000026    -0.00000027     0.00000004
      3      2      O          -0.07002277     0.07002168    -0.00000018
      4      2      O           0.07002184    -0.07002056     0.00000006
      5      2      O           0.07002270     0.07002086    -0.00000083
      6      2      O          -0.07002229    -0.07002093     0.00000028
 SUM OF ATOMIC FORCES           0.00000000    -0.00000000     0.00000000     0.00000000

```

以上显示了原子受力的情况，我们发现有些原子的受力不接近于0，说明这个系统还没处在最佳的结构位置。



