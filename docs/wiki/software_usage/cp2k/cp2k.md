---
title: CP2K入门
authors: Yongbin Zhuang
comments: true
---

# CP2K 入门

## 学习目标

- 设置CP2K环境变量
- 书写CP2K的输入文件
- 检查CP2K输入文件
- 单点能计算
- 结构优化
- 分子动力学

## CP2K的特色

CP2K同时使用了平面波基组和高斯基组，因此可以在傅立叶空间里描述长程作用力和实空间里描述局域的波函数。使用CP2K进行分子动力学(MD)运算效率很高。CP2K使用了单k点的计算方式，又称为gamma approximation，因此在早期CP2K版本中没有K点的设置。近年仅在单点能中加入了k点的计算。

## 设置CP2K环境变量

### 哪里获取Basis和PseudoPotential文件

[Github](https://github.com/CP2K/CP2K/tree/master/data)

### 省略路径

CP2K需要用到赝势和基组文件。假设这些文件都存在于目录`/somewhere/basis/`下。可以通过设置环境变量`CP2K_DATA_DIR`来让CP2K自己找到文件。

打开自己的 `~/.bashrc`文件. 添加以下命令

```bash
export CP2K_DATA_DIR=/somewhere/basis/
```

之后在使用赝势和基组时可以直接写文件名字而不需要指出路径。

## 书写CP2K输入文件

CP2K输入文件的书写在[CP2K官网](https://www.CP2K.org/howto)中有许多例子，请大家自己上网学习。

除了简单的SECTION, VALUE的书写形式以外，CP2K还提供了一些简单的变量设置条件判断等设定方式，具体参考[CP2K输入参考手册](https://manual.CP2K.org/CP2K-6_1-branch/index.html)。

### 什么是好的输入文件习惯?

CP2K的输入文件参数设置繁杂，往往我们是第一次从头到位写一遍或者直接拿别人的input修改后进行使用。但是这样会造成书写错误或者设置错误频繁发生。提交超算之后被退回来的话排队时间就浪费了。在此笔者有几个建议：

1. 使用`cp2k.popt -c input.inp` 检查输入文件的语法
2. 使用注释(#)来提醒输入文件的设置
3. 使用变量和条件判断来简单的开关CP2K的功能

```
#a good example of input file
#set variable and condition to open/close section in CP2K
#if variable is 0 in condition, it is false, otherwise it is true
@SET HSE06 0

########## This part is HSE06 ##########
@IF ${HSE06}
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
                &PERIODIC
                     NUMBER_OF_SHELLS 0
                &END PERIODIC
                FRACTION 0.25
            &END HF
@ENDIF
```

!!! warning None
    #注释要单独占一行，代码和注释混合会导致input读入错误



## 检查CP2K输入文件

在服务器上，需要通过`module load cp2k/版本号` 来启动CP2K软件。Load后，可以使用`cp2k.popt`命令，这是CP2K软件的主要程序。

CP2K的计算运行是

```bash
cp2k.popt input.inp > output
```

当然在服务器上需要通过提交脚本来执行命令。

由于CP2K输入文件有时较为庞大，经常会有误写或者语法错误的情况发生，为了避免提交之后被退回来，可以先使用命令检查:

```bash
cp2k.popt -c input.inp
```

!!! warning None
    cp2k.popt -c 仅检查是否有语法错误，实际运行的错误不会检查出来



## 单点能计算

参见官网的例子: [CP2K能量和力的计算](https://www.cp2k.org/howto:static_calculation)

参见官网的例子: [CP2K中CUTOFF和REL_CUTOFF的测试](https://www.cp2k.org/howto:converging_cutoff)

## 结构优化

建设中



## 分子动力学

建设中

## CP2K的一些常用工具

[CP2K Vim input 插件](https://www.cp2k.org/tools:vim)

