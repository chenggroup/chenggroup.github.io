---
authors: 庄永斌
title: 导览
---

# 新生入门教程

欢迎加入程俊课题组，每个人来到新环境都需要熟悉和学习规则，请各位新生按照以下清单顺序进行入组的准备。

## 个人座位

每位入学新生将分到一个座位和一台iMac电脑用于日常的科研。请大家先注册一个Apple ID, 然后寻找**课题组的集群管理员**，为你开通iMac电脑的账号。

## 集群与集群账号

课题组配备有集群(超算)资源供科研使用，而集群是以**Linux**系统运行的。与Windows类似，是另一种电脑操作系统。主要以键盘操作为主，因此如果不熟悉**Linux**系统的同学，请先自己粗略学习一下[(视频)Linux入门](./linux.md)

要登陆集群，同样需要集群账号，请寻找**课题组的集群管理员**为你开通集群账号。

登录集群**建议使用iMac的终端(terminal)**。这里iMac，指的就是苹果苹果电脑。由于苹果操作系统`Macos`与`Linux`都是从`Unix`系统衍生出来，因此使用苹果系列电脑来登录集群最为方便。`Windows`系统的电脑则需要额外安装软件。

使用iMac登录集群只需要同时按住`command`+`空格`，就会跳出搜索框。在搜索框中输入`terminal`/`终端`，则会跳出终端应用。使用终端的`SSH`命令即可。`SSH`使用具体见下文。

为建立账号，需要生成[SSH密钥](../cluster_usage/ssh_note.md#创建密钥对)。登录集群需要使用[SSH](../cluster_usage/ssh_note.md)操作。

使用集群前，请大家熟悉集群的[基本知识](../cluster_usage/cluster_usage.md)和操作。如果要使用GPU等资源，还需学习[如何使用集群上的GPU](../cluster_usage/gpu_usage.md)。

如果以上有任何难以理解的内容请立即汇报给**课题组的集群管理员**

## 在iMac上和在集群上使用Python

Python是一种非常方便的编程语言，可以帮助我们处理计算数据。但是纯Python的安装和相应的Python库使用是十分烦人的。因此名为`Anaconda`的软件可以帮助我们解决这个问题。

在iMac上，安装`Anaconda`，直接去搜索引擎搜索`Anaconda`然后去官网下载对应的安装包即可。

在集群上，我们已经提前为大家安装好了`Anaconda`，使用和设置方法参见[集群上的Anaconda](../cluster_usage/conda.md)

## 必学项目

[量子化学(Levine)(前14章)](../book_recommendation.md)

[(视频)量子化学与密度泛函理论](./qc_dft.md)

[(视频)密度泛函近似，基组与赝势](./basis_pps.md)

[(视频)Linux入门](./linux.md)

[(视频)如何阅读文献](./read_papers.md)

[(视频)如何进行展示](./presentation.md)

[(视频)Python和Numpy](./python_numpy.md)

## 选学[具体项目相关]

### 机器学习

[(视频)Deep Learning Lecture by Frank Noe](https://www.youtube.com/playlist?list=PLqPI2gxxYgMKN5AVcTajQ79BTV4BiFN_0) *需要科学上网

[(书籍)Pattern Recognition and Machine Learning](https://www.microsoft.com/en-us/research/uploads/prod/2006/01/Bishop-Pattern-Recognition-and-Machine-Learning-2006.pdf) 

[(书籍)Deep Learning（花书）](http://alvarestech.com/temp/deep/Deep%20Learning%20by%20Ian%20Goodfellow,%20Yoshua%20Bengio,%20Aaron%20Courville%20(z-lib.org).pdf) 

[(视频)Machine Learning for Physics and the Physics of Learning 2019](https://www.youtube.com/playlist?list=PLHyI3Fbmv0SfQfS1rknFsr_UaaWpJ1EKA) *需要科学上网

[(视频)机器学习: 理论与DeePMD-kit](./dpmd.md)

[(视频)深度势能生成器: DP-GEN](./dpgen.md)

[DeePMD-kit 使用入门](../software_usage/DeePMD-kit.md)

[DP-GEN使用入门](../software_usage/DP-GEN.md)

### 工作流

[(视频)自动化计算与工作流: AiiDA](./workflow.md)

### 生成模型
[(视频)Diffusion and Score-Based Generative Models](https://www.youtube.com/watch?v=wMmqCMwuM2Q) 

[(视频)Dr. Yang Song — Advancements in Diffusion Models for Generative AI](https://www.youtube.com/watch?v=y8q3gh61OY0) 

[(博客)Generative Modeling by Estimating Gradients of the Data Distribution](http://yang-song.net/blog/2021/score/) 

[(博客)A Pedagogical Introduction to Score Models](https://ericmjl.github.io/score-models/) 

[(视频)通用分子结构模型Graphormer简介 - 郑书新博士](https://www.bilibili.com/video/BV1eF411A76S/?spm_id_from=333.337.search-card.all.click&vd_source=4b5c9edbc7203322daab34ea479c2688) 

[(视频)Beyond AlphaFold2: 从结构预测到分布预测 | 郑书新博士 | 微软研究院 | Distributional Graphormer (DiG)](https://www.bilibili.com/video/BV1kV41137ud/?spm_id_from=333.337.search-card.all.click&vd_source=4b5c9edbc7203322daab34ea479c2688) 

[(视频)Materials Project Seminars – Tian Xie "MatterGen: a generative model for inorganic materials design"](https://www.youtube.com/watch?v=Smz1go6_Spo) 

### 统计力学

[(博客)Introduction to Statistical Mechanics](https://web.stanford.edu/~peastman/statmech/#contents) 

[(博客)David Tong at DAMTP, Cambridge: Lectures on Theoretical Physics](http://www.damtp.cam.ac.uk/user/tong/teaching.html) 

[(博客)Lectures on Statistical Physics](https://www.damtp.cam.ac.uk/user/tong/statphys.html) 

[(博客)Lectures on Quantum Mechanics](http://www.damtp.cam.ac.uk/user/tong/quantum.html) 

[(博客)Lectures on Solid State Physics](http://www.damtp.cam.ac.uk/user/tong/solidstate.html) 
