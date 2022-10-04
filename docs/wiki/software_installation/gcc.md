---
title: GCC 安装教程
authors: Yunpei Liu
comments: true
---

# GCC 安装教程

这里以 5.5.0 版本为例，其他版本可以参考，只需将版本号替换即可。

首先下载 gcc 安装包，国内直接访问 gnu 官网较慢，可以通过 tuna 等镜像安装

```
wget https://mirrors.tuna.tsinghua.edu.cn/gnu/gcc/gcc-5.5.0/gcc-5.5.0.tar.gz
```

解压并下载编译所需环境：

```
tar -zxvf gcc-5.5.0.tar.gz
cd gcc-5.5.0
./contrib/download_prerequisites
cd ..
```

创建编译目录，并在其中进行编译：


```
mkdir objdir
cd objdir
../gcc-5.5.0/configure --prefix=/share/apps/gcc/5.5.0 --enable-languages=c,c++,fortran,go --disable-multilib
make
make install
```

编写 modulefile ，修改环境变量：

```
#%Module1.0#####################################################################
##
## GCC modulefile
##
proc ModulesHelp { } {
        global version

        puts stderr "\tSets up environment for GCC v$version"
}

module-whatis   "sets up environment for GCC v5.5.0"

# for Tcl script use only
set     version 5.5.0
set     root    /share/apps/gcc/$version

prepend-path    INFOPATH        $root/share/info
prepend-path    LD_LIBRARY_PATH $root/lib64:$root/lib:$root/libexec
prepend-path    INCLUDE         $root/include
prepend-path    MANPATH         $root/share/man
prepend-path    PATH            $root/bin
```
