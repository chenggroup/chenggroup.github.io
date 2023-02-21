---
title: DeepMD-kit快速安装
authors: 
  - Yunpei Liu
comments: true
---

# DeepMD-kit快速安装

为减少后续安装的困难，请优先参考[最佳实践](./deepmd-kit_installation_new.md)。本文介绍的方法成型时，DP尚未实现对Lammps的解耦，但仍然可用。

> 本部分主体写于2021年，截至目前（2022.08）仍适用，并且随版本升级仍在更新。
> 
> 教程中使用的尚且是CUDA 10.1，但对CUDA 11.x也适用。

背景：以 Zeus 集群为例，在服务器通过源代码编译安装DeepMD-kit和包含完整接口的LAMMPS。虽然官方已经提供了[通过 Conda 一键安装的方法](https://deepmd.readthedocs.io/en/master/install.html#easy-installation-methods)，但由于此法所安装的各个组件均为预编译版本，因而无法做更多拓展和改动，且通过 Conda 安装的 Protobuf 存在版本冲突，无法进一步编译其他接口。这里介绍一种方法，通过 Conda 安装通常不需要较大改动的TensorFlow C++ Interface，其余部分仍手动编译。

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

> 版本号仅供参考，实际安装可能会不一样，参考执行即可。

## 创建新的环境

首先准备必要的依赖。

检查可用的模块，并加载必要的模块：

```
module avail
module add cuda/10.1
module add gcc/7.4.0
```

注意这里导入的是GCC 7.4.0版本，如果采用低于4.9.4的版本（不导入GCC）则dp_ipi不会被编译。

然后创建虚拟环境，步骤请参考[Anaconda 使用指南](../cluster_usage/conda.md)。

假设创建的虚拟环境名称是 `deepmd`，则请将步骤最后的 `<your env name>` 替换为 `deepmd`。若采用该步骤的设置，则虚拟环境将被创建在`/data/user/conda/env/deepmd`下（假设用户名为`user`）。

注意请务必为创建的虚拟环境安装所需的Python环境。通常不指定Python版本号的情况下（例如文中的步骤`conda create -n <your env name> python`）会安装conda推荐的最新版本，如需要替代请对应指定，如`conda create -n deepmd python=3.8`。

由于Zeus的GPU节点不能联网，故需要将所需的驱动程序库`libcuda.so`以`libcuda.so.1`的名称手动链接到某个具有权限的路径`/some/local/path`并分别加入环境变量。

```bash
ln -s /share/cuda/10.0/lib64/stubs/libcuda.so /some/local/path/libcuda.so.1
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/share/cuda/10.0/lib64/stubs:/some/local/path
```

!!! tip "提示"
    若在Zeus 集群上安装，管理员已事先把<code>libcuda.so.1</code> 链接在<code>/share/cuda/10.0/lib64/stubs/</code>下，故无需额外创建软链接，同理<code>/some/local/path</code>也无需加入环境变量，但仍需要驱动程序库的符号链接`libcuda.so`。注意这一步骤执行后，实际运行时需要从环境变量中移除

## 安装Tensorflow的C++ 接口

以下安装，假设软件包下载路径均为`/some/workspace`， 以TensorFlow 2.3.0版本、DeePMD-kit 1.3.3 版本为例进行说明，其他版本的步骤请参照修改。

首先创建并进入虚拟环境，这里假设命名为`deepmd`：

```bash
conda create -n deepmd python=3.8
conda activate deepmd
```

搜索仓库，查找可用的TensorFlow的C++ 接口版本。

```bash
conda search libtensorflow_cc -c https://conda.deepmodeling.com
```

结果如下：

```
Loading channels: done
# Name                       Version           Build  Channel
libtensorflow_cc              1.14.0  cpu_h9a2eada_0
libtensorflow_cc              1.14.0  gpu_he292aa2_0
libtensorflow_cc               2.0.0  cpu_h9a2eada_0
libtensorflow_cc               2.0.0  gpu_he292aa2_0
libtensorflow_cc               2.1.0  cpu_cudaNone_0
libtensorflow_cc               2.1.0  gpu_cuda10.0_0
libtensorflow_cc               2.1.0  gpu_cuda10.1_0
libtensorflow_cc               2.1.0   gpu_cuda9.2_0
libtensorflow_cc               2.3.0  cpu_cudaNone_0
libtensorflow_cc               2.3.0  gpu_cuda10.1_0
libtensorflow_cc               2.4.1  gpu_cuda11.0_0
libtensorflow_cc               2.4.1  gpu_cuda11.1_0
libtensorflow_cc               2.5.0  cpu_cudaNone_0
libtensorflow_cc               2.5.0  gpu_cuda10.1_0
libtensorflow_cc               2.5.0  gpu_cuda11.3_0
libtensorflow_cc               2.7.0  cpu_h6ddf1b9_0
libtensorflow_cc               2.7.0 cuda101h50fd26c_0
libtensorflow_cc               2.7.0 cuda113h3372e5c_0
libtensorflow_cc               2.7.0 cuda113hbf71e95_1
libtensorflow_cc               2.9.0  cpu_h681ccd4_0
libtensorflow_cc               2.9.0 cuda102h929c028_0
libtensorflow_cc               2.9.0 cuda116h4bf587c_0
```

这里所希望安装的版本是2.3.0的GPU版本，CUDA版本为10.1，因此输入以下命令安装：

```bash
conda install libtensorflow_cc=2.3.0=gpu_cuda10.1_0 -c https://conda.deepmodeling.org
```

若所安装的环境没有实际的GPU驱动（比如集群的登录节点）或需要用到Conda安装CudaToolkit，可能需要参照[此处](https://conda-forge.org/docs/user/tipsandtricks.html#installing-cuda-enabled-packages-like-tensorflow-and-pytorch)说明强制指定GPU环境。比如：

```bash
CONDA_OVERRIDE_CUDA="11.3" conda install libtensorflow_cc=2.7.0=cuda113hbf71e95_1 -c https://conda.deepmodeling.com
```

请注意`CONDA_OVERRIDE_CUDA`的值需要与GPU支持以及希望用到的CUDA版本相匹配。

!!! tip "提示"
    注意A100仅支持TF 2.4.0以上、CUDA11.2以上，安装时请对应选择。

!!! tip "提示"
    个别版本在后续编译时可能会提示需要<code>libiomp5.so</code>，请根据实际情况确定是否需要提前载入Intel环境（见下文Lammps编译部分）或者<code>conda install intel-openmp</code>。

!!! tip "提示"
    <code>conda</code>命令可能速度较慢，也可以考虑切换为<a href='https://mamba.readthedocs.io/en/latest/installation.html#existing-conda-install'>mamba</a>，后者可大幅加速Conda的性能，且完全兼容。只需参照前述链接安装后将<code>conda</code>替换为<code>mamba</code>即可

若成功安装，则定义环境变量：

```bash
export tensorflow_root=/data/user/conda/env/deepmd
```

即虚拟环境创建的路径。

## 安装DeePMD-kit的Python接口

以防万一可以升级下pip的版本：

```
pip install --upgrade pip
```

接下来安装Tensorflow的Python接口

```bash
pip install tensorflow==2.3.0
```

 若提示已安装，请使用`--upgrade`选项进行覆盖安装。若提示权限不足，请使用`--user`选项在当前账号下安装。

然后下载DeePMD-kit的源代码（注意把v1.3.3替换为需要安装的版本，如`v2.0.3`等）

```bash
cd /some/workspace
git clone --recursive https://github.com/deepmodeling/deepmd-kit.git deepmd-kit -b v1.3.3
```

在运行git clone时记得要`--recursive`，这样才可以将全部文件正确下载下来，否则在编译过程中会报错。

!!! tip "提示"
    如果不慎漏了`--recursive`， 可以采取以下的补救方法：
    ```bash
    git submodule update --init --recursive
    ```

若集群上 Cmake 3没有安装，可以用pip进行安装：

```bash
pip install cmake
```

修改环境变量以使得cmake正确指定编译器：

```bash
export CC=`which gcc`
export CXX=`which g++`
export FC=`which gfortran`
```

若要启用CUDA编译，请导入环境变量：

```bash
export DP_VARIANT=cuda
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

在build目录下运行：

```bash
cmake -DLAMMPS_VERSION_NUMBER=<value> -DTENSORFLOW_ROOT=$tensorflow_root -DCMAKE_INSTALL_PREFIX=$deepmd_root ..
```

请根据自己即将安装的Lammps版本指定`-DLAMMPS_VERSION_NUMBER`的值，目前最新版本的DeePMD-kit默认为`20210929`，如需安装`Lammps 29Oct2020`，请设定为`20201029`。

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

下载LAMMPS安装包，并把接口代码复制到`src`目录下：

```bash
cd /some/workspace
# Download Lammps latest release
wget -c https://lammps.sandia.gov/tars/lammps-stable.tar.gz
tar xf lammps-stable.tar.gz
cd lammps-*/src/
cp -r $deepmd_source_dir/source/build/USER-DEEPMD .
```

### Make命令安装

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

> 目前官方文档改动较大，且未提供历史版本，因而仅适用于官方最新Release版本（目前仅适用于Lammps 29Sep2021以后的版本，但可能随着后续更新适用面进一步缩窄。），使用旧版请注意甄别。

加载MPI环境，并采用MPI方式编译Lammps可执行文件：

```bash
module load intel/17.5.239 mpi/intel/2017.5.239
make mpi -j4
```

!!! warning "注意"
    此处使用的GCC版本应与之前编译Tensorflow C++接口和DeePMD-kit C++接口一致，否则可能会报错：<code>@GLIBCXX_3.4.XX</code>。如果在前面的安装中已经加载了GCC 7.4.0，请在这里也保持相应环境的加载。

经过以上过程，Lammps可执行文件`lmp_mpi`已经编译完成，用户可以执行该程序调用训练的势函数进行MD模拟。

### Cmake安装

也可以直接使用Cmake进行编译，更加干净、快捷。

如需要安装Plumed，请首先利用Conda安装GSL环境：

```bash
conda install gsl
```

然后请编辑`lammps-stable/cmake/CMakeLists.txt`，找到`set(STANDARD_PACKAGES`这一行，并在末尾括号内增加一项：`USER-DEEPMD`：

```cmake
set(STANDARD_PACKAGES
  ...  
  USER-DEEPMD)
```

然后在`lammps-stable`目录下，新建`build`目录：

```bash
cd lammps-stable
mkdir build
cd build
```

进行配置：

```bash
cmake -C ../cmake/presets/most.cmake -C ../cmake/presets/nolib.cmake \
-D BUILD_MPI=yes -D BUILD_OMP=yes -D LAMMPS_MACHINE=mpi \
-D WITH_JPEG=no -D WITH_PNG=no -D WITH_FFMPEG=no \
-D PKG_PLUMED=yes -D PKG_COLVARS=yes -D PKG_USER-DEEPMD=ON \
-D CMAKE_INSTALL_PREFIX=/data/user/conda/env/deepmd \
-D CMAKE_CXX_FLAGS="-std=c++14 -DHIGH_PREC -DLAMMPS_VERSION_NUMBER=20220623 -I${deepmd_root}/include -I${tensorflow_root}/include -L${deepmd_root}/lib -L${tensorflow_root}/lib -Wl,--no-as-needed -ldeepmd_cc -ltensorflow_cc -ltensorflow_framework -Wl,-rpath=${deepmd_root}/lib -Wl,-rpath=${tensorflow_root}/lib" \
../cmake
```

注意`CMAKE_INSTALL_PREFIX`指示的是安装路径，请根据实际情况修改。

!!! warning "注意"
    这里额外关闭了图形输出模块（JPEG、PNG、FFMPEG），因为Conda自带的图形库会与系统有冲突，暂时没有解决，且使用`make`默认也不会安装。

!!! warning "注意"
    由于未知原因，有时候CMake会找不到Conda安装的GSL。但若提前编译好Plumed并采用Runtime方式载入，可不需要GSL：<code>-D PLUMED_MODE=runtime</code>

然后进行编译：

```bash
make -j 16
make install
```

经过以上过程，Lammps可执行文件`lmp_mpi`已经编译完成，用户可以执行该程序调用训练的势函数进行MD模拟。

## DP-CP2K 安装指引

首先clone对应的安装包：

```bash
git clone https://github.com/Cloudac7/cp2k.git -b deepmd_latest --recursive --depth=1
```

然后运行相应的Toolchain脚本：

```bash
cd tools/toolchain/
./install_cp2k_toolchain.sh --enable-cuda=no --with-deepmd=$deepmd_root --with-tfcc=$tensorflow_root --deepmd-mode=cuda --mpi-mode=no --with-libint=no --with-libxc=no --with-libxsmm=no
```

根据脚本运行结尾的提示复制arch文件并source所需的环境变量。最后回到主目录进行编译：

```bash
make -j 4 ARCH=local VERSION="ssmp sdbg"
```

编译正确完成后，可执行文件生成在`exe/`下，即`cp2k.sopt`。

> 注意目前DP-CP2K暂未支持MPI，因而请单独编译此Serial版本。且CP2K由于IO问题，性能相比Lammps低50%以上，如非刚需还是建议使用Lammps进行MD模拟，后者可提供更多特性和加速的支持。
> 
> 同时目前开发者遇到一些困难，故提交的PR尚未更新且由于沉默过久已被官方关闭。如读者有在CP2K实现共享状态的开发经验，请联系作者，谢谢。
> 
> Now there is some difficulty in implemetion of shared state in CP2K run to decrease IO in each MD step. However, the developer has not find out a proper way as a solution, making the PR silent. If you could provide any experience, please contact me. Thanks!
