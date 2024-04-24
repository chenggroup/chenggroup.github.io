---
title: LAMMPS开发准备
authors: 
  - 朱嘉欣
comments: true
---

# LAMMPS开发准备

## 为什么要学习LAMMPS开发？

作为一个开源的分子动力学模拟软件，LAMMPS在计算化学中有非常广泛的应用。现有的LAMMPS发行版本提供了大量的功能，大多数时候可以满足用户的需求。但是，有时候我们仍需要实现一些新的功能，或者对现有功能进行修改。此时，就需要我们对LAMMPS开发有大致了解。本教程面向已掌握LAMMPS的基本功能的用户，希望通过本教程的学习，读者可以掌握LAMMPS的基本开发方法，为自己的研究工作提供更多的可能性。考虑到现在已经有一些关于LAMMPS开发的教程（贴于下方），本教程将基于chenglab组内情况进行介绍。

## 阅读资料

1. [官方开发指南](https://docs.lammps.org/Developer.html)

  非常全面的开发指南，包括了LAMMPS的代码结构、并行算法等，但是篇幅较长。建议优先阅读[代码架构](https://docs.lammps.org/Developer_org.html)和[单步中调用的功能](https://docs.lammps.org/Developer_flow.html)。

2. [Extending and Modifying LAMMPS Writing Your Own Source Code: A pragmatic guide to extending LAMMPS as per custom simulation requirements](https://zhuanlan.zhihu.com/p/351359876)
  
    详细介绍了如何在LAMMPS中添加新的功能，可以根据需求找到对应的案例进行学习。

如果你没有任何代码经验，建议先根据基础完成以下的内容学习：

1. [LAMMPS基础](https://lammpstutorials.github.io)
2. [Git基础](https://www.liaoxuefeng.com/wiki/896043488029600)
3. C++基础（请根据自己的代码基础选择合适的教程，比如C++ Primer Plus）
