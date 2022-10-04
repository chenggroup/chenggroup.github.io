---
title: DeePMD-kit安装实战：PC篇
authors: 
  - 朱嘉欣
comments: true
---

# DeePMD-kit安装实战：PC篇

## 背景

需要对DeePMD-kit的源码进行一些修改，针对新的物理量构建模型。对代码的调试需要GPU，但是不需要很好的性能，所以在PC端进行可以节省在集群上的排队时间。

安装系统：Ubuntu 20.04

## DeePMD-kit代码结构

在记录安装过程之前先简单描述一下DeePMD-kit的代码结构。

DeePMD-kit在训练部分的代码是在`.py`文件中调用 TensorFlow 实现的（TF自带OP/自定义OP）。但是TF的底层是用 C++ 构建的，所以在使用 DeePMD-kit 时需要安装 TF/python 接口。

进入到修改过代码的文件夹，执行：

```bash
pip install .
```

此时会基于已修改的代码生成新的可执行文件。

如果想基于DeePMD-kit生成的模型和lammps/CP2K等软件的对接，需要另外安装C++接口。这部分可以[参考之前的教程](./deepmd-kit_installation_51.md)（编译/修改代码后重新编译）。

## conda安装

如果不需要对源码进行修改，可以利用[官方教程](https://github.com/deepmodeling/deepmd-kit/blob/master/doc/install/easy-install.md#install-with-conda) easy installation 中的 conda 安装

```bash
#(base)
conda create -n deepmd deepmd-kit=*=*gpu libdeepmd=*=*gpu lammps-dp cudatoolkit=11.3 horovod -c https://conda.deepmodeling.org
```

此命令新建了一个名为`deepmd`的虚拟环境，并将deepmd-kit安装在这个环境中。
Conda 安装会一并安装 CUDA Toolkit，因此只要保证电脑的驱动支持即可。可通过以下指令查看驱动版本及其支持的cuda版本：

```bash
nvidia-smi
```

> 目前通过conda默认安装的是10.1版本的CUDA Toolkit，由于CUDA向下兼容，故版本高于10.1即可。如果驱动支持的CUDA版本过低，可以在Ubuntu的Software&Updates/Additional Drivers里选择新版的驱动进行升级。

利用 Conda 便捷安装时，DeePMD-kit的C++底层文件全部都已经编译成可执行文件`.so`，在本地只能查看到可执行文件`.so`和`.py`文件，无法对底层进行修改。所以如果需要对源码进行修改，需要手动安装编译。

Conda安装包括了预编译的 TF/C++ 接口，可通过定义环境变量省去以前教程中提到的编译的步骤。（见下文）

## 手动编译

上一节的 Conda 安装是在`deepmd`虚拟环境下安装的，手动安装我们新建一个环境`dp-tf`：

```bash
conda info -e
# if you have been in `deepmd`, deactivate first
conda deactivate
# create a new environment
conda create -n dp-tf
# if you want to specify the version of python in dp-tf
#conda create -n dp-tf python=3.9
```

!!! tip "tip"
    建议在新建环境dp-tf 时设置python版本和deepmd保持一致，否则后续安装tensorflow时可能因为python版本不兼容报错No matching distribution found for tensorflow。

### 下载源码&设置环境变量

下载源码（注意一定要有`--recursive`，具体见[wiki](./deepmd-kit_installation_51.md）

```bash
#(tf-dp)
git clone --recursive https://github.com/deepmodeling/DeePMD-kit.git DeePMD-kit
```

设置环境变量

```bash
#(tf-dp)
cd DeePMD-kit
# set $deepmd_source_dir as the directory of the deepmd source code
deepmd_source_dir=$(pwd)
# set $tensorflow_root as the directory of the TF/C++ interface
# the dir of the environment with conda DP
tensorflow_root=/dir/for/env/with/condaDP
```

> 可以用`conda env list`指令查看环境deepmd的地址(`/dir/for/env/with/condaDP`)

如果担心安装过程中需要退出，可以临时加到`~/.bashrc`文件中并`source ~/.bashrc`。

### TF/Python 接口

首先可以更新一下pip，并安装新版TensorFlow：

```bash
#(tf-dp)
pip install --upgrade pip
pip install --upgrade tensorflow==2.5.0
```

!!! tip "tip"
    利用conda便捷安装可以省去后面TF/C++接口的安装，所以这里的TF安装和conda安装中的TF保持一致。（具体版本在conda安装过DeePMD-kit的环境(deepmd)下查看已安装的tensorflow-base版本。

例如：
```bash
# assume you have been in dp-tf env
#(tf-dp)
conda deactivate
#(base)
conda activate deepmd
#(deepmd)
conda list
>>> tensorflow-base           2.5.0           gpu_py39h7c1560b_0    https://conda.deepmodeling.org
#(deepmd)
conda deactivate
#(base)
conda activate dp-tf
#(tf-dp)
pip install --upgrade tensorflow==2.5.0
```

### DeePMD-kit/Python 接口

```bash
#(tf-dp)
cd $deepmd_source_dir
DP_VARIANT=cuda
pip install .
```

这一步的`pip install`对`deepmd_source_dir`下的文件进行编译。

!!! warning "warning"
    环境变量DP_VARIANT的默认值是cpu，要记得根据需要进行修改！

!!! info "info"
    如果对源码进行了修改，需要重新编译。

这一步中报错可能的应对措施：

- 网络问题1

  修改镜像源（具体可参考[使用帮助](https://mirrors.tuna.tsinghua.edu.cn/help/pypi/)）

  ```bash
  pip install pip -U
  pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
  ```

- 网络问题2（`...timed out...`）

  多试几次...
  
- 升级`setuptools`

  ```bash
  pip install --upgrade setuptools --no-build-isolation
  ```

- 缺各种包

  如果直接`pip install`会发现所有都是已安装的，需要`pip uninstall`再`pip install`。

  用`conda list`检查发现应该是没有安装到这个环境里。

  如果有报错而无法直接卸载：

  ```bash
  It is a distuils installed project and thus we cannot accurately determine which files belongs to it which would lead to only a partial uninstall.
  ```

  可以考虑强制覆盖安装：

  ```bash
  pip install some_package --ignore-installed
  ```

- GCC版本问题

  ```bash
      138 | #error -- unsupported GNU version! gcc versions later than 8 are not supported!
  ```

  Ubuntu 20.04默认的GCC版本是9.3.0（`gcc --version`查看），需要卸载再重装低版本（比如7.5）

  ```bash
  sudo apt remove gcc
  sudo apt-get install gcc-7 g++-7 -y
  sudo ln -s /usr/bin/gcc-7 /usr/bin/gcc
  sudo ln -s /usr/bin/g++-7 /usr/bin/g++
  sudo ln -s /usr/bin/gcc-7 /usr/bin/cc
  sudo ln -s /usr/bin/g++-7 /usr/bin/c++
  gcc --version
  ```


### DeePMD-kit/C++ 接口

见[官方教程](https://deepmd.readthedocs.io/en/latest/install.html#install-the-c-interface)（可能需要apt-get安装cmake，如果没有足够权限也可以通过pip安装）。

### 和其他计算软件（如lammps）的接口

见[官方教程](https://deepmd.readthedocs.io/en/latest/install.html#install-lammps-s-DeePMD-kit-module)和[这里](./deepmd-kit_installation_51.md)。

