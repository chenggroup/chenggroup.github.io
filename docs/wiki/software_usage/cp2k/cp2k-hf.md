---
title: CP2K:杂化泛函
authors: Yongbin Zhuang
comments: true
---

# CP2K: 杂化泛函

## 学习目标

- 学习资料
- 杂化泛函基本原理
- 杂化泛函辅助基组
- CP2K杂化泛函设置
- 参数的测试和收敛
- 一些元素推荐的ADMM

## 学习资料

[Slides: UCL DFT with Hybrid Functionals](https://www.cp2k.org/_media/events:2015_cecam_tutorial:ling_hybrids.pdf)

[Slides: Hybrid Functional and ADMM](https://www.cp2k.org/_media/events:2018_summer_school:cp2k-uk-stfc-june-2018-sanliang-ling.pdf)



[官方练习](https://www.cp2k.org/exercises:2017_uzh_cp2k-tutorial:hybrid)




## 杂化泛函基本原理

**建设中**

## 杂化泛函辅助基组

**建设中**

## CP2K杂化泛函设置

```cp2k
    # BASIS Purification
    BASIS_SET_FILE_NAME BASIS_ADMM_MOLOPT
    BASIS_SET_FILE_NAME BASIS_ADMM
    &AUXILIARY_DENSITY_MATRIX_METHOD
      METHOD BASIS_PROJECTION
      ADMM_PURIFICATION_METHOD MO_DIAG
    &END AUXILIARY_DENSITY_MATRIX_METHOD
    # KIND 设置例子
    &KIND O
      BASIS_SET DZVP-MOLOPT-SR-GTH
      POTENTIAL GTH-PBE-q6
      BASIS_SET AUX_FIT cFIT3
    &END KIND

```



```cp2k
# HSE06泛函部分
      &XC_FUNCTIONAL
        &PBE
          SCALE_X 0.0
          SCALE_C 1.0
        &END PBE
        &XWPBE
          SCALE_X -0.25
          SCALE_X0 1.0
          OMEGA 0.11
        &END XWPBE
      &END XC_FUNCTIONAL
      &HF
        &SCREENING
          EPS_SCHWARZ 1.0E-6
          SCREEN_ON_INITIAL_P FALSE
        &END SCREENING
        &INTERACTION_POTENTIAL
          POTENTIAL_TYPE SHORTRANGE
          OMEGA 0.11
          T_C_G_DATA t_c_g.dat
        &END INTERACTION_POTENTIAL
        &MEMORY
          MAX_MEMORY 10000
          EPS_STORAGE_SCALING 0.1
        &END MEMORY
        # this depends on user
        &PERIODIC
          NUMBER_OF_SHELLS 0
        &END PERIODIC
        FRACTION 0.25
      &END HF
```



## 参数的测试和收敛

### RESTART波函数

务必使用相同原子结构的PBE泛函优化后的波函数进行重启，可以省下大量机时，除非你很有钱。

在测试参数收敛前**务必**把SCF步数调成1。只要计算的数值收敛即可。 

```
&SCF
      EPS_SCF 3.0E-7
      MAX_SCF 1
&END SCF
```



### EPS_PGF_ORB的收敛

在初次计算中，用户会遇到如下Warning

```
 *** WARNING in hfx_energy_potential.F:605 :: The Kohn Sham matrix is not  ***
 *** 100% occupied. This may result in incorrect Hartree-Fock results. Try ***
 *** to decrease EPS_PGF_ORB and EPS_FILTER_MATRIX in the QS section. For  ***
 *** more information see FAQ: https://www.cp2k.org/faq:hfx_eps_warning    ***
```



这是因为CP2K会根据某些设定的值，来筛选出不需要计算的四电子积分。可以有效降低Hartree-Fock矩阵的计算。如果筛选的积分过多，那么H-F计算出来的结果就会失真。也是此Warning的来源。

控制这个筛选标准的有EPS_PGF_ORB这个参数。越小的话筛选的积分越少，H-F结果也就越真实。通常情况下这个Warning是不会消失的，即使用户调到一个非常小的量级，例如1.0E-20。

我们可以通过比对不同的EPF_PGF_ORB的能量收敛来选择合适的值。

| EPS_PGF_ORB | 能量(a. u.)           | 与上一个的误差 |
| ----------- | --------------------- | -------------- |
| 1.0E-13     | -8402.872803898026177 |                |
| 1.0E-15     | -8402.872803587537419 | -3.1E-07       |
| 1.0E-17     | -8402.872803510470476 | -7.7E-08       |

一般的SCF收敛限在3.0E-7，能量基本也在这个量级以下，因此能量收敛需要达到1.0E-7以下最好。所以我们选择1.0E-15作为EPS_PGF_ORB的值。

### ADMM基组的收敛

与EPS_PGF_ORB类似的是ADMM基组的收敛。对于同一种元素, CP2K提供多了多种基组，例如cFIT10, cFIT11, cFIT12 等...。测试的方法就是逐渐增大ADMM基组。能量误差必须归一到每个原子。通常保证误差在1meV/atom的量级最好。

以SrTiO3体系为例

| ADMM_BASIS For Ti | 能量(a.u.)            | 与上一个的误差(meV/atom) | 原子数 |
| ----------------- | --------------------- | ------------------------ | ------ |
| cFIT10            | -9062.291421862293646 |                          | 368    |
| cFIT11            | -9062.255359275355659 | -2.6                     | 368    |
| cFIT12            | -9062.260056088771307 | 0.3                      | 368    |
| cFIT13            | -9062.210205928951837 | -3.6                     | 368    |

这个时候选择**cFIT10**或者**cFIT11**即可

## 一些元素推荐的ADMM

笔者亲测，通常与体系关系不大。

| 元素 | ADMM基组 |
| ---- | -------- |
| O    | cFIT3    |
| H    | cFIT3    |
| Ti   | cFIT11   |
| Cd   | cFIT10   |
| Sn   | cFIT9    |
| Pb   | cFIT9    |
| Sr   | cFIT9    |
| Pt   | cFIT10   |
| Mg   | cpFIT3   |
| Ba   | cFIT9    |
| Na   | cFIT3    |
| Ta   | cFIT10   |

### 其他Warning处理

其他的Warning在官方文档中有提过
[杂化泛函计算Warning](https://www.cp2k.org/faq:hfx_eps_warning)

Cutoff Radiis Warning
```
*** WARNING in hfx_types.F:1287 :: Periodic Hartree Fock calculation      ***
 *** requested with use of a truncated or shortrange potential. The cutoff ***
 *** radius is larger than half the minimal cell dimension. This may lead  ***
 *** to unphysical total energies. Reduce the cutoff radius in order to    ***
 *** avoid possible problems.                                              ***
 ```

 这是由于在周期边界条件下, CP2K只取HF exchange短程部分，而长程部分则由DFT exchange来补充。因此需要短程的长度，即Cutoff Radiis。 对于该Warning有如下三种处理方式。

 - 如果使用HSE06，请忽视，因为这个cutoff由omega确定。
 - 减少CUTOFF_RADIUS，如果你用的是PBE0-TC
 - 用更大周期边界盒子

[参考](https://groups.google.com/d/msg/cp2k/g1sFck3SYF8/jkseHHuCGQAJ)


