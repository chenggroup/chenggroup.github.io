---
title: DeepMD-kit安装：旧版
authors: 
  - Jiaxin Zhu
  - Yunpei Liu
comments: true
---

# DeepMD-kit安装：旧版

> 本部分写于2020年，适用于DeePMD-kit 1.x 和 TensorFlow 1.14。对目前较新的版本可能不适用，请移步[安装最佳实践](./deepmd-kit_installation_new.md)和[快速安装教程](./deepmd-kit_installation_191.md)

背景：以 Zeus 集群为例，在服务器安装DeepMD-kit和包含完整接口的LAMMPS。

参考：

[DeepMD-kit](https://github.com/deepmodeling/deepmd-kit#install-the-tensorflows-c-interface)

[TensorFlow](https://www.tensorflow.org/install/)

## 初始环境说明

以下过程以 Zeus 集群为例，操作系统及版本为CentOS 7，采用module作为环境管理。

- 通过yum安装：
  - Cmake 3.7
  - GCC 4.8.5
  - Git 1.8.2
- 通过module加载
  - CUDA 10.0
  - Miniconda3 (Python 3.7)
  - GCC 4.9.4
  - Intel MPI 2017

## 创建新的环境

首先准备必要的依赖。

检查可用的模块，并加载必要的模块：

```
module avail
module add cuda/10.0
module add gcc/4.9.4
```

注意这里导入的是gcc 4.9.4版本，如果采用更低的版本（不导入gcc）则dp_ipi不会被编译。

然后创建虚拟环境，步骤请参考[Anaconda 使用指南](https://chenggroup.github.io/wiki/softwares_usage/conda)。

假设创建的虚拟环境名称是 `deepmd`，则请将步骤最后的 `<your env name>` 替换为 `deepmd`。若采用该步骤的设置，则虚拟环境将被创建在`/data/user/conda/env/deepmd`下（假设用户名为`user`）。

由于GPU节点不能联网，故我们需要将所需的驱动程序库`libcuda.so`和`libcuda.so.1`手动链接到某个路径`/some/local/path`并加入环境变量。

```bash
ln -s /share/cuda/10.0/lib64/stubs/libcuda.so /some/local/path/libcuda.so.1
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/share/cuda/10.0/lib64/stubs:/some/local/path
```

!!! tip "提示"
    若在 Zeus 集群上安装，管理员已事先把<code>libcuda.so.1</code> 链接在<code>/share/cuda/10.0/lib64/stubs/</code>下，故无需额外创建软链接，同理<code>/some/local/path</code>也无需加入环境变量。

## 安装Tensorflow的C++ 接口

以下安装，假设软件包下载路径均为`/some/workspace`， 以TensorFlow 1.14.0版本、DeePMD-kit 1.2.0 版本为例进行说明，其他版本的步骤请参照修改。

### 下载对应的bazel安装包

```bash
cd /some/workspace
wget https://github.com/bazelbuild/bazel/releases/download/0.24.0/bazel-0.24.0-installer-linux-x86_64.sh
chmod +x bazel-0.24.0-installer-linux-x86_64.sh
./bazel-0.24.0-installer-linux-x86_64.sh --user
export PATH="$HOME/bin:$PATH"
```

!!! warning "注意"
    注意bazel的兼容性问题，合理的bazel版本设置请参阅<a href='https://www.tensorflow.org/install/source#tested_build_configurations'>Tensorflow官方文档中的说明</a>。

### 下载TensorFlow源代码

```bash
cd /some/workspace 
git clone https://github.com/tensorflow/tensorflow tensorflow -b v1.14.0 --depth=1
cd tensorflow
```

### 编译TensorFlow C++ Interface

在`tensorflow`文件夹下运行`configure`，设置编译参数。

```
./configure
Please specify the location of python. [Default is xxx]:

Found possible Python library paths:
  /xxx/xxx/xxx
Please input the desired Python library path to use.  Default is [xxx]

Do you wish to build TensorFlow with XLA JIT support? [Y/n]:
XLA JIT support will be enabled for TensorFlow.

Do you wish to build TensorFlow with OpenCL SYCL support? [y/N]:
No OpenCL SYCL support will be enabled for TensorFlow.

Do you wish to build TensorFlow with ROCm support? [y/N]:
No ROCm support will be enabled for TensorFlow.

Do you wish to build TensorFlow with CUDA support? [y/N]: y
CUDA support will be enabled for TensorFlow.

Do you wish to build TensorFlow with TensorRT support? [y/N]:
No TensorRT support will be enabled for TensorFlow.

Found CUDA 10.0 in:
    /share/cuda/10.0/lib64
    /share/cuda/10.0/include
Found cuDNN 7 in:
    /share/cuda/10.0/lib64
    /share/cuda/10.0/include

Please specify a list of comma-separated CUDA compute capabilities you want to build with.
You can find the compute capability of your device at: https://developer.nvidia.com/cuda-gpus.
Please note that each additional compute capability significantly increases your build time and binary size, and that TensorFlow only supports compute capabilities >= 3.5 [Default is: 3.5,7.0]:

Do you want to use clang as CUDA compiler? [y/N]:
nvcc will be used as CUDA compiler.

Please specify which gcc should be used by nvcc as the host compiler. [Default is /share/apps/gcc/4.9.4/bin/gcc]:

Do you wish to build TensorFlow with MPI support? [y/N]:
No MPI support will be enabled for TensorFlow.

Please specify optimization flags to use during compilation when bazel option "--config=opt" is specified [Default is -march=native -Wno-sign-compare]:

Would you like to interactively configure ./WORKSPACE for Android builds? [y/N]:
Not configuring the WORKSPACE for Android builds.

Preconfigured Bazel build configs. You can use any of the below by adding "--config=<>" to your build command. See .bazelrc for more details.
    --config=mkl             # Build with MKL support.
    --config=monolithic      # Config for mostly static monolithic build.
    --config=gdr             # Build with GDR support.
    --config=verbs           # Build with libverbs support.
    --config=ngraph          # Build with Intel nGraph support.
    --config=numa            # Build with NUMA support.
    --config=dynamic_kernels    # (Experimental) Build kernels into separate shared objects.
    --config=v2              # Build TensorFlow 2.x instead of 1.x.
Preconfigured Bazel build configs to DISABLE default on features:
    --config=noaws           # Disable AWS S3 filesystem support.
    --config=nogcp           # Disable GCP support.
    --config=nohdfs          # Disable HDFS support.
    --config=noignite        # Disable Apache Ignite support.
    --config=nokafka         # Disable Apache Kafka support.
    --config=nonccl          # Disable NVIDIA NCCL support.
Configuration finished
```

!!! warning "注意"
    若采用前文导入的GCC 4.9.4版本，请根据<code>which gcc</code>的输出判断GCC的安装路径。但一般情况下安装程序可以直接检测到正确路径。

随后进行编译，由于时间较长，可以考虑使用screen或者tmux将进程放置在后台。

```
bazel build -c opt --verbose_failures //tensorflow:libtensorflow_cc.so
```

!!! info "说明"
    安装高版本Tensorflow（如2.1.0）时，若提示没有<code>git -c</code>的命令，请升级git到最新版。用户可能需要在本地进行编译并加入环境变量。

!!! tip "提示"
    一般情况下，bazel默认在<code>~/.cache/bazel</code>下进行编译。由于编译所需硬盘空间较大，如有需要，请在运行bazel前采用环境变量指定编译用临时文件夹，以<code>/data/user/.bazel</code>为例：<pre><code>export TEST_TMPDIR=/data/user/.bazel</code></pre>

### 整合运行库与头文件

假设Tensorflow C++ 接口安装在`/some/workspace/tensorflow_root`下，则定义环境变量：

```bash
export tensorflow_root=/some/workspace/tensorflow_root
```

创建上述文件夹并从编译结果中抽取运行库和头文件。

```bash
mkdir -p $tensorflow_root

mkdir $tensorflow_root/lib
cp -d bazel-bin/tensorflow/libtensorflow_cc.so* $tensorflow_root/lib/
cp -d bazel-bin/tensorflow/libtensorflow_framework.so* $tensorflow_root/lib/
cp -d $tensorflow_root/lib/libtensorflow_framework.so.1 $tensorflow_root/lib/libtensorflow_framework.so

mkdir -p $tensorflow_root/include/tensorflow
cp -r bazel-genfiles/* $tensorflow_root/include/
cp -r tensorflow/cc $tensorflow_root/include/tensorflow
cp -r tensorflow/core $tensorflow_root/include/tensorflow
cp -r third_party $tensorflow_root/include
cp -r bazel-tensorflow/external/eigen_archive/Eigen/ $tensorflow_root/include
cp -r bazel-tensorflow/external/eigen_archive/unsupported/ $tensorflow_root/include
rsync -avzh --include '*/' --include '*.h' --include '*.inc' --exclude '*' bazel-tensorflow/external/protobuf_archive/src/ $tensorflow_root/include/
rsync -avzh --include '*/' --include '*.h' --include '*.inc' --exclude '*' bazel-tensorflow/external/com_google_absl/absl/ $tensorflow_root/include/absl
```

清理目标目录下赘余的源代码文件，保留编译好的接口。

```bash
cd $tensorflow_root/include
find . -name "*.cc" -type f -delete
```

## 安装DeePMD-kit的Python接口

首先安装Tensorflow的Python接口

```bash
pip install tensorflow-gpu==1.14.0
```

 若提示已安装，请使用`--upgrade`选项进行覆盖安装。若提示权限不足，请使用`--user`选项在当前账号下安装。

然后下载DeePMD-kit的源代码。

```bash
cd /some/workspace
git clone --recursive https://github.com/deepmodeling/deepmd-kit.git deepmd-kit
```

在运行git clone时记得要`--recursive`，这样才可以将全部文件正确下载下来，否则在编译过程中会报错。

!!! tip "提示"
    

如果不慎漏了<code>--recursive</code>， 可以采取以下的补救方法：

<pre><code>git submodule update --init --recursive
</code></pre>" %}

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

因为GCC版本差别，可能没有`$deepmd_root/bin/dp_ipi`。

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

加载MPI环境，并采用MPI方式编译Lammps可执行文件：

```bash
module load intel/17u5 mpi/intel/17u5
make mpi -j4
```

!!! warning "注意"
    此处使用的GCC版本应与之前编译Tensorflow C++接口和DeePMD-kit C++接口一致，否则可能会报错：<code>@GLIBCXX_3.4.XX</code>。如果在前面的安装中已经加载了GCC 4.9.4，请在这里也保持相应环境的加载。

经过以上过程，Lammps可执行文件`lmp_mpi`已经编译完成，用户可以执行该程序调用训练的势函数进行MD模拟。
