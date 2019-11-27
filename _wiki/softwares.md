---
title: Guidances for installation of codes
authors: Yongbin Zhuang
---



[toc]



# GSL Library installation Guide

## Short Introduction

The GNU Scientific Library (GSL) is a numerical library for C and C++ programmers. It is a free open source library under the GNU General Public License. 

This guide is from: https://coral.ise.lehigh.edu/jild13/2016/07/11/hello/

## Install Guide

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

# CP2K installation Guide

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

  
