---
title: 计算集群使用说明
priority: 1.01
---

# 计算集群使用说明

目前，所有CPU节点可以通过同一登陆节点进行提交，以下对集群使用的一些注意事项进行说明。关于GPU的使用，请参考。

## 目录结构

集群调整后具有如下的目录结构，为了保持统一性，请在`/data/username`（`user`请替换为自己的用户名）下做计算。

```bash
/data <--目前的数据盘（432TB大存储）
├── 51-data <--51备份后的数据
│   ├── ...
│   ├── ...
│   └── username
├── 52-data <--52备份后的数据
│   ├── ...
│   ├── ...
│   └── username
├── home <--191登陆后的home文件夹
│   ├── ...
│   ├── ...
│   └── username
├── ...
├── ...
└── username <--在这里解压数据、提交计算
```

## 作业提交

### 计算节点、队列和脚本

通过`bhosts -a`可以看到，目前的集群可以同时看到原来51/52/53上所有的节点，原51/52/53集群的节点分别用`c51-00x/c52-00x/c53-00x`。

```
HOST_NAME          STATUS       JL/U    MAX  NJOBS    RUN  SSUSP  USUSP    RSV
c51-001            closed          -     24     24     24      0      0      0
......
c51-034            closed          -     24     24     24      0      0      0
c51-g001           ok              -     32      0      0      0      0      0
c51-s001           ok              -     24      0      0      0      0      0
c52-001            ok              -     28      0      0      0      0      0
...
c52-040            closed          -     28     28     28      0      0      0
c53-001            ok              -     32      0      0      0      0      0
...
c53-021            ok              -     32      0      0      0      0      0
...
```

由于处理器核数不同，任务只能在具有相同核数的节点间并行，由此对节点按照队列进行了分组，队列前缀分别为`51-`/`52-`/`53-`，其对应每个节点上的核数分别为24/28/32。通过`bqueues`命令可以看到当前集群上的队列及其使用情况。

```
QUEUE_NAME      PRIO STATUS          MAX JL/U JL/P JL/H NJOBS  PEND   RUN  SUSP
51-small        100  Open:Active       -  288    -    -     0     0     0     0
52-small        100  Open:Active       -  336    -    -     0     0     0     0
53-small        100  Open:Active       -  384    -    -     0     0     0     0
gpu              90  Open:Active       -    -    -    -     0     0     0     0
fat              90  Open:Active       -    -    -    -    24     0    24     0
51-medium        60  Open:Active       -  288    -    -   264   120   144     0
52-medium        60  Open:Active       -  336    -    -   756    84   672     0
53-medium        60  Open:Active       -  384    -    -   128   128     0     0
admin            50  Open:Active       -    -    -    -     0     0     0     0
51-large         40  Open:Active       -  288    -    -   648     0   648     0
52-large         40  Open:Active       -  336    -    -   280     0   280     0
53-large         40  Open:Active       -  384    -    -   928   320   608     0
51-long          30  Open:Active       -  288    -    -    24     0    24     0
52-long          30  Open:Active       -  336    -    -     0     0     0     0
53-long          30  Open:Active       -  384    -    -     0     0     0     0
51-xlong         25  Open:Active       -  288    -    -     0     0     0     0
52-xlong         25  Open:Active       -  336    -    -     0     0     0     0
53-xlong         25  Open:Active       -  384    -    -     0     0     0     0
51-xlarge        20  Open:Active       -  288    -    -     0     0     0     0
52-xlarge        20  Open:Active       -  336    -    -     0     0     0     0
53-xlarge        20  Open:Active       -  384    -    -     0     0     0     0
```

现编号为`c51-00x` 的节点需通过队列`51-small`、`51-medium`、`51-large`等等来进行提交，并设置核数为24的倍数（24，48，72等）以确定节点数，`ptile=24`。**使用节点的数量通过总核数除以每个节点核数的值来确定。**同理，若想使用编号为`c52-00x` 的节点，则队列名为`52-small`、`52-medium`、`52-large`等等，核数为28的倍数（28，56，84等），ptile=28；若想使用编号为`c53-00x` 的节点，则队列名为`53-small`、`53-medium`、`53-large`等等，核数为32的倍数（32，64，96等），ptile=32。

> GPU（Tesla V100节点）和胖节点仍按照51进行编组，编号分别为`c51-g001`和`c51-s001`。

目前每个队列仍限制同时运行4个任务、队列内使用至多12个节点。新增全局任务限制，即三组队列总共使用核数不超过556，若超出此限制则任务会处于PEND状态。

提交脚本示例放在`/data/share/base/scripts`里面，软件统一安装在`/data/share/apps`下，目前安装了VASP 5.4.4、CP2K 7.1、Gaussian 16、Lammps（*注意：不包含DeePMD组件*）等。

这里对作业提交脚本举例说明如下：

```bash
#!/bin/bash
#BSUB -q 51-large
#BSUB -W 24:00
#BSUB -J cp2k
#BSUB -o cp2k.%J.stdout
#BSUB -e cp2k.%J.stderr
#BSUB -n 72
#BSUB -R "span[ptile=24]"

# add modulefiles
module load intel/17.5.239 mpi/intel/2017.5.239
module load gcc/5.5.0
module load cp2k/7.1

mpiexec.hydra cp2k.popt input.inp >& output_$LSB_JOBID
```

其中：

- `#BSUB -q 队列名` 用于指定作业提交的队列。
- `#BSUB -W hh:mm` 用于指定任务所需的时间（Walltime），若运行超过`hh:mm`，则任务会被管理系统杀死。对于不同类型的队列，Walltime上限有所不同。对`small`队列要求在20分钟以内，对`medium`要求在12小时以内，对`large`和`xlarge`要求在24小时以内，对`long`要求在48小时以内，对`xlong`则在72小时以内。
- `#BSUB -J cp2k`指定作业名称，一般按照实际计算来取名以方便查看完成情况。
- `#BSUB -n 72`指定作业提交的总核数，`#BSUB -R "span[ptile=24]"`指定提交队列的每个节点上的CPU总核数。使用节点的数量通过总核数除以每个节点核数的值来确定，即用`-n`后的数值除以`ptile=`后的数值，例如这里通过指定72个核，在51队列中选取3个节点进行并行计算。
- `module load xxx `用于加载环境，保持`/data/share/base/scripts`示例中的写法即可。
- `mpiexec.hydra cp2k.popt input.inp >& output_$LSB_JOBID`是实际执行任务的命令。

可以看到，任务提交脚本实际上是一个具有特殊注释格式的 bash 脚本。因此在加载环境后，可以使用bash语法来设置环境变量、控制任务运行的路径、进行批处理等等。

### 作业提交

若用户已经准备好相应计算的输入和提交脚本，则可以对任务进行提交。例如提交脚本文件名为`cp2k.lsf`，则提交命令为：

```bash
bsub < cp2k.lsf
```

若提交成功，可以看到以下提示：

```
Job <1360> is submitted to queue <53-large>
```

表示任务已经成功提交到节点上，编号为 `1360`。

任务提交后，可以通过`bjobs`命令查看自己任务的运行情况。

```
JOBID   USER    STAT  QUEUE      FROM_HOST   EXEC_HOST   JOB_NAME   SUBMIT_TIME
1227    user    RUN   52-medium  mgt02       28*c52-032  CoX        Mar  9 22:35
                                             28*c52-023
1133    user    RUN   51-medium  mgt02       24*c51-024  Cu13       Mar  9 21:20
                                             24*c51-031
1360    user    PEND  53-large   mgt02                   cp2k       Mar 10 13:26
```

其中 `JOBID` 即为任务编号，`STAT` 表示状态，`RUN` 即为正在运行，而 `PEND` 表示正在排队，可能是因为空余节点数不足。可以看到，1227和1133号任务正在运行，分别使用了2个节点，刚刚提交的1360号任务则在排队。

如果想要停止或取消已经提交的任务，则使用命令：

```
bkill 1360
```

若看到 `Job <1360> is being terminated` 的提示，则说明停止任务的请求已经发出。一段时间后，该任务即被杀死。

{% include alert.html type="tip" title="链接" content="更多使用教程和说明请参考：<a href='http://202.38.95.90/zlsc/pxjz/201408/W020140804352832330063.pdf'> LSF作业调度系统使用指南</a>" %}

