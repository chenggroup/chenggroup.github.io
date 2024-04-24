---
title: 基于插件模式开发LAMMPS
authors: 
  - 朱嘉欣
comments: true
---

# 基于插件模式开发LAMMPS

- 插件功能介绍：[LAMMPS Plugin](https://docs.lammps.org/plugin.html)
- 插件开发指南：[LAMMPS Plugin Developer Guide](https://docs.lammps.org/Developer_plugins.html)


一般来说，对代码进行功能添加/修改需要直接在源代码中进行，这样可能对原有代码产生影响。为了解决这个问题，LAMMPS引入了插件模式，使得用户可以在不改动源代码的情况下对LAMMPS进行功能扩展。接下来，我们通过官方的例子对插件的运行方式进行大致的了解：

    ```bash
    cd lammps-23Jun2022/examples/plugins
    ```
`make`编译：

    ```bash
    make 
    ```
或者`cmake`：

    ```bash
    mkdir -p build
    cd build
    cmake ../
    make
    ```

编译后可以得到多个动态库文件`.so`。可以通过两种方式调用插件：

1. 在lammps的input中，通过`plugin load`命令加载插件，即可使用插件中的功能。  
    ```bash
    plugin load morse2plugin.so
    ```
2. 将动态库所在路径加入`LAMMPS_PLUGIN_PATH`，程序会自动加载搜索到的所有插件。

注意：如果移动`examples/plugins`中例子所在路径，需要修改编译设置。如果采用`make`编译，需要修改`Makefile`中的`CXXFLAGS`

    ```bash
    CXXFLAGS=-I$(LAMMPS_SOURCE_DIR) -Wall -Wextra -O3 -fPIC -I$(LAMMPS_SOURCE_DIR)/OPENMP -fopenmp
    ```
并设置`LAMMPS_SOURCE_DIR`为lammps源代码所在路径。

    ```bash
    export LAMMPS_SOURCE_DIR=/data/jxzhu/software/lammps/lammps-23Jun2022/src
    make
    ```

如果采用cmake编译，需要将`plugins/CMakeLists.txt`中22行注释掉（`get_filename_component(LAMMPS_SOURCE_DIR ${PROJECT_SOURCE_DIR}/../../src ABSOLUTE)`），并在执行`cmake`时指定lammps源代码所在目录

    ```bash
    mkdir -p build
    cd build
    rm *
    cmake -DLAMMPS_SOURCE_DIR=/data/jxzhu/apps/lammps/lammps-23Jun2022/src ..
    make
    ```
