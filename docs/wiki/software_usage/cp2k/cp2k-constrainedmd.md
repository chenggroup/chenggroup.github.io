---
title: CP2K:ConstrainedMD
authors: 刘云霈, 庄永斌
comments: true
---

# CP2K: Constrained MD

## 学习目标

- 学习资料

- CP2K Constrained MD 设置


  

## 学习资料

[官网例子, NaCl解离能](https://www.cp2k.org/exercises:2014_ethz_mmm:nacl_free_energy)

Sun, JJ., Cheng, J. Solid-to-liquid phase transitions of sub-nanometer clusters enhance chemical transformation. [*Nature Communication*, *10*, 5400 (2019).](https://doi.org/10.1038/s41467-019-13509-3)



## CP2K DFT+U设置


CP2K 提供了将施加 Constraint 过程中的拉格朗日乘子输出的能力，其统计平均即该反应坐标下的Potential of Mean Force (PMF)。
PMF对反应坐标积分即反应自由能。MLMD 可实现高精度长时间尺度模拟，因而适用于计算化学反应体系的自由能。
这里我们可结合 DeePMD 势进行 Constrained MD 模拟。

首先定义 Collective Variable (CV)，这里我们选择两原子间距离进行控制：

```bash
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

```bash
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
```

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

