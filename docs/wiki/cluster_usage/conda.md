---
title: Anaconda
authors: Yongbin Zhuang
comments: true
---

# Anaconda 使用指南

## 初始化设定
登录 HPC

```bash
module load miniconda/3
conda init bash
```
这会自动修饰你的`~/.bashrc`文件
登出HPC，再次登陆


打开你的~/.condarc文件

```bash
vim ~/.condarc
```

修改以下文件并放入你的~/.condarc里

```
channels:
  - defaults
ssl_verify: true
envs_dirs:
#modify, this is where your environment file in
  - /data/ch2_101/conda/env
pkgs_dirs:
#modify, this is where your package file in
  - /data/ch2_101/conda/pkgs
```

退出文件

通过以下命令确认你的环境
```bash
conda env list
```

## 创建你自己的环境

创建你自己的环境，之后都启用自己的环境进行使用

```bash
conda create -n <your env name> python

conda activate <your env name>
```



## 修饰你的终端前缀

用上述方法创造的环境会在你的终端命令行前加上一长串路径，例：

```bash
(/Users/USER_NAME/research/data-science/PROJECT_NAME/envs) $
```

可以用以下命令缩短前缀

```bash
conda config --set env_prompt '({name})'
```

此命令会修改你的`.condarc`文件

[参考文献](https://docs.conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html)



没有了，愉快的用conda进行数据处理吧!