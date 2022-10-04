---
title: CP2K:Slab计算
authors: 庄永斌
comments: true
---

# CP2K: Slab计算

## 学习目标

- 什么是Slab模型

- CP2K 偶极矫正

- 其他去除周期性的方式

  

## 什么是Slab模型

Slab模型是在三维周期性边界条件下计算固体表面的一种方法。通常选择z方向为表面朝向，即模型的z方向中有一半是真空（无原子）另一半为固体模型。如下图为一个典型的Slab模型:

![image-20210529141736287](https://tva1.sinaimg.cn/large/008i3skNly1gqz9vigobqj304t06adh4.jpg)

## CP2K 偶极矫正

Slab模型虽然是代表表面，但是实际上在z方向是固体-真空-固体-真空-...的交替。如果我们建立的Slab模型在z方向是非对称的，模型就会产生一个沿z方向的偶极。偶极会产生静电势，静电势接着会影响模型的镜像（周期性边界条件）。最后算出来的模型的总能量和力与真实情况是不相符的。因此我们需要方法去矫正这种虚假的静电影响。

一种常用的方法就是偶极矫正，在真空部分加入一个超窄的但是方向相反的偶极。这样一来，固体模型产生的偶极和真空中的偶极就会相互抵消。模型和其镜像之间的静电势影响就会抵消。

具体的设置如下:

在FORCE_EVAL/QS/DFT下开启

```cp2k
SURFACE_DIPOLE_CORRECTION .TRUE.
```



## 其他去除周期性的方式

表面偶极矫正仅有z方向可以去除，若要去除其他三个方向的周期，可以采用另外的设置

在FORCE_EVAL/SUBSYS/CELL下

```
PERIODIC NONE
```

在FORCE_EVAL/DFT/POISSON下

```cp2k
PERIODIC NONE
POISSON_SOLVER MT (其他也可以 笔者仅试过MT)
```

