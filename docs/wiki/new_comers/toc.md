---
authors: 庄永斌
title: 导览
priority: 1.20
---

# 新生入门教程

欢迎加入程俊课题组，每个人来到新环境都需要熟悉和学习规则，请各位新生按照以下清单顺序进行入组的准备。

## 个人座位

每位入学新生将分到一个座位和一台iMac电脑用于日常的科研。请大家先注册一个Apple ID, 然后寻找**课题组的集群管理员**，为你开通iMac电脑的账号。

## 集群与集群账号

课题组配备有集群(超算)资源供科研使用，而集群是以**Linux**系统运行的。与Windows类似，是另一种电脑操作系统。主要以键盘操作为主，因此如果不熟悉**Linux**系统的同学，请先自己粗略学习一下[(视频)Linux入门]({{ site.baseurl }}/wiki/新生培训/linux)

要登陆集群，同样需要集群账号，请寻找**课题组的集群管理员**为你开通集群账号。

登录集群**建议使用iMac的终端(terminal)**。这里iMac，指的就是苹果苹果电脑。由于苹果操作系统`Macos`与`Linux`都是从`Unix`系统衍生出来，因此使用苹果系列电脑来登录集群最为方便。`Windows`系统的电脑则需要额外安装软件。

使用iMac登录集群只需要同时按住`command`+`空格`，就会跳出搜索框。在搜索框中输入`terminal`/`终端`，则会跳出终端应用。使用终端的`SSH`命令即可。`SSH`使用具体见下文。

为建立账号，需要生成[SSH密钥]({{ site.baseurl }}/wiki/集群使用/cluster_usage#创建密钥对)。登录集群需要使用[SSH]({{ site.baseurl }}/wiki/集群使用/ssh_note)操作。

使用集群前，请大家熟悉集群的[基本知识]({{ site.baseurl }}/wiki/集群使用/cluster_usage)和操作。如果要使用GPU等资源，还需学习[如何使用集群上的GPU]({{ site.baseurl }}/wiki/集群使用/gpu_usage)。

如果以上有任何难以理解的内容请立即汇报给**课题组的集群管理员**

## 在iMac上和在集群上使用Python

Python是一种非常方便的编程语言，可以帮助我们处理计算数据。但是纯Python的安装和相应的Python库使用是十分烦人的。因此名为`Anaconda`的软件可以帮助我们解决这个问题。

在iMac上，安装`Anaconda`，直接去搜索引擎搜索`Anaconda`然后去官网下载对应的安装包即可。

在集群上，我们已经提前为大家安装好了`Anaconda`，使用和设置方法参见[集群上的Anaconda]({{ site.baseurl }}/wiki/集群使用/conda)

## 必学项目

[量子化学(Levine)(前14章)]({{ site.baseurl }}/wiki/book_recommendation)

[(视频)量子化学与密度泛函理论]({{ site.baseurl }}/wiki/新生培训/qc_dft)

[(视频)密度泛函近似，基组与赝势]({{ site.baseurl }}/wiki/新生培训/basis_pps)

[(视频)Linux入门]({{ site.baseurl }}/wiki/新生培训/linux)

[(视频)如何阅读文献]({{ site.baseurl }}/wiki/新生培训/read_papers)

[(视频)如何进行展示]({{ site.baseurl }}/wiki/新生培训/presentation)

[(视频)Python和Numpy]({{ site.baseurl }}/wiki/新生培训/python_numpy)

## 选学[具体项目相关]

### 机器学习

[(视频)机器学习: 理论与DeePMD-kit]({{ site.baseurl }}/wiki/新生培训/dpmd)

[(视频)深度势能生成器: DP-GEN]({{ site.baseurl }}/wiki/新生培训/dpgen)

[DeePMD-kit 使用入门]({{ site.baseurl }}{% link _wiki/软件使用/DeePMD-kit.md %})

[DP-GEN使用入门]({{ site.baseurl }}{% link _wiki/软件使用/DP-GEN.md %})

### 工作流

[(视频)自动化计算与工作流: AiiDA]({{ site.baseurl }}/wiki/新生培训/workflow)
