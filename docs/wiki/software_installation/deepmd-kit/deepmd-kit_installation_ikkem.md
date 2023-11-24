---
title: DeePMD-kit安装实战：嘉庚超算
authors: 
  - 朱嘉欣
comments: true
---

# DeePMD-kit安装实战：嘉庚超算

嘉庚超算中心没有统一安装DeepMD-kit软件，用户使用前需要自行编译。本文参考[最佳实践](./deepmd-kit_installation_new.md)，基于嘉庚超算预装的模块进行。此处以DeepMD-kit v2.2.0版本为例。

## 初次安装

1. 创建虚拟环境（此处以`deepmd`为例）

    ```bash
    module load anaconda/2020.3
    conda create -n deepmd python=3.9
    ```

2. （可选）虚拟环境激活/退出的配置，也可将`activate.sh`中代码每次手动设置


    ```bash
    # replace your own username here!
    mkdir -p $CONDA_PREFIX/etc/conda/activate.d
    touch $CONDA_PREFIX/etc/conda/activate.d/activate.sh
    mkdir -p $CONDA_PREFIX/etc/conda/deactivate.d
    touch $CONDA_PREFIX/etc/conda/deactivate.d/deactivate.sh
    conda env config vars set LD_LIBRARY_PATH=$tensorflow_root/lib:$deepmd_root/lib:$CONDA_PREFIX/lib:$LD_LIBRARY_PATH
    ```

    - `$CONDA_PREFIX/etc/conda/activate.d/activate.sh`

    ```bash
    module load intel/2018.3
    module load gcc/9.2
    module load cmake/3.21
    module load cuda/11.3
    module load lammps/2022.6.23

    export CC=`which gcc`
    export CXX=`which g++`
    export FC=`which gfortran`

    # replace CONDA_PREFIX and deepmd_source_dir!!!
    export deepmd_source_dir=/public/home/username/apps/deepmd-2.2.0
    export tensorflow_root=$deepmd_source_dir/_skbuild/tensorflow_root
    export deepmd_root=$deepmd_source_dir/_skbuild/deepmd_root
    export LAMMPS_PLUGIN_PATH=$deepmd_root/lib/deepmd_lmp
    ```

    - `$CONDA_PREFIX/etc/conda/deactivate.d/deactivate.sh`

    ```bash
    module unload intel/2018.3
    module unload gcc/9.2
    module unload cmake/3.21
    module unload cuda/11.3
    module unload lammps/2022.6.23

    unset deepmd_source_dir
    unset tensorflow_root
    unset deepmd_root
    unset LAMMPS_PLUGIN_PATH
    ```

    设置好后，重启虚拟环境。此后每次激活虚拟环境时，会自动加载相应的模块。
3. 训练代码安装

    ```bash
    pip install tensorflow==2.7 --upgrade
    pip install scikit-build ninja
    pip install protobuf==3.20
    cd $deepmd_source_dir
    export DP_VARIANT=cuda
    pip install .
    ```
4. (可选)第三方接口安装

    ```bash
    mkdir -p $tensorflow_root/lib 
    cd $tensorflow_root
    ln -s $CONDA_PREFIX/lib/python3.9/site-packages/tensorflow/include .
    cd lib
    ln -s $CONDA_PREFIX/lib/python3.9/site-packages/tensorflow/python/_pywrap_tensorflow_internal.so libtensorflow_cc.so
    ln -s $CONDA_PREFIX/lib/python3.9/site-packages/tensorflow/libtensorflow_framework.so.2 .
    ln -s libtensorflow_framework.so.2 libtensorflow_framework.so

    mkdir -p $deepmd_source_dir/source/build
    mkdir -p $deepmd_root
    cd $deepmd_source_dir/source/build
    cmake -DLAMMPS_SOURCE_ROOT=/public/software/lammps/lammps-2022.6.23-intel -DUSE_TF_PYTHON_LIBS=TRUE -DUSE_CUDA_TOOLKIT=TRUE -DTENSORFLOW_ROOT=$tensorflow_root -DCMAKE_INSTALL_PREFIX=$deepmd_root ..
    make -j20
    make install
    ```

## 代码更新

1. Python代码

    ```bash
    cd $deepmd_source_dir
    export DP_VARIANT=cuda
    pip install .
    ```

2. C++代码

    ```bash
    cd $deepmd_source_dir/source/build
    make -j20
    make install
    ```


