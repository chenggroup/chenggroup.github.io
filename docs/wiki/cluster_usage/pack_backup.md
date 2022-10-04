---
title: 文件整理与备份攻略
author: Yunpei Liu, Yongbin Zhuang
comments: true
---

# 文件整理与备份攻略

> 本文将持续更新

在实际科研工作中，我们时常会遇到文件整理的问题。比如利用 CP2K 通过 Constrained MD 计算 Potential Mean Force 时，会产生大量 Lagrange Multiplier 文件；使用 DP-GEN 训练势函数时，由于 Model Deviation 过程中会生成大量结构文件，每一轮每条轨迹都会有很多，便会使文件总数快速上升；同时，计算过程中会产生波函数、cube等文件，可能会占据大量的空间。如何高效整理这些文件也成为一个难题。

本文将给出一些具体的攻略，供大家参考使用。

## 一些常识

Linux中文件储存上限与`储存空间`和`储存数目`有关系。因此我们不仅需要关注储存空间（文件）大小，还需要关注文件的数目。例如DP-GEN产生的大量碎片化文件和cp2k的potential mean force 产生的大量Lagrange Multiplier文件都会影响文件储存。

以下命令可以查看自己的文件/目录大小

```bash
# 查看当前目录的大小
du -sch .
# 查看某文件的大小
du -sch file_name
# 查看该目录下所有文件/目录大小
du -sch ./*
```



## 文件打包与压缩

### tar命令

对于结构复杂的目录，可以使用 `tar` 命令进行打包或压缩。

`tar` 命令支持压缩或解压缩，其使用方法大致如下：

```bash
打包与压缩: tar [-j|-z] [cv] [-f 创建的档名] filename... 
解压缩: tar [-j|-z] [xv] [-f 创建的档名] [-C 目录]
========
选项与参数：
-c  ：创建打包文件，可搭配 -v 来察看过程中被打包的文件（夹）名(filename)
-x  ：解打包或解压缩的功能，可以搭配 -C (大写) 在特定目录完成解压缩的操作。
-c, -x 不可同时使用，还请注意！
-z  ：通过 gzip 进行压缩/解压缩：此时压缩文件名最好为 *.tar.gz 或 *.tgz
-j  ：通过 bzip2 进行压缩/解压缩：此时压缩文件名最好为 *.tar.bz2
-v  ：在压缩/解压缩的过程中，将正在处理的文件名显示出来。
-f filename：-f 后面要立刻接要被处理的档名！建议 -f 单独写一个选项罗！
-p  ：保留备份数据的原本权限与属性，常用于备份(-c)重要的配置档。
--exclude=FILE：在压缩的过程中，不将文件名为 FILE 的文件打包。
--remove-files：打包后删除被打包的文件。
```

比如希望在 `/some/place` 下打包`/data/userX` 下的所有文件（夹）为 `userX_backup.tgz`，便可以使用命令

```bash
tar -zcvf /some/place/userX_backup.tgz /data/userX/*
```

使用tar命令将文件打包为 `*.tgz` 等压缩档的优点是可以保留软连接，适合用于结构复杂的目录，例如 DP-GEN 项目目录。

如果用户希望将打包后的文件直接删除以节省空间，则可以使用：

```bash
tar -zcvf /some/place/userX_backup.tgz /data/userX/* --remove-files
```

这样在创建压缩档后，程序会删除 `/data/userX/*`。

对于 DP-GEN 等文件数量非常多的任务，直接存储会占据大量的 inode 空间，从而出现明明磁盘空间够却无法写入的尴尬局面，因此可以对已经跑过的 iteration 进行主动打包以减少文件数量，节约 inode 数。同时如果需要进行磁盘级的备份、迁移，处理小文件的速度会大幅放缓，而处理大文件的读写速度反而可以达到硬盘读写速率或网络传输速率的上限。

## 文件删除

### find命令

对于大量具有相似命名的文件，可以利用 `find` 命令进行索引和删除。

例如对当前目录下（`./`），想要查找 `AuO` 任务产生的所有的 `cube` 文件（假设命名均为`AuO_*.cube`），可以采用如下命令进行展示：

```bash
find ./ -name AuO_*.cube
```

如果想要将这些文件直接删除，还可以加入 `-delete` 命令：

```bash
find ./ -name AuO_*.cube -delete
```

!!! warning "注意"
    注意 <code>find</code> 命令后的选项为 <code>-</code> 而非 <code>--</code> 。

## rsync命令

`rsync` 作为常用的文件传输与同步命令，实际上也可以用于将某一文件夹清空，对于有大量小文件的情况相比传统的 `rm` 命令会快很多。例如想要清空 `/some/path` 目录，可以先运行：

```bash
mkdir /tmp/empty
```

然后运行：

 ```bash
rsync --delete -rlptD /tmp/empty/ /some/path
 ```



## 常用软件的文件处理

### cp2k

cp2k在计算中会产生大(量)文件，以下文件可以删除。

- 波函数文件（`.wfn`）：波函数文件储存DFT计算的轨道信息，常用于restart。但`.wfn`文件往往随着体系增大而迅速增大。如无必要（重要波函数），算完之后即可将其删除。
- 网格文件（`.cube`）：这类文件储存着三维空间信息，例如：静电势、分子轨道。大小中等（10MB左右）。按普通AIMD长度（60000步），每50步输出一个会有1200个`.cube`文件。累积下来空间不容小觑。如分析完毕，即可删除，或用压缩工具压缩，或用专业的`bqbtool`压缩。
- 轨迹文件（`.xyz`）: 分子动力学/结构优化输出的轨迹文件，包含普通轨迹文件，速度文件，力文件。普通AIMD长度输出的三个文件基本在1至2GB左右。如使用机器学习势函数会储存大量轨迹数据，常常会达到100GB左右。如分析完毕，即可删除，或用压缩工具压缩，或用专业的`bqbtool`压缩。
- 态密度文件（`.pdos`）: 体系的态密度文件，大小偏小，约为1至2MB左右一个文件，但一个体系会输出多个文件，因此差不多在6至8MB，与网格文件类似，大量积累后会产生空间占用。如分析完毕，即可删除，或用压缩工具压缩。



## 压缩工具: bqbtool

cp2k轨迹文件/网格文件，如舍不得丢掉。可以采用[bqbtool](https://brehm-research.de/bqb.php)进行压缩。bqbtool专门针对此类型文件进行压缩开发的工具，压缩率达到10%。

个人安装参考bqb手册，`51`和`52`服务器上已经安装，使用命令如下：

```bash
# 压缩轨迹文件
bqbtool compress postraj xxx.xyz xxx.bqb
# 压缩cube文件, 可提前把cube文件按顺序cat到一个文件中。
bqbtool compress voltraj xxx.cube xxx.bqb
```

## 集群打包要点

本次`51`和`52`将进行迁移，文件的数目将会影响迁移速度。因此尽可能地把原本目录压缩成几个文件，可以提升迁移速度，例如:

```bash
-rw-rw-r-- 1 jyhu jyhu 668M Jan 15 17:58 1-CoO.tar.gz
-rw-rw-r-- 1 jyhu jyhu 559M Jan 15 15:40 2-ZIS.tar.gz
-rw-rw-r-- 1 jyhu jyhu 2.6G Jan 15 17:07 3-LiS@TiO2.tar.gz
-rw-rw-r-- 1 jyhu jyhu 2.8G Jan 15 15:53 4-Graphene.tar.gz
-rw-rw-r-- 1 jyhu jyhu 3.4M Jan 16 11:05 NEB.tar.gz
-rw-rw-r-- 1 jyhu jyhu 324M Jan 16 11:07 pKa-jqli.tar.gz
```

打包方法可以采用`tar`压缩，参照[以上部分](#文件打包与压缩)

