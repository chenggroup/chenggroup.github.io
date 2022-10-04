---
title: CP2K:结构和晶胞优化
authors: 庄永斌
comments: true
---

# CP2K: 结构和晶胞优化

## 学习目标

- 学习资料

- 基本原理

- CP2K 结构优化设置

- CP2K 结构优化问题

  

## 学习资料

[Slides](https://www.cp2k.org/_media/events:2015_cecam_tutorial:watkins_optimization.pdf)





## 基本原理

建设中, 参考[官网](https://www.cp2k.org/howto:geometry_optimisation)

## CP2K 结构优化设置

结构优化

```cp2k
&GLOBAL
RUN_TYPE GEO_OPT
&END GLOBAL
```

晶胞优化

```cp2k
&GLOBAL
RUN_TYPE CELL_OPT
&END GLOBAL
```

同时，在MOTION下设置OPTIMIZER和一些CONSTRAIN

```
&MOTION
  &CELL_OPT
    OPTIMIZER LBFGS 
    KEEP_ANGLES
    TYPE DIRECT_CELL_OPT
  &END CELL_OPT
&END MOTION
```

LBFGS是对大体系常用的，BFGS针对小体系，更为Robust的是CG。

KEEP_ANGLES是指保持晶胞的角度不变。

TYPE默认是DIRECT_CELL_OPT，即同时优化晶胞和里面的位置，是最快的优化方法。



## CP2K 结构优化问题

晶胞优化需要计算STRESS TENSOR。通常采用ANALYTICAL方法计算即可，也是最快的方法。但是一些泛函并没有实现相应的STRENSS TENSOR的计算，可以采用NUMERICAL的方法进行计算。比如SCAN。在cp2k v8.2后加入了METAGGA(包括SCAN)的STRESS TENSOR，但是[仅实现 kinetic energy density的部分](https://github.com/cp2k/cp2k/issues/1948)，优化会出问题，原因不明。

