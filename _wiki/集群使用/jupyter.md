---
Title: Jupyter 系列使用指南
Authors: 庄永斌
priority: 1.09
---



# Jupyter 系列使用指南

## Jupyter Notebook

### 转化Jupyter Notebook为Python脚本

```bash
ipython nbconvert --to python *.ipynb
```



### 远程打开Jupyter Notebook

Jupyter notebook可以通过本地电脑的浏览器打开。但如果你想在远程电脑上（如集群）打开，怎么办？远程打开Jupyter notebook的好处就是可以不用下载数据，直接远程处理。但是由于集群并没有显示/输出装置，你需要通过其他方法来打开Jupyter notebook。

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



ssh 登陆的命令可以查看(这里)[{{ site.baseurl }}/wiki/ssh_note]进行简化.

- 打开本地电脑的浏览器，输入`localhost:8888` 。然后会弹出输入 `password` 或 `token`的页面, 你可以在集群上输入如下命令来查看：

```bash
#type this command in your remote computer, you can find token to enter remote notebook
jupyter notebook list
```

### 利用空节点运行Jupyter

由于登陆节点资源十分有限，实际上不太建议在登陆节点上直接运行 Jupyter 服务。这里提供一种可能的方案，通过 LSF 启动 Jupyter 服务，实现在远程的调用。

首先在自己希望作为Jupyter根目录的文件夹下编辑提交脚本（例如`jupyter.lsf`）：

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

如图即使用了胖节点的1个核来开启任务。同时在任务输出中显示出胖节点所在的IP地址，通过bpeek 可以查看：

```
123.45.67.89 c51-s001 c51-s001.hpc.xmu
```

假设输出为123.45.67.89，则可在本地运行命令：

```
ssh -L<local_port>:123.45.67.89:<port> <username>@<ip_of_cluster>
```

其中`<local_port>`为本地任意端口，`<port>`与作业脚本保持一致，其余部分与平时登陆命令保持一致，注意不要漏掉`-p xxxx`。此部分的说明请参考<a href="{{ site.baseurl }}{% link _wiki/集群使用/ssh_note.md %}">SSH使用说明</a>。

在本地浏览器输入：`localhost:<local_port>`即可访问这一远程 Jupyter 服务。

此途径最大的好处是可以在GPU集群上运行，从而可以直接调用GPU卡。但请注意，需要在脚本中指定所需的GPU卡数，更多注意事项请参考<a href="{{ site.baseurl }}{% link _wiki/集群使用/gpu_usage.md %}">GPU使用说明</a>和<a href="{{ site.baseurl }}{% link _wiki/集群使用/mig_usage.md %}">MIG使用说明</a>。

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

## Jupyter Lab

Under construction

## Jupyter Hub

Under construction
