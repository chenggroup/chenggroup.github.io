---
title: 在集群安装LAMMPS
authors: 
  - 朱嘉欣
comments: true
---

# 在集群安装LAMMPS

## Zeus 集群

```bash
# Load the necessary modules
module load cmake/3.20
module load intel/17.5.239 mpi/intel/2017.5.239 gcc/7.4.0

# find the ver in https://download.lammps.org/tars/index.html
wget -c https://download.lammps.org/tars/lammps-23Jun2022.tar.gz
tar -zxvf lammps-23Jun2022.tar.gz
cd lammps-23Jun2022
mkdir -p build
cd build
cmake ../cmake -DCMAKE_C_COMPILER=gcc -DCMAKE_CXX_COMPILER=g++ \
-DCMAKE_Fortran_COMPILER=gfortran \
-D BUILD_MPI=yes -D BUILD_OMP=yes -D LAMMPS_MACHINE=mpi \
-D CMAKE_INSTALL_PREFIX=/data/jxzhu/apps/lammps/install/23Jun2022 \
-D CMAKE_INSTALL_LIBDIR=lib \
-D CMAKE_INSTALL_FULL_LIBDIR=/data/jxzhu/apps/lammps/install/23Jun2022/lib \
-C ../cmake/presets/most.cmake -C ../cmake/presets/nolib.cmake \
-D BUILD_SHARED_LIBS=yes
make -j 32
make install
```

检查是否安装完成
  
  ```bash
  ./lmp_mpi -h
  ```

对于个人用户，可以将可执行文件所在路径（如`/data/jxzhu/apps/lammps/lammps-23Jun2022/build`）写入某个虚拟环境的环境变量，以实现版本控制。

## IKKEM 集群

```bash
module load intel/2021.1
module load dev/cmake/3.26.3
module load gcc/9.3

# find the ver in https://download.lammps.org/tars/index.html
# find the ver in https://download.lammps.org/tars/index.html
wget -c https://download.lammps.org/tars/lammps-23Jun2022.tar.gz
tar -zxvf lammps-23Jun2022.tar.gz
cd lammps-23Jun2022
mkdir -p build
cd build
cmake ../cmake -DCMAKE_C_COMPILER=gcc -DCMAKE_CXX_COMPILER=g++ \
      -DCMAKE_Fortran_COMPILER=gfortran \
      -D BUILD_MPI=yes -D BUILD_OMP=yes -D LAMMPS_MACHINE=intel_cpu_intelmpi \
      -D CMAKE_INSTALL_PREFIX=/public/home/jxzhu/apps/lammps/install/lammps-23Jun2022 \
      -D CMAKE_INSTALL_LIBDIR=lib \
      -D CMAKE_INSTALL_FULL_LIBDIR=/public/home/jxzhu/apps/lammps/install/lammps-23Jun2022/lib \
      -C ../cmake/presets/most.cmake -C ../cmake/presets/nolib.cmake \
      -D BUILD_SHARED_LIBS=yes 
make -j 32
make install
```

检查是否安装完成
  
  ```bash
  ./lmp_intel_cpu_intelmpi -h
  ```