---
title: 文件整理与备份攻略
author: Yunpei Liu
---

# 文件整理与备份攻略

> 本文将持续更新

在实际科研工作中，我们时常会遇到文件整理的问题。比如利用 CP2K 通过 Constrained MD 计算 Potential Mean Force 时，会产生大量 Lagrange Multiplier 文件；使用 DP-GEN 训练势函数时，由于 Model Deviation 过程中会生成大量结构文件，每一轮每条轨迹都会有很多，便会使文件总数快速上升；同时，计算过程中会产生波函数、cube等文件，可能会占据大量的空间。如何高效整理这些文件也成为一个难题。

本文将给出一些具体的攻略，供大家参考使用。

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

{% include alert.html type="warning" title="注意" content="注意 <code>find</code> 命令后的选项为 <code>-</code> 而非 <code>--</code> 。" %}

## rsync命令

`rsync` 作为常用的文件传输与同步命令，实际上也可以用于将某一文件夹清空，对于有大量小文件的情况相比传统的 `rm` 命令会快很多。例如想要清空 `/some/path` 目录，可以先运行：

```bash
mkdir /tmp/empty
```

然后运行：

 ```bash
rsync --delete -rlptD /tmp/empty/ /some/path
 ```

