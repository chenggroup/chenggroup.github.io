---
Title: Jupyter 系列使用指南
Authors: 庄永斌
comments: true
---

# Jupyter 系列使用指南

## Jupyter Notebook

### 转化 Jupyter Notebook 为 Python 脚本

```bash
ipython nbconvert --to python *.ipynb
```

### 远程打开 Jupyter Notebook

Jupyter notebook 可以通过本地电脑的浏览器打开。但如果你想在远程电脑上（如集群）打开，怎么办？远程打开 Jupyter notebook 的好处就是可以不用下载数据，直接远程处理。但是由于集群并没有显示/输出装置，你需要通过其他方法来打开 Jupyter notebook。

远程打开的方法

- 使用如下命令在集群上打开你的 jupyter notebook：

```bash
# 在远程集群运行如下命令
# <port number>由你自己决定，比如 9898
jupyter notebook --no-browser --port=<port number>
```

- 在你的本地的电脑使用如下命令：

```bash
# <port number>由你自己决定，比如 9898，是跟远程打开的端口对应。
ssh -N -f -L localhost:8888:localhost:<port number> username@your_remote_host_name
```

ssh 登陆的命令可以查看[这里](./ssh_note.md)进行简化.

- 打开本地电脑的浏览器，输入`localhost:8888` 。然后会弹出输入 `password` 或 `token`的页面, 你可以在集群上输入如下命令来查看：

```bash
#type this command in your remote computer, you can find token to enter remote notebook
jupyter notebook list
```

### 利用空节点运行 Jupyter

由于登陆节点资源十分有限，实际上不太建议在登陆节点上直接运行 Jupyter 服务。这里提供一种可能的方案，通过 LSF 启动 Jupyter 服务，实现在远程的调用。

首先在自己希望作为 Jupyter 根目录的文件夹下编辑提交脚本（例如`jupyter.lsf`）：

```bash
#!/bin/bash
#BSUB -q fat
#BSUB -J deepmd
#BSUB -o %J.stdout
#BSUB -e %J.stderr

# add modulefiles
source ~/.bashrc

cat /etc/hosts | grep c51-s001
jupyter-lab --ip=0.0.0.0 --port=<port>
```

如图即使用了胖节点的 1 个核来开启任务，同时在任务输出中显示出胖节点所在的 IP 地址，请在提交后稍等片刻后通过 `bpeek` 命令查看（可能一开始是空的，稍后会有输出）：

```
123.45.67.89 c51-s001 c51-s001.hpc.xmu
```

假设输出为 123.45.67.89，则可在本地运行命令：

```
ssh -L <local_port>:123.45.67.89:<port> <username>@<ip_of_cluster>
```

其中`<local_port>`为本地任意端口，`<port>`与作业脚本保持一致，其余部分与平时登陆命令保持一致，注意不要漏掉`-p xxxx`。此部分的说明请参考[SSH 使用说明](./ssh_note.md)。

在本地浏览器输入：`localhost:<local_port>`即可访问这一远程 Jupyter 服务。

此途径最大的好处是可以在 GPU 集群上运行，从而可以直接调用 GPU 卡。但请注意，需要在脚本中指定所需的 GPU 卡数。

```bash
#!/bin/bash
#BSUB -q gpu
#BSUB -W 24:00
#BSUB -J deepmd
#BSUB -o %J.stdout
#BSUB -e %J.stderr
#BSUB -n 8
#BSUB -gpu "num=1:mode=shared:mps=no:j_exclusive=yes"
#BSUB -R "span[ptile=8]"

# add modulefiles
source ~/.bashrc

#dp train input.json 1>> train.log 2>> train.err
cat /etc/hosts
jupyter-lab --ip=0.0.0.0 --port=8888
```

如果想在 Jupyter 中调用虚拟环境（如`myenv`），需要在对应虚拟环境中安装 `ipykernel`和环境的 kernel。[[参考资料]](https://ipython.readthedocs.io/en/stable/install/kernel_install.html)

```bash
# 激活虚拟环境 myenv
# 也可用 conda activate myenv
source activate myenv
conda install pip
conda install ipykernel
# 实际使用中需替换 myenv 和 "Python (myenv)"
python -m ipykernel install --user --name myenv --display-name "Python (myenv)"
```

## Jupyter Lab

Under construction

## Jupyter Hub

Under construction
