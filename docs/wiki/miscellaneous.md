---
Authors:
  - Yongbin Zhuang
  - Yunpei Liu
  - Jingfang Xiong
title: 杂项（Miscellaneous）
comments: true

---

# Miscellaneous

**Put temporary or unclassied content here!**

## Run Process when you logout shell

Everytime you login the cluster, you want to run some commands while you have to logout the shell. Unfortunately, these commands will stop as soon as you logout. How to keep commands run? The trick here is use command `nohup` and `&`.

 ``` bash
nohup command &
 ```

You just need to prepend `nohup` and append `&` in your commands.Now, you can go back and have a nice sleep.


## 删除 linux 下的符号链接（快捷方式）

Linux 系统下的符号链接，又称软链接，基本类似于 Windows 系统下的快捷方式。如果你已经接触过`deepmd`，你应该已经对见到过一些符号链接了。需要注意的一点是，符号链接本质上是一个**独立的文本文件**，操作系统会将其解释为另一个文件或者路径（文件夹）。因此符号链接有如下两个性质：

* 删除符号链接文件并不会影响原本的文件/路径（文件夹）

* 删除原始文件/路径后，符号链接仍然存在，但是链接会损坏，成为 “stale symbolic link”（字面意思）。 

在整理工作文件夹的时候，我们可能会需要删除符号链接，我们尤其需要注意路径符号链接的删除：

一个`dp-gen`的训练路径结构如下：

```shell
00.train/
├── 000
├── 001
├── 002
├── 003
├── data.init -> /data/rhbi/TiO2-ML/00.cp2k_md
├── data.iters
├── graph.000.pb -> 000/frozen_model.pb
├── graph.001.pb -> 001/frozen_model.pb
├── graph.002.pb -> 002/frozen_model.pb
├── graph.003.pb -> 003/frozen_model.pb
└── jr.json
```

假设你想要删除和文件关联的软链接‘graph.000.pb’，输入 `rm graph.000.pb`，没有任何问题，你成功删除了这个文件。然而如果你想删除和一个文件夹相关的链接，data.init，你可能会不假思索地输入

```bash
rm data.init/
```

这时候你会收到报错：

```bash
rm: cannot remove ‘data.init/’: Is a directory
```

再次强调，符号链接本质上是一个**独立的文本文件**。收到报错是因为`shell`的自动全功能把‘data.init’识别为了一个路径，因此在最后加入了斜杠‘/’，然而符号链接只是一个文本文件，这个时候系统认为不能用`rm`命令删掉一个路径，所以报错。正确的解决方法是去掉斜杠，输入正确的命令成功删除链接：

```bash
rm data.init
```

当然shell的自动补全和你使用的 shell 版本有关，有可能你的 shell 不会犯蠢直接加上‘/’，但是在删除链接的时候你需要额外注意，避免你的数据损失。

!!! danger "danger"
    千万不要运行 'rm -rf data.init/*' ，你会删除掉原路径下的所有文件！！！'

## 集群使用出错：/bin/sh^M: bad interpreter: No such file or directory

### 错误情况

/bin/sh^M: bad interpreter: No such file or directory

在集群上使用bsub提交作业后正常显示：

```
Job <1360> is submitted to queue <53-large>
```

但是用bjobs查看不到这个作业，（可能先显示在排队PEND）显示No unfinished job found，这个时候使用ls命令会看见提交的.lsf作业的目录下会生成输出和报错文件：1360.stdout，1360.stderr，这说明作业已经运行结束（异常结束）。

### 错误原因

使用vim命令查看.stdout和.stderr这两个文件，会发现在作业的换行处出现很多^M符号，查询原因是windows的文件上传到linux系统时文件格式可能不一致

### 错误处理

方法一：参考[linux下运行脚本报读取或^M错误处理 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/475980403)

方法二：用vim命令在集群上新建一个作业，然后把作业内容复制上去，再bsub提交作业即可

# Scrum Group 

## 简单介绍

* scrum meeting 即每日例会，在橄榄球运动中 a scrum 意思为一场比赛，scrum meeting 旨在通过每日例会的形式来总结最近所做的工作，进行讨论和反思并对未来短期内的工作进行规划和展望。

## 基本规则

* 所有的学生根据所研究方向分为若干小组，每个小组由各自的 scrum master 管理，并由 scrum master 带领进行每周的汇报。
* scrum meeting 每周进行两次，进行时间根据具体情况而定。
* 所有的研究生和本科四年级学生除非有要事均需参加scrum meeting，如果有事不能参加的需向所在组的 scrum master 进行请假和汇报。
* 如果当天老师繁忙，各个小组应该自行组织 scrum meeting。

## 例会内容

* 汇报从上次 scrum meeting 到目前为止所做的工作内容，包括遇到的问题、新的发现或者存在的疑问等。

## 参考文件

* 请参考以下文件（待更新）
* https://www.scrumguides.org/scrum-guide.html

 
