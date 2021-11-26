---
title: DeepMD-kit快速安装：服务器篇
authors: 
  - Yunpei Liu
priority: 2.40
---

# DeepMD-kit快速编译安装

背景：以 Zeus 集群为例，在服务器通过源代码编译安装DeepMD-kit和包含完整接口的LAMMPS。虽然官方已经提供了[通过 Conda 一键安装的方法](https://deepmd.readthedocs.io/en/master/install.html#easy-installation-methods)，但由于此法所安装的各个组件均为预编译版本，因而无法做更多拓展和改动，且通过 Conda 安装的 Protobuf 存在版本冲突，无法从这一版本进一步编译其他接口。这里介绍一种方法，通过 Conda 安装通常不需要较大改动的TensorFlow C++ Interface，其余部分仍手动编译。

## 初始环境说明

以下过程以 Zeus 集群为例，操作系统及版本为CentOS 7，管理节点联网，采用module作为环境管理。

以下是预先配置好的环境，对于其他集群，可以此要求准备环境，其中 Intel MPI 可以用 MPICH 代替，其余组件请自行安装。注意CUDA 10.1对Nvidia驱动版本有要求，需要预先检查好（可用`nvidia-smi`快速查看）。

- 通过yum安装
  - Git >= 1.8.2
- 通过module加载
  - CUDA 10.1
  - Miniconda 3
  - GCC >= 7.4.0
  - Intel MPI 2017 （暂未对其他版本进行测试）

## 创建新的环境

首先准备必要的依赖。

检查可用的模块，并加载必要的模块：

```
module avail
module add cuda/10.1
module add gcc/7.4.0
```

注意这里导入的是GCC 7.4.0版本，如果采用低于4.9.4的版本（不导入GCC）则dp_ipi不会被编译。

然后创建虚拟环境，步骤请参考[Anaconda 使用指南](https://chenggroup.github.io/wiki/softwares_usage/conda)。

假设创建的虚拟环境名称是 `deepmd`，则请将步骤最后的 `<your env name>` 替换为 `deepmd`。若采用该步骤的设置，则虚拟环境将被创建在`/data/user/conda/env/deepmd`下（假设用户名为`user`）。

由于GPU节点不能联网，故需要将所需的驱动程序库`libcuda.so`以`libcuda.so.1`的名称手动链接到某个具有权限的路径`/some/local/path`并分别加入环境变量。

```bash
ln -s /share/cuda/10.0/lib64/stubs/libcuda.so /some/local/path/libcuda.so.1
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/share/cuda/10.0/lib64/stubs:/some/local/path
```

{% include alert.html type="tip" title="提示" content="若在 Zeus 集群上安装，管理员已事先把<code>libcuda.so.1</code> 链接在<code>/share/cuda/10.0/lib64/stubs/</code>下，故无需额外创建软链接，同理<code>/some/local/path</code>也无需加入环境变量。" %}

## 安装Tensorflow的C++ 接口

以下安装，假设软件包下载路径均为`/some/workspace`， 以TensorFlow 2.3.0版本、DeePMD-kit 1.3.3 版本为例进行说明，其他版本的步骤请参照修改。

首先进入虚拟环境：

```
conda activate deepmd
```

搜索仓库，查找可用的TensorFlow的C++ 接口版本。

```bash
conda search libtensorflow_cc 
```

结果如下：

```
Loading channels: done
# Name                       Version           Build  Channel
libtensorflow_cc               2.1.0  gpu_cuda10.0_0  deepmodeling
libtensorflow_cc               2.1.0   gpu_cuda9.2_0  deepmodeling
libtensorflow_cc               2.3.0  cpu_cudaNone_0  deepmodeling
libtensorflow_cc               2.3.0  gpu_cuda10.1_0  deepmodeling
libtensorflow_cc               2.4.1  gpu_cuda11.0_0  deepmodeling
libtensorflow_cc               2.4.1  gpu_cuda11.1_0  deepmodeling
```

这里所希望安装的版本是2.3.0的GPU版本，CUDA版本为10.1，因此输入以下命令安装：

```bash
conda install libtensorflow_cc=2.3.0=gpu_cuda10.1_0 -c deepmodeling
```

若成功安装，则定义环境变量：

```bash
export tensorflow_root=/data/user/conda/env/deepmd
```

即虚拟环境创建的路径。

## 安装DeePMD-kit的Python接口

接下来安装Tensorflow的Python接口

```bash
pip install tensorflow==2.3.0
```

 若提示已安装，请使用`--upgrade`选项进行覆盖安装。若提示权限不足，请使用`--user`选项在当前账号下安装。

然后下载DeePMD-kit的源代码。

```bash
cd /some/workspace
git clone --recursive https://github.com/deepmodeling/deepmd-kit.git deepmd-kit -b v1.3.3
```

在运行git clone时记得要`--recursive`，这样才可以将全部文件正确下载下来，否则在编译过程中会报错。

{% include alert.html type="tip" title="提示" content="
如果不慎漏了<code>--recursive</code>， 可以采取以下的补救方法，效果与直接 clone 一样：

<pre><code>cd deepmd-kit/source/op/cuda/
git clone https://github.com/NVlabs/cub.git
</code></pre>" %}
若集群上 Cmake 3没有安装，可以用pip进行安装：

```bash
pip install cmake
```

随后通过pip安装DeePMD-kit：

```bash
cd deepmd-kit
pip install .
```

## 安装DeePMD-kit的C++ 接口

延续上面的步骤，下面开始编译DeePMD-kit C++接口：

```bash
deepmd_source_dir=`pwd`
cd $deepmd_source_dir/source
mkdir build 
cd build
```

假设DeePMD-kit C++ 接口安装在`/some/workspace/deepmd_root`下，定义安装路径`deepmd_root`：

```bash
export deepmd_root=/some/workspace/deepmd_root
```

修改环境变量以使得cmake正确指定编译器：

```bash
export CC=`which gcc`
export CXX=`which g++`
```

在build目录下运行：

```bash
cmake -DTENSORFLOW_ROOT=$tensorflow_root -DCMAKE_INSTALL_PREFIX=$deepmd_root ..
```

若通过yum同时安装了Cmake 2和Cmake 3，请将以上的`cmake`切换为`cmake3`。

最后编译并安装：

```bash
make
make install
```

若无报错，通过以下命令执行检查是否有正确输出：

```bash
$ ls $deepmd_root/bin
dp_ipi
$ ls $deepmd_root/lib
libdeepmd_ipi.so  libdeepmd_op.so  libdeepmd.so
```

## 安装LAMMPS的DeePMD-kit模块

接下来安装

```bash
cd $deepmd_source_dir/source/build
make lammps
```

此时在`$deepmd_source_dir/source/build`下会出现`USER-DEEPMD`的LAMMPS拓展包。

下载LAMMPS安装包，按照常规方法编译LAMMPS：

```bash
cd /some/workspace
# Download Lammps latest release
wget -c https://lammps.sandia.gov/tars/lammps-stable.tar.gz
tar xf lammps-stable.tar.gz
cd lammps-*/src/
cp -r $deepmd_source_dir/source/build/USER-DEEPMD .
```

选择需要编译的包（若需要安装其他包，请参考[Lammps官方文档](https://lammps.sandia.gov/doc/Build_package.html)）：

```bash
make yes-user-deepmd
make yes-kspace
```

如果没有`make yes-kspace` 会因缺少`pppm.h`报错。

这里也可以通过以下命令批量安装其他包：

```bash
make yes-all                        # install all packages
make no-lib                         # uninstall packages that require extra libraries
make no-ext                         # uninstall packages that require external libraries
```

注意如Plumed、SMD、COLVARS等等需要提前配置或预先编译的插件如需安装请参考[Lammps官方文档](https://lammps.sandia.gov/doc/Build_package.html)，同时诸如 Intel、GPU等加速包如果不需要编译可能需要额外手动取消安装。

加载MPI环境，并采用MPI方式编译Lammps可执行文件：

```bash
module load intel/17.5.239 mpi/intel/2017.5.239
make mpi -j4
```

{% include alert.html type="warning" title="注意" content="此处使用的GCC版本应与之前编译Tensorflow C++接口和DeePMD-kit C++接口一致，否则可能会报错：<code>@GLIBCXX_3.4.XX</code>。如果在前面的安装中已经加载了GCC 7.4.0，请在这里也保持相应环境的加载。" %}

经过以上过程，Lammps可执行文件`lmp_mpi`已经编译完成，用户可以执行该程序调用训练的势函数进行MD模拟。

