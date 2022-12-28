---
title: 虚拟环境下源码安装教程
authors: Yunpei Liu
comments: true
---

# 虚拟环境下源码安装 C/C++程序：以 valgrind 为例

源码安装一般由 3 个步骤组成：配置(configure)、编译(make)、安装(make install)。默认情况下进入源码所在文件夹下顺序执行`./configure && make && make install` 会将文件安装在`/usr/local`下。但是，这种做法有两个不足：

- 某些软件（版本）仅应用于特定工作任务中，不同任务中的软件（版本）可能会有冲突
- 集群上普通用户没有权限修改`/usr/local`进行安装

是否可以采用类似将 python 包安装到特定虚拟环境下的做法，把 C/C++程序通过源码安装到特定虚拟环境中呢？答案是：可以！接下来，以 [Valgrind](https://valgrind.org) 为例说明如何将 C/C++软件包安装到特定虚拟环境下。

---

> 虚拟环境地址（根据自己情况修改）：`/new_data/jxzhu/envs/test_env`

1. 下载源码并解压

   ```bash
   # download source code from official website
   wget -c https://sourceware.org/pub/valgrind/valgrind-3.19.0.tar.bz2
   # decompress
   tar -jxvf valgrind-3.19.0.tar.bz2
   ```

2. 进入文件夹并执行安装前序工作（此处根据需安装软件的指引进行）

   ```bash
   # enter the source code folder
   cd valgrind-3.19.0
   # NOTE: This is not a general procedure
   # Please check the installation guide for your package
   ./autogen.sh
   ```

3. 通过`--prefix`将安装地址指定为虚拟环境所在地址

   ```bash
   # configure with given installation path
   ./configure --prefix=/new_data/jxzhu/envs/test_env/
   ```

4. 编译及安装

   ```bash
   # make in parallel
   make -j20
   # install software
   make install
   ```

**快速测试**

```bash
(base) [jxzhu@login01:] /data/jxzhu/software/valgrind-3.19.0 $ which valgrind
/usr/bin/which: no valgrind in (...)
(base) [jxzhu@login01:] /data/jxzhu/software/valgrind-3.19.0 $ conda activate /new_data/jxzhu/envs/test_env/
(test_env) [jxzhu@login01:] /data/jxzhu/software/valgrind-3.19.0 $ which valgrind
/new_data/jxzhu/envs/test_env/bin/valgrind
```
