---
title: DeePMD-kit安装教程1.0
authors: Yunpei Liu
priority: 2.9
---

# DeepMD-kit安装实战：服务器篇（旧版）

> 本部分写于2019年11月，基于国重服务器环境进行安装，适用于Tensorflow版本低于1.13的情形。目前针对更高版本已经有[新版教程](/docs/wiki/software_installation/deepmd-kit_installation_191.md)，请移步。

## 准备工作

首先准备必要的依赖。

检查可用的模块，并加载必要的模块：

```
module avail
module add cuda/9.2
module add gcc/4.9.4
# gcc>=4.9 required by dp_ipi, or it won't be built.
# For gcc-8.3 could not be supported, here we select a lower version.
```

本教程推荐使用conda虚拟环境安装，故：

```
module add miniconda/3.7
conda create -n deepmd python=3.6
conda activate deepmd
```

下载并编译nccl：

```
cd /some/nccl_download_path
git clone https://github.com/NVIDIA/nccl.git -b v2.4.8-1
cd nccl
make -j src.build --prefix="/some/nccl_install_path" NVCC_GENCODE="-gencode=arch=compute_70,code=sm_70"
```

由于国重GPU节点不能直接联网，故使用登陆节点进行编译效率较高，但由于缺少必要的依赖`libcuda.so`和`libcuda.so.1`（包含在GPU驱动中，登陆节点未安装），故采用stubs所带的库编译，并手动加入环境变量。

```
ln -s /share/cuda/9.2/lib64/stubs/libcuda.so /some/local/path/libcuda.so.1
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/share/cuda/9.2/lib64/stubs:/some/local/path
```

在某个想要的路径下将tensorflow-1.12版本的源代码下载好：

```
cd /some/workspace
git clone https://github.com/tensorflow/tensorflow tensorflow -b r1.12 --depth=1
```

下载好bazel安装包并运行，将所需的环境加入环境变量：

```
wget https://github.com/bazelbuild/bazel/releases/download/0.15.0/bazel-0.15.0-installer-linux-x86_64.sh
chmod +x bazel-0.15.0-installer-linux-x86_64.sh
./bazel-0.15.0-installer-linux-x86_64.sh --user
export PATH="$PATH:$HOME/bin"
```

## tensorflow编译

首先配置tensorflow的编译选项：

```
cd tensorflow/
./configure
```

根据需要，提供正确的组件和路径：

```
Please specify the location of python. [Default is /xxx]:

Found possible Python library paths:
  /xxx/python3.6/site-packages
Please input the desired Python library path to use. Default is [xxx/python3.6/site-packages]

Do you wish to build TensorFlow with Apache Ignite support? [Y/n]: Y

Do you wish to build TensorFlow with XLA JIT support? [Y/n]: Y

Do you wish to build TensorFlow with OpenCL SYCL support? [y/N]: N

Do you wish to build TensorFlow with ROCm support? [y/N]: N

Do you wish to build TensorFlow with CUDA support? [y/N]: Y

Please specify the CUDA SDK version you want to use. [Leave empty to default to CUDA 9.0]: 9.2

Please specify the location where CUDA 9.2 toolkit is installed. Refer to README.md for more details. [Default is /usr/local/cuda]: /share/cuda/9.2

Please specify the cuDNN version you want to use. [Leave empty to default to cuDNN 7]: 7

Please specify the location where cuDNN 7 library is installed. Refer to README.md for more details. [Default is /usr/local/cuda-10.0]: /share/cuda/9.2

Do you wish to build TensorFlow with TensorRT support? [y/N]: N

Please specify the NCCL version you want to use. If NCCL 2.2 is not installed, then you can use version 1.3 that can be fetched automatically but it may have worse performance with multiple GPUs. [Default is 2.2]: 2.4.8

Please specify the location where NCCL 2 library is installed. Refer to README.md for more details. [Default is /usr/local/cuda]:/some/nccl_install_path

Please note that each additional compute capability significantly increases your build time and binary size. [Default is: 3.5,7.0] 6.1

Do you want to use clang as CUDA compiler? [y/N]: N

Please specify which gcc should be used by nvcc as the host compiler. [Default is /xxx/gcc]: 

Do you wish to build TensorFlow with MPI support? [y/N]: N

Please specify optimization flags to use during compilation when bazel option "--config=opt" is specified [Default is -march=native]: -march=native

Would you like to interactively configure ./WORKSPACE for Android builds? [y/N]:N
```

> **注意**
> 
> 1. CUDA需要写清是9.2版本，否则可能会找不到小版本的依赖库。
> 
> 然后运行编译，但由于该节点的版本较为非主流，建议自行编译tf的python interface以避免兼容性问题。
> 
> ```
> bazel build --config=opt --copt=-msse4.2 --copt=-mavx --copt=-mavx2 --copt=-mfma --local_resources 2048,.5,1.0 --config=cuda //tensorflow/tools/pip_package:build_pip_package --action_env="LD_LIBRARY_PATH=${LD_LIBRARY_PATH}"
> ```
> 
> 由于目前节点支持主要的几种优化参数，故可以全部打开以加快运行速度。
> 
> 为了他人的正常使用，建议主动限制在登陆节点上编译时的内存和CPU资源使用量。`--local_resources 2048,.5,1.0`这个设定可能有些保守，但可以保证不会占用过多资源（实测需要11个小时左右，但全程内存占用不超过2G且只使用了一个线程，若觉得太慢可以把中间的参数适当调高）。
> 
> 2. nccl和gcc的路径对应前面加载和编译的环境。

编译如果通过，则再运行以下命令编译c++ interface（实际上一步已经编译好所需的大部分依赖，这一步只是再封装成c++库）：

```
bazel build -c opt --copt=-msse4.2 --copt=-mavx --copt=-mavx2 --copt=-mfma --config=cuda --verbose_failures //tensorflow:libtensorflow_cc.so --action_env="LD_LIBRARY_PATH=${LD_LIBRARY_PATH}"
```

这里可以先将tensorflow-python安装好。

```
./bazel-bin/tensorflow/tools/pip_package/build_pip_package /tmp/tensorflow_pkg
pip install /tmp/tensorflow_pkg/tensorflow-version-tags.whl # depends on your version info
```

然后，将进行一系列依赖的编译和安装。以防万一，建议首先安装依赖，方便起见，这里使用conda安装。

```
conda install automake autoconf libtool
```

将cmake切换到新版本：

```
module add cmake/3.7.3
```

指定tf-cc的目标路径为变量`$tensorflow_root`，并依次运行以下命令：

```
mkdir -p $tensorflow_root
mkdir /tmp/proto
sed -i 's;PROTOBUF_URL=.*;PROTOBUF_URL=\"https://mirror.bazel.build/github.com/google/protobuf/archive/v3.6.0.tar.gz\";g' tensorflow/contrib/makefile/download_dependencies.sh
tensorflow/contrib/makefile/download_dependencies.sh
cd tensorflow/contrib/makefile/downloads/protobuf/
./autogen.sh
./configure --prefix=/tmp/proto/
make
make install
mkdir /tmp/eigen
cd ../eigen
mkdir build_dir
cd build_dir
cmake -DCMAKE_INSTALL_PREFIX=/tmp/eigen/ ../
make install
mkdir /tmp/nsync
cd ../../nsync
mkdir build_dir
cd build_dir
cmake -DCMAKE_INSTALL_PREFIX=/tmp/nsync/ ../
make
make install
cd ../../absl
bazel build
mkdir -p $tensorflow_root/include/
rsync -avzh --include '*/' --include '*.h' --exclude '*' absl $tensorflow_root/include/
cd ../../../../..
mkdir $tensorflow_root/lib
cp bazel-bin/tensorflow/libtensorflow_cc.so $tensorflow_root/lib/
cp bazel-bin/tensorflow/libtensorflow_framework.so $tensorflow_root/lib/
cp /tmp/proto/lib/libprotobuf.a $tensorflow_root/lib/
cp /tmp/nsync/lib64/libnsync.a $tensorflow_root/lib/
mkdir -p $tensorflow_root/include/tensorflow
cp -r bazel-genfiles/* $tensorflow_root/include/
cp -r tensorflow/cc $tensorflow_root/include/tensorflow
cp -r tensorflow/core $tensorflow_root/include/tensorflow
cp -r third_party $tensorflow_root/include
cp -r /tmp/proto/include/* $tensorflow_root/include
cp -r /tmp/eigen/include/eigen3/* $tensorflow_root/include
cp -r /tmp/nsync/include/*h $tensorflow_root/include
cd $tensorflow_root/include
find . -name "*.cc" -type f -delete
rm -fr /tmp/proto /tmp/eigen /tmp/nsync
```

以完成c++部分的编译。

## DeePMD-kit安装(1.0+)

首先下载DeePMD-kit，并进入：

```
cd /some/workspace
git clone https://github.com/deepmodeling/deepmd-kit.git
cd deepmd-kit
deepmd_source_dir=`pwd`
```

如果前面使用了`module load gcc/4.9.4`提供的高版本gcc（以4.9.4为例）进行编译，需要手动载入对应的环境变量供cmake识别正确的gcc版本。

```
export CC=/share/apps/gcc/4.9.4/bin/gcc
export CXX=/share/apps/gcc/4.9.4/bin/g++
```

然后安装dpmd-py

```
pip install .
```

> 如果遇到`no module named 'google'`或者`no module named 'absl'`的报错，则可能存在版本bug，需要重新安装依赖。
> 
> ```
> pip install --update protobus
> pip install --update absl-py
> ```

指定DeePMD-kit的目标路径为变量`$deepmd_root`，随后编译DeePMD-kit C++ Interface：

```
cd $deepmd_source_dir/source
mkdir build 
cd build
cmake -DTENSORFLOW_ROOT=$tensorflow_root -DCMAKE_INSTALL_PREFIX=$deepmd_root ..
make
make install
```

如果运行：

```
$ ls $deepmd_root/bin
dp_ipi
$ ls $deepmd_root/lib
libdeepmd_ipi.so  libdeepmd_op.so  libdeepmd.so
```

得到上述的结果，说明编译成功（若`cmake`时检测到的是4.8或更低版本的gcc，则编译结果会缺少`dp_ipi`和`libdeepmd_ipi.so`）。

## LAMMPS DeePMD-kit 接口编译

首先编译接口：

```
cd $deepmd_source_dir/source/build
make lammps
```

然后下载好稳定版的lammps，并解压：

```
cd /some/workspace
wget -c https://lammps.sandia.gov/tars/lammps-stable.tar.gz
tar xf lammps-stable.tar.gz
```

若解压后得到目录名为`lammps-31Mar17`，则

```
cd lammps-31Mar17/src/
cp -r $deepmd_source_dir/source/build/USER-DEEPMD .
```

打开deepmd module，并根据需要添加所需的模块，以`fep`为例：

```
make yes-user-deepmd
make yes-user-fep 
```

载入需要的mpi库，并编译：

```
module load intel/15.0.6
module load mpi/intel/5.0.3.049
make mpi -j4
```

得到可执行文件：`lmp_mpi`。

可将该文件复制到在`$PATH`中的路径，则可以直接输入文件名运行。

## 注意

完成上述安装步骤后，若需要立即测试运行，**必须**将stubs提供的`libcuda.so`和`libcuda.so.1`从环境变量中移除，否则运行时会报错。

可以直接退出登陆并重新登陆，以免出现该问题。

## 一些可能的坑

尽管上述过程应该已经绕过了大部分的坑，但仍不能保证100%安装运行成功。这里记录几种可能的报错的处理方案。

### 需要conda init

这种情况已知可能发生在lsf脚本提交的步骤，来源于`conda activate deepmd`的步骤。具体原因尚不清楚，解决方案是手动载入所需的环境变量。推荐的做法是利用用户自定义module。

首先，启用自定义module：

```
module load use.own
```

然后运行`module avail`查看自定义脚本的文件位置，输出结果可能如下：

```
----------- /share/base/modulefiles/compilers -----------
............

------------- /usr/share/Modules/modulefiles ------------
dot         module-git  module-info modules     null        use.own

------------ /data/home/someuser/privatemodules ------------
null
```

显示`/data/home/someuser/privatemodules`是当前用户自定义模块的存放位置。

则创建路径，并进入：

```
mkdir -p /data/home/someuser/privatemodules
cd /data/home/someuser/privatemodules
```

然后根据想要的名字创建文件或目录。

比如想以deepmd为模块名，且希望提供不同版本的支持，则可以：

```
mkdir deepmd
vim 1.0
```

编辑1.0文件：

```
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

module-whatis "Miniconda, an alternative distirbution for python 3.6"

# set environment variables

    setenv        PYTHONROOT    /data/home/someuser/anaconda3/envs/deepmd

    prepend-path    PATH        $env(PYTHONROOT)/bin
    prepend-path    MANPATH        $env(PYTHONROOT)/share/man
    prepend-path    PYTHONPATH    $env(PYTHONROOT)/lib/python3.6/site-packages
```

注意修改`PYTHONROOT`为正确的虚拟环境路径（可用`conda env list`查看）,并且`python3.6`也要与实际使用的python版本一致。

这样，便可以通过module调用所需的虚拟环境。

使用时提交脚本可以这样写：

```
module load use.own
module load deepmd/1.0
```
