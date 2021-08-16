---
Authors: Yongbin Zhuang
priority: 100.1

---

# Miscellaneous

**Put temporary or unclassied content here!**



## Run Process when you logout shell.

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

{% include alert.html type="danger" title="danger" content="千万不要运行 'rm -rf data.init/*' ，你会删除掉原路径下的所有文件！！！'" %}

