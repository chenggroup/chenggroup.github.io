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



## Jupyter Lab

Under construction

## Jupyter Hub

Under construction
