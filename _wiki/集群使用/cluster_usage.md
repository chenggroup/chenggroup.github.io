---
title: 计算集群使用说明
authors: Yunpei Liu, Yongbin Zhuang
priority: 1.01
---

# 计算集群使用说明

## 集群的基本概念
### CPU/Core(核)的概念
`CPU` 是 Central Processing Unit 的缩写。比起全称，他的缩写更为大家所熟知。我们买电脑时都会看这个电脑拥有几个 CPU。CPU可以计算数字或者执行你的代码等等。在科学计算中，我们倾向使用核(`Core`)这个名称。本质上这知识一个别称而已。
### Memory(内存)的概念

`内存`(Memory)就是储存数据的地方。跟硬盘(disk)储存的数据不同，`内存`里的数据可以直接被 `核` 读取。跟你在硬盘里储存的数据类似，只是它被`核`读取的速度更快。当执行程序时，有一些数据会先被读入`内存`，然后再执行计算。因此内存越大，被读入的数据也就越多，能够同时处理的数据也就越多，代码运行的时间会更短。

### Node(节点)的概念
`节点`(Node)换个日常的说法就是你的`电脑`，比如一台台式机或者笔记本电脑。它由若干个`核`和一个`内存`组成。因此可以把`节点`简单理解成日常见到的电脑(主机)。

### HPC(集群/超级计算机/超算)的概念
`HPC`就是High Performance Cluster的缩写，又称为超级计算机，高性能集群等。它由若干个`节点`组成。实际使用中，这些`节点`会有不同的角色，通常包含`登录节点`，`管理节点`和`计算节点`等。`登录节点`顾名思义就是用来登录的`节点`。用户从自己电脑可以登录到`登录节点`。`计算节点`是用来计算的节点，他们的唯一使命就是计算。`管理节点`比较特殊，用来管理`计算节点`，比如分配某某计算任务给某几个`计算节点`来算。

### Message Passing Interface(MPI)并行计算的概念
`并行计算`是若干个`节点`一起执行计算的意思。从`节点`的概念可以知道，一个`节点`的`内存`和`核`肯定是有限。比如，现有一个`节点`有24个`核`和32GB的`内存`，我们想执行一个计算，用到48个`核`，自然需要用到两个`节点`。问题是另一个`节点`的24个`核`如何读取到第一个`节点`的`内存`里的数据?这一个时候就要用到`MPI`/`并行计算`了。`MPI`是信息传输界面的简称。是一种告诉`节点`怎么跨节点读取`内存`的代码。也就是说这是计算机代码的一部分，我们常用的计算软件`vasp`或`cp2k`都已经写入了，所以只要直接使用便可以。

## 组内集群知识
本课题组使用 Zeus 计算集群提交计算任务进行计算模拟。Zeus 集群由两个登陆节点、一个管理节点、三个计算集群构成，每个计算集群包含多个计算节点（含一个 GPU 节点和一个大内存胖节点）。

另暂时设有 Metal GPU 集群，提供 40 张 GPU 加速卡供用户提交深度学习等任务（未来将择机整合到 Zeus 集群）。

目前，所有 CPU 节点可以通过同一登陆节点进行提交，以下对集群使用的一些注意事项进行说明。关于 GPU 的使用，请参考[使用集群上的GPU](/wiki/集群使用/gpu_usage)。

使用上述集群之前，你必须拥有一个账号才能进行任务提交。申请账号请联系集群管理员。

## 创建密钥对

{% include alert.html type="warning" content="新人必学" %}

`ssh` 是用来安全进行登录远程电脑的命令。使用后，有两种选择来验证登录

1. 使用密码
2. 使用密钥 

第一种方法已经为大众所熟知，但是不安全，目前集群对新开账号原则上不提供登陆密码。因此我们采用密钥进行登录。

使用如下命令生成密钥:

```bash
ssh-keygen
```

根据终端的提示进行操作（实际上你可能只需要不停按`enter`键）。默认情况下你会在`~/.ssh`目录中得到`id_rsa`和`id_rsa.pub`文件，他们分别是**私钥**和**公钥**。创建好了之后请把**公钥** `id_rsa.pub` 文件发给服务器管理员。

{% include alert.html type="warning" content="私钥是登录集群的钥匙，请务必保管好这个文件，防止自己的电脑被入侵" %}

## 获取账号

集群只允许已经授权的用户进行登录。在从管理员处获得你的账号名和初始密码后， Linux 或 Mac 用户可直接从命令行登录集群，使用 `ssh` 命令即可。

```bash
$ ssh -p <port> username@ip_address
```

请将 `username` 和 `ip_address` 替换为管理员提供的账号和IP地址，`<port>` 替换为端口号。

集群均采用 Linux 系统，因此不熟悉 Linux 基本操作的用户（例如查看文件、编辑文本、复制数据等）可以参考[Linux快速基础入门](/wiki/集群使用/linux)，并熟悉这些操作。本文档假设用户有一定的 Linux 基础。

### Windows 用户

对 Windows 用户来说，可以使用以下方法登陆集群。

1. (**Windows 10/11用户推荐**)使用 WSL(Windows Subsystem for Linux)。WSL 是 Windows 10 新版的特性，可使得用户在 Windows 系统下运行命令行模式的 Ubuntu 或 OpenSUSE 等子系统。使用 WSL 的用户可直接参考 Linux 的使用方法进行操作。具体安装方式可以参考[官方教程](https://docs.microsoft.com/zh-cn/windows/wsl/install-win10)。 对于使用集群的大多数需求，WSL 1 即可满足，因此不一定需要将 WSL 1 升级到 WSL 2 。

> 1. 这种方法对于图形界面（VMD、GNUPlot）等支持较差，尚需要额外的步骤配置图形界面转发，这里限于篇幅原因暂不进行介绍。如有需要请参考[这里](https://zhuanlan.zhihu.com/p/128507562)。
>
> 2. 目前 Windows 11 已经提供了对图形界面的直接支持（[请参考](https://docs.microsoft.com/en-us/windows/wsl/tutorials/gui-apps)），但需要使用 WSL 2。
>
> 3. 注意：由于代理机制原因，WSL 2 无法直接使用桌面端的 Easy Connect VPN服务，须设法进行端口转发。WSL 1 可以。

2. 使用 Xshell、PuTTY 等 SSH 客户端，Windows 10 以下的用户可使用这种方式。这类 SSH 客户端可以提供较完整的 SSH 功能。关于Putty的使用[请参考](https://bicmr.pku.edu.cn/~wenzw/pages/login.html)。

3. 使用虚拟机安装 Linux。若不想安装 Linux 双系统可以选择使用这种方式。正确配置的虚拟机和真正使用 Linux 几乎无差别。但虚拟机启动时间长，且完全启动时占用系统资源较多。

## 目录结构

Zeus 集群具有如下的目录结构，为了保持统一性，请在`/data/username`（`username`请替换为自己的用户名）下做计算。

```bash
/data <--目前的数据盘（432TB大存储）
├── 51-data <--原51备份后的数据
│   ├── ...
│   ├── ...
│   └── username
├── 52-data <--原52备份后的数据
│   ├── ...
│   ├── ...
│   └── username
├── home <--Zeus(191)登陆后的home文件夹
│   ├── ...
│   ├── ...
│   └── username
├── ...
├── ...
└── username <--在这里解压数据、提交计算
```

## 作业提交

### 计算节点、队列和脚本

通过`bhosts -a`命令可以看到，目前的集群包括51/52/53三个类别，分别为51/52/53计算集群，51/52/53集群的计算节点分别对应编号为`c51-00x/c52-00x/c53-00x`。

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

由于处理器核数不同，任务只能在具有相同核数的节点间并行，由此对不同集群的节点按照队列进行了分组，队列前缀分别为`51-`/`52-`/`53-`，其对应每个节点上的核数分别为24/28/32。通过`bqueues`命令可以看到当前集群上的队列及其使用情况。

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

提交脚本示例放在`/data/share/base/scripts`里面，软件统一安装在`/data/share/apps`下，目前安装了VASP 5.4.4、CP2K 7.1、Gaussian 16、Lammps、Gromacs、DeePMD-kit等。

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

可以看到，任务提交脚本实际上是一个具有特殊注释格式的 bash 脚本。因此在加载环境后，可以使用 bash 语法来设置环境变量、控制任务运行的路径、进行批处理等等。

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

## 校外访问

若为在校师生，可使用学校提供的 SSLVPN 登陆集群。

详细配置方法请参阅：[SSLVPN 使用说明-厦门大学VPN专题网站](https://vpn.xmu.edu.cn/info/1260/1203.htm)。

