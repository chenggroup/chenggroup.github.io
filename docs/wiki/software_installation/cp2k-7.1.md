---
title: CP2K 7.1 安装教程
authors: Yunpei Liu
comments: true
---

# CP2K 7.1 安装教程

这里以 7.1 版本为例介绍如何安装编译 CP2K，其他版本可参照修改。

## 环境准备

可参考[官方支持编译环境](https://www.cp2k.org/dev:compiler_support/)：

- 使用 GCC 5.5.0 以上
- Intel MPI 环境

一切就绪后，加载上述环境：

```bash
module load intel/17.5.239 mpi/intel/2017.5.239
module load gcc/5.5.0
```

## 安装流程

首先，在 [Release 页面](https://github.com/cp2k/cp2k/releases) 下载 CP2K 安装包，以 7.1 为例：

```bash
wget -c https://github.com/cp2k/cp2k/releases/download/v7.1.0/cp2k-7.1.tar.bz2
```

拷贝 `cp2k-7.1.tar.bz2` 到安装路径下并解压。由于需要预编译所需的库等，这里为了防止后续使用时产生额外路径依赖，推荐直接在安装路径下编译。
以`/share/apps/cp2k`为例：

```bash
cp cp2k-7.1.tar.bz2 /share/apps/cp2k
cd /share/apps/cp2k/
tar -jxf cp2k-7.1.tar.bz2
```

更改目录名为7.1，为后续添加module文件作准备（本步骤可选，也可保留默认名称，后续环境配置时需要相应修改）：

```bash
mv cp2k-7.1 7.1
```

进入到toolchain目录下，并修改`install_mpich.sh`, 将其中的`check_command mpic++ "mpich"`改为`check_command mpicxx "mpich"`：

```bash
cd 7.1/tools/toolchain
sed -i 's/check_command mpic++/check_command mpicxx/g' scripts/install_mpich.sh
```

**（可选）** 为加速安装、防止超时报错，在中国大陆可将Github统一替换为镜像。但后续从cp2k官方网站下载的包也可能出现超时报错，可能需要借助其他平台下载相应的软件包并放到`build`目录下。

```bash
sed -i 's/github.com/hub.fastgit.org/g' scripts/install_*.sh
```

随后运行toolchain脚本安装依赖软件：

```
./install_cp2k_toolchain.sh --gpu-ver=no   --enable-cuda=no  --with-mpich=system --with-sirius=no --with-openmpi=no  --with-spfft=no --with-hdf5=no
```

过程中请注意输出信息和报错等，并相应地予以解决。如果一切顺利，会提示需要拷贝arch文件，并source所需的环境，按照提示操作即可。注意由于步骤不同这里的命令可能不同，仅供参考：

```bash
cp install/arch/local* /share/apps/cp2k/7.1/arch/
source /share/apps/cp2k/7.1/tools/toolchain/install/setup
```

之后进行编译安装： 
```bash
cd /share/apps/cp2k/7.1/
make -j 8 ARCH=local VERSION="popt psmp"
```

如果一切顺利，可以得到编译好的二进制可执行文件，创建`bin`目录，并拷贝`exe`目录里的文件到`bin`：

```
mkdir bin
cp ./exe/local/* ./bin
```

最后删除`bin`和`tools`之外的所有文件，并删除`tools/toolchain`里的`build`和`install`目录。

## Module文件生成

若集群使用module管理环境变量，请在modulefile目录下（取决于集群的设置）新建目录`cp2k`并创建文件`.module`：

```lua
#%Module

# Help message
proc ModulesHelp { } {
    set nameversion [module-info name]
    regsub "/.*" $nameversion "" name
    regsub ".*/" $nameversion "" version
    puts stderr "\tLoads the $version $name environment"
}

# Set variables
set nameversion [module-info name]
regsub "/.*" $nameversion "" name
regsub ".*/" $nameversion "" version
module-whatis    "$name $version"

# set environment variables
set basedir /share/apps/$name/$version

module load intel/17.5.239 mpi/intel/2017.5.239
module load gcc/5.5.0

prepend-path    PATH            ${basedir}/bin
```

然后创建符号链接，提供相应版本号的环境：
```
ln -s .module 7.1
```

## Q&A

1. 如果所有标称为`https://www.cp2k.org`的压缩包均无法下载，且单独`wget`该压缩包时提示`Issued certificate has expired`，可以尝试更新证书服务，CentOS 7命令如下：

   ```bash
   yum install ca-certificates
   ```

2. 以上欺骗手段仅适用于Intel MPI <= 2018的版本，对高版本MPI推荐直接安装更高版本的CP2K，Toolchain可提供完整支持。

3. 如果`make`过程中频繁报错，还可能是系统没有正确配置地区设置，请使用如下命令加载环境变量：

   ```bash
   export LANG=en_US.UTF-8
   export LC_ALL=en_US.UTF-8
   export LC_CTYPE="en_US.UTF-8"
   ```

