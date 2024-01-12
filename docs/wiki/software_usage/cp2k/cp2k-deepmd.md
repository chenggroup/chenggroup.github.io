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

```
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

```
&GLOBAL
   PROJECT pmf # (1)!
   RUN_TYPE MD
   PRINT_LEVEL SILENT # (2)!
   WALLTIME 95:00:00 # (3)!
&END GLOBAL
```

1.  根据自己的项目名修改，决定输出文件的名称
2.  如果跑DeePMD, 请务必设置为 **`SILENT`**
3.  推荐稍短于作业的 Walltime 以免截断轨迹

然后我们配置如下的力场参数：

```
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

```
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

## Constrained MD 参数设置

CP2K 提供了将施加 Constraint 过程中的拉格朗日乘子输出的能力，其统计平均即该反应坐标下的Potential of Mean Force (PMF)。
PMF对反应坐标积分即反应自由能。MLMD 可实现高精度长时间尺度模拟，因而适用于计算化学反应体系的自由能。
这里我们可结合 DeePMD 势进行 Constrained MD 模拟。

首先定义 Collective Variable (CV)，这里我们选择两原子间距离进行控制：

```
&FORCE_EVAL
   ...
   &SUBSYS
      ...
      &COLVAR
         &DISTANCE
            ATOMS 225 226
         &END DISTANCE
      &END COLVAR
      ...
   &END SUBSYS
   ...
&END FORCE_EVAL
```

其中 `225` 和 `226` 即为所需控制键长的原子序号。注意 CP2K 中原子序号从 1 开始。

然后定义所需控制的键长：

```
&MOTION
   &CONSTRAINT
      &COLLECTIVE
         COLVAR 1
         INTERMOLECULAR .TRUE.
         TARGET 3.4015070391941524 # (1)!
      &END COLLECTIVE
      &LAGRANGE_MULTIPLIERS ON
         COMMON_ITERATION_LEVELS 10000000 # (2)!
      &END LAGRANGE_MULTIPLIERS
   &END CONSTRAINT
   ...
&MOTION
```

1.  设置两原子距离的目标值，注意这里的单位是 a.u.
2.  缺省值为1，为防止输出过长的日志文件，请设置为一个大于总步数的值

注意这里 `TARGET` 的单位是 a.u.，请把常用的单位（如 Å）转换为原子单位。

## 附录：物理常数和单位换算

```
*** Fundamental physical constants (SI units) ***

 *** Literature: B. J. Mohr and B. N. Taylor,
 ***             CODATA recommended values of the fundamental physical
 ***             constants: 2006, Web Version 5.1
 ***             http://physics.nist.gov/constants

 Speed of light in vacuum [m/s]                             2.99792458000000E+08
 Magnetic constant or permeability of vacuum [N/A**2]       1.25663706143592E-06
 Electric constant or permittivity of vacuum [F/m]          8.85418781762039E-12
 Planck constant (h) [J*s]                                  6.62606896000000E-34
 Planck constant (h-bar) [J*s]                              1.05457162825177E-34
 Elementary charge [C]                                      1.60217648700000E-19
 Electron mass [kg]                                         9.10938215000000E-31
 Electron g factor [ ]                                     -2.00231930436220E+00
 Proton mass [kg]                                           1.67262163700000E-27
 Fine-structure constant                                    7.29735253760000E-03
 Rydberg constant [1/m]                                     1.09737315685270E+07
 Avogadro constant [1/mol]                                  6.02214179000000E+23
 Boltzmann constant [J/K]                                   1.38065040000000E-23
 Atomic mass unit [kg]                                      1.66053878200000E-27
 Bohr radius [m]                                            5.29177208590000E-11

 *** Conversion factors ***

 [u] -> [a.u.]                                              1.82288848426455E+03
 [Angstrom] -> [Bohr] = [a.u.]                              1.88972613288564E+00
 [a.u.] = [Bohr] -> [Angstrom]                              5.29177208590000E-01
 [a.u.] -> [s]                                              2.41888432650478E-17
 [a.u.] -> [fs]                                             2.41888432650478E-02
 [a.u.] -> [J]                                              4.35974393937059E-18
 [a.u.] -> [N]                                              8.23872205491840E-08
 [a.u.] -> [K]                                              3.15774647902944E+05
 [a.u.] -> [kJ/mol]                                         2.62549961709828E+03
 [a.u.] -> [kcal/mol]                                       6.27509468713739E+02
 [a.u.] -> [Pa]                                             2.94210107994716E+13
 [a.u.] -> [bar]                                            2.94210107994716E+08
 [a.u.] -> [atm]                                            2.90362800883016E+08
 [a.u.] -> [eV]                                             2.72113838565563E+01
 [a.u.] -> [Hz]                                             6.57968392072181E+15
 [a.u.] -> [1/cm] (wave numbers)                            2.19474631370540E+05
 [a.u./Bohr**2] -> [1/cm]                                   5.14048714338585E+03
```
