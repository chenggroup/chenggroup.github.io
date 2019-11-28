---
title: Guidances for installation of codes
authors: Yongbin Zhuang
---

# Installation Guide for Codes and Libraries

## First of all!

Before you install anything, especially when you need to compile codes, make sure the type of compiler and the version of compiler you have. Usually, in personal computer, you can use compiler command directly, for instance, `gcc`, `gfortran`, `ifort`,`mpic++`. In remote cluster(High Performance Cluster), the compiler is managed by `module`. You cannnot use it unless you load it in advance. Therefore, make sure which compiler you have in `module`, and use command `module load compiler` to load the compiler you need.

## n2p2 Installationg Guide

### Short Introduction

n2p2 is a machine learning code to training a machine learning potential. It original paper is from 

### Install Guide

- Before Installation, make sure you have installed the [Eigen Library](#Eigen Library Installation Guide) and the [GSL Library](#GSL Library Installation Guide).
- Make sure you have `gcc` compiler (including `gfortran`), I haven't successfully compiled by `intel` compiler. Make sure you have open MPI(i. e. for `mpic++` command).
- Download the n2p2 code from github: https://github.com/CompPhysVienna/n2p2. For example, using the following command.

```bash
git clone https://github.com/CompPhysVienna/n2p2.git
```

- You can see a directory named `n2p2`, now go into that by:

```bash
cd n2p2/src
```

- Modify the configure file `makefile.gnu` 

```makefile
#modify this file, I just pick out the part you need to modify
# Enter here paths to GSL or EIGEN if they are not in your standard include
# path. DO NOT completely remove the entry, leave at least "./".
PROJECT_GSL=<path to gsllib>/gsl/include/ # substitute <path> with real path
PROJECT_EIGEN=<path to eigen>/eigen-eigen-323c052e1731 # substitute <path> with real path

 ###############################################################################
 # COMPILERS AND FLAGS
 ###############################################################################
PROJECT_CFLAGS=-O3 -march=native -std=c++11 -fopenmp -L<pato to gsllib>gsl/lib
```

- Save and quit this file, use the following command to compile code:

```bash
#choose one of the following command
make shared # compile a binary with shared library
make static # compile a binary with static library, I use this one
```

- After you compiled successfully, you will have all the excutable binary at `n2p2/bin/` directory
- Add `n2p2/bin/` to you `PATH` environmental variable, you can easily use this. The most important binary is `nnp-train`, this is used for training.







## Eigen Library Installation Guide

### Short Introduction

Eigen is a C++ template library for linear algebra: matrices, vectors, numerical solvers, and related algorithms.

### Install Guide

- Download the package from wiki:http://eigen.tuxfamily.org/index.php?title=Main_Page#Overview. For me, I choose the Eigen 3.3.7 released version.

```bash
wget http://bitbucket.org/eigen/eigen/get/3.3.7.tar.bz2
```

- Unpack this tar file by 

```bash
tar -zxvf 3.3.7.tar.gz
```

- You will have `eigen-eigen-*` directory in your computer
- These are all steps you need to install `eigen library`





## GSL Library Installation Guide

### Short Introduction

The GNU Scientific Library (GSL) is a numerical library for C and C++ programmers. It is a free open source library under the GNU General Public License. 

This guide is from: https://coral.ise.lehigh.edu/jild13/2016/07/11/hello/

### Install Guide

- Download the latest version of gsl library.
  For reference: [**ftp://ftp.gnu.org/gnu/gsl/**](https://www.gnu.org/software/gsl/)

```bash
wget ftp://ftp.gnu.org/gnu/gsl/gsl-latest.tar.gz
```

- Place the file in whatever directory you want to install and unpack the file with the following command:

```bash
tar -zxvf gsl-latest.tar.gz
```

- This will create a directory called gsl-\*.\* in your home directory. Change to this directory.

```bash
cd gsl-*.*
```

- The next step is to configure the installation and tell the system where to install the files. Create a directory to install your gsl package, say `<Path to libgsl>/gsl` with the following command

```bash
mkdir <Path to libgsl>/gsl
```

- Now configure the installation and tell it to use your new directory. This step may take a few minutes.

```bash
./configure --prefix=<Path to libgsl>/gsl
```

- If there are no errors, compile the library. This step will take several minutes.

```bash
make
```

- Now it is necessary to check and test the library before actually installing it. This step will take some time.

```bash
make check
```

- If there are no errors, go ahead and install the library with:

```bash
make install
```

- Now we can write a test program to see if the library works. Create the following program and name it example.c

```c++
#include <stdio.h>
#include <gsl/gsl_sf_bessel.h>

int
main (void)
{
    double x = 15.0;
    double y = gsl_sf_bessel_J0 (x);
    printf ("J0(%g) = %.18e/n", x, y);
    return 0;
}
```

- Compile and link the program with the following commands (but use the correct path for your username):

```bash
gcc -Wall -I<Path to libgsl>/gsl/include -c example.c
gcc -L<Path to libgsl>/gsl/lib example.o -lgsl -lgslcblas -lm
```

- Now run your program!

```bash
./a.out
```

- If it is succesfully installed, it will print a  number in your screen.

## CP2K Installation Guide

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

  
