---
title: 如何整理项目文件
Authors: 庄永斌
comments: true
---



# 如何归档/整理项目文件

## 数据整理的必要性

为了能让接收项目的人，以及组里其他人的数据能够相互参考，避免不必要的重复计算和浪费。我与云霈总结了一些简单的整理规则。

## 数据整理的规则

### 规则1:

以项目名称命名大文件夹。例：SnO2110面的机器学习

```bash
SnO2110-ML #项目文件名
```



### 规则2:

以**数字**作为目录名前缀，以下**划线命名法**来给目录命名。

因为计算必定伴随着**目的**，所以目录名以计算的**目的**来命名。

**数字**可以使目录按照自己的意志来排序，**下划线命名法**可以有效的阅读。例：

```bash
./SnO2110-ML
├── 00.train_set #放训练集
├── 01.train_set_test #做训练集测试
├── 02.DP_Pots #放机器学习势能
├── 03.dissociation #计算解离度
├── 04.surface_tension #计算表面张力
```

注意：再次一级目录可不按照以上方法来命名，尽量使用**下划线命名法**即可。



### 规则3:

对于**作图类的目录**，要保留作图的**数据**，**原始脚本**和**作出来的图**。例：

```bash
01.train_set_test
├── TrainSetEnergy.pdf #作出来的图
├── TrainSetForce.png #作出来的图
├── TrainingSetError.py #处理作图的脚本 可以直接运行！
├── e.out #作图的原始数据
└── f.out #作图的原始数据
```



对于**计算类的目录**，要保留**必要的输出文件**和**输入文件**。例：

```bash
02.DP_Pots #放机器学习势能
├── v1.0 #版本号
│   ├── graph.000.pb #势能函数，输出文件的一种
│   ├── graph.001.pb
│   ├── graph.002.pb
│   ├── graph.003.pb
│   ├── input.000.json #对应的输入文件
│   ├── input.001.json
│   ├── input.002.json
│   └── input.003.json
├── v1.2
│   ├── graph.000.pb
│   ├── graph.001.pb
│   ├── graph.002.pb
│   ├── graph.003.pb
│   ├── input.000.json
│   ├── input.001.json
│   ├── input.002.json
│   └── input.003.json
└── v1.3
    ├── README
    ├── graph.000.pb
    ├── graph.001.pb
    ├── graph.002.pb
    └── graph.003.pb
```

### 规则4:

在文件夹里放入必要的说明文件，例如**README**

```bash
└── v1.3
    ├── README #必要的说明文件，推荐使用markdown语言书写
    ├── graph.000.pb
    ├── graph.001.pb
    ├── graph.002.pb
    └── graph.003.pb
```

```markdown
# README
 converted from v1.2 pot
 compress input use that v1.2 training input
```

