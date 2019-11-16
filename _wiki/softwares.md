---
title: Guidances for installation of codes
---


# CP2K installation Guide

## Author: Yong-Bin Zhuang

- Download the release version from official website using wget like

```bash
wget https://github.com/cp2k/cp2k/releases/download/v6.1.0/cp2k-6.1.tar.bz2
```

- Unzip the cp2k package

``` bash
tar -xvf cp2k-6.1.tar.bz2
```

- Go into directory cp2k-6.1/tools/toolchains/
- Stop here! you should check you compiler version, if you are in the High Performance Cluster, Please load the module for compiler and MPI/Open MPI
- Note: for gcc version, gcc <= 7.4.0
- Execute the following script to see the help message

```
./install_cp2k_toolchain.sh -h
```

- Choose which package you want to install before cp2k.

  **Some packages are essential for cp2k, please check this in the official web site**

- the minimum required is `with-openblas=install`, if you want to compile successfully.

  
