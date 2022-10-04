---
title: CP2K:SCAN泛函
authors: 庄永斌
comments: true
---

# CP2K: SCAN泛函

## 学习目标

- 学习资料

- SCAN基本原理

- CP2K SCAN泛函设置

- CP2K SCAN泛函的问题

  

## 学习资料

Sun, J., Remsing, R. C., Zhang, Y., Sun, Z., Ruzsinszky, A., Peng, H., … Perdew, J. P. (2016). Accurate first-principles structures and energies of diversely bonded systems from an efficient density functional. *Nature Chemistry*, *8*(9), 831–836. https://doi.org/10.1038/nchem.2535

Sun, J., Remsing, R. C., Zhang, Y., Sun, Z., Ruzsinszky, A., Peng, H., … Perdew, J. P. (2015). SCAN: An Efficient Density Functional Yielding Accurate Structures and Energies of Diversely-Bonded Materials, 1–19. Retrieved from http://arxiv.org/abs/1511.01089



## SCAN基本原理

SCAN泛函属于MetaGGA的一类。加入了密度梯度的二阶导数。近年来，SCAN泛函被用于水的计算研究逐渐增多，同时对于半导体**体相**计算的能带也比较准。

## CP2K SCAN泛函设置

SCAN泛函并不是CP2K源码自带，实际是引用了libxc中的泛函函数。只有CP2K4.1以上版本的libxc库才能够使用SCAN泛函

```cp2k
&XC_FUNCTIONAL
     &LIBXC
        FUNCTIONAL MGGA_X_SCAN
     &END LIBXC
     &LIBXC
        FUNCTIONAL MGGA_C_SCAN
     &END LIBXC
&END XC_FUNCTIONAL
```

SCAN泛函有一套自己对应的赝势，放在Hutter的github库中。

具体可以参考以下[谷歌论坛链接](https://groups.google.com/g/cp2k/c/k0M3XuOdIHI/m/TEeDFRMwAAAJ)

https://github.com/juerghutter/GTH/blob/master/SCAN/POTENTIAL

主集群上我已经放置了一份SCAN赝势。名称为GTH-SCAN-POTENTIAL

cp2k 输入文件设置为如下即可：

```cp2k
POTENTIAL_FILE_NAME GTH-SCAN-POTENTIAL
```



## CP2K SCAN泛函的问题

SCAN泛函对于有大量真空的体系似乎非常难以收敛。笔者至今试用过了Hematite Slab模型和SrTiO3模型，均无法正常收敛。其他意见参考[谷歌论坛](https://groups.google.com/g/cp2k/c/NEDn71kyD8E/m/FLL2BpGjAAAJ)。如有任何建议建议快速联系笔者。

