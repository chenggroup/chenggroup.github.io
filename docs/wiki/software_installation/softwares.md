---
title: Guidances for installation of codes
authors: Yongbin Zhuang
comments: true
---

# Installation Guide for Codes and Libraries

## First of all! Load the environments!

Before you install anything, especially when you need to compile codes, make sure the type of compiler and the version of compiler you have. Usually, in your personal computer, you can use compiler command directly, for instance, `gcc`, `gfortran`, `ifort`,`mpic++`. In remote cluster(High Performance Cluster), the compiler is managed by `module`. You cannnot use it unless you load it in advance. Therefore, make sure which compiler you have in `module`, and use command such as `module load gcc/4.9.4` to load required compilers.

### General Protocal for Installation:

1. Compile the Code
2. Quick test the code at server node
3. Write module files to code (we recommend to manage codes by module)
4. Test the code in the client node
5. write example lsf file in `/share/base/scripts`

### Where to Install?

Install in the `/share/` directory. `/share/` directory is the one synchronized to all the nodes by nfs. 

1. Libraries: `/share/apps/lib/<library name>/<version>`
2. Codes, Pacakges, Softwares: `/share/apps/<packages name>/<version>`

### Standard in Writing Module file

1. module name: `<package name>/<version>`, like `cp2k/6.1`

### Standard in Writing lsf file

1. export necessary environmental variable
2. load prerequisite module

## Anaconda Installation Guide

### Short Introduction

The open-source Anaconda Distribution is the easiest way to perform Python/R data science and machine learning on Linux, Windows, and Mac OS X. Choose the one suitable for you usage. If you'd like to use Anaconda in Cluster, ask cluster administrator if Anaconda have been installed, which avoid storage waste in your cluster's storage.

!!! tip None
    A minimum version of Conda is install in cluster51 by Yunpei Liu. Use it by module command

### Installation Guide

- Go to [this website](https://www.anaconda.com/distribution/), choose the right version for you. Personally, I recommend command line Installer for Linux and Mac OS System, while the Graphical Installer for Windows System
- Follow the instruction in [this page](https://docs.anaconda.com/anaconda/install/)



## QUIP Installation Guide

### Short Introduction

The `QUIP` package is a collection of software tools to carry out molecular dynamics simulations. It implements a variety of interatomic potentials and tight binding quantum mechanics, and is also able to call external packages, and serve as plugins to other software such as [LAMMPS](http://lammps.sandia.gov/), [CP2K](http://www.cp2k.org/) and also the python framework [ASE](https://wiki.fysik.dtu.dk/ase). Various hybrid combinations are also supported in the style of QM/MM, with a particular focus on materials systems such as metals and semiconductors.


!!! tip None
    The tested compiler version: <gcc 6.3.0> and <openmpi 3.0.0> for your information.


### Use QUIP and quippy in cluster 51

 If you need use QUIP/GAP in cluster 51, please used command: 

```
module load gcc/6.3.0 mpi/openmpi/3.0.0
module load QUIP/GAP
```

If you want to use quippy:

```
module load miniconda/3
source activate /share/apps/QUIP/quippy-py3/
```

### Install Guide

- Git clone from repository

```bash
git clone --recursive https://github.com/libAtoms/QUIP.git
```

- Go to the package root and export variable

```bash
export QUIP_ARCH=linux_x86_64_gfortran
```

- Make configuration

```bash
make config
#if everything fine
make
```

### Packages and Extra Interfaces of QUIP

#### Add GAP Packages

- Download GAP file from [here](#http://www.libatoms.org/gap/gap_download.html), then you obtain a tar file named `GAP.tar`, unzip it

```bash
tar -xvf GAP.tar
```

- You will obtain a directory named `GAP/`, copy this directory into QUIP root/src.

```bash
cp -r GAP <QUIP root>/src/
```

- Reconfig your make by choose `install GAP` as `y` 

```bash
#recompile this code again
make
```

#### Build QUIPPY, A QUIP Python Interface

- Export another environmental variable

```bash
#install for your self
export QUIPPY_INSTALL_OPTS=--user
#choose the location for installation of quippy
export QUIPPY_INSTALL_OPTS=--prefix=<directory>
```

- Go to `<QUIP root>/src/f90wrap`, and install f90wrap by:

```bash
pip install .
```

- Back to `<QUIP root>`

```bash
make install-quippy
```

- Test whether installed successfully.

```bash
make test
```

#### Trouble Shooting

##### ImportError: dynamic module does not define module export function

```
Example:
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
  File "/share/apps/QUIP/quippy-py3/lib/python3.8/site-packages/quippy-https_github.com_libAtoms_QUIP.git_ec1ed34_dirty-py3.8-linux-x86_64.egg/quippy/__init__.py", line 2, in <module>
    import _quippy
ImportError: dynamic module does not define module export function (PyInit__quippy)
```

Solution: add <QUIP_root>/build/${QUIP_ARCH} into your Python PATH

## VASP

### Short Introduction
(TODO)

### Install Guide
1. Get the VASP source code and pseudopotentials.

2. Load environment
```bash
module load intel
```
3. Choose `makefile.include` according to the platform and make
```
cd vasp.5.4.4
make std
make gam
```

4. If everything is right, you will find `vasp_std` in `vasp.5.4.4/build/std` and you can run it with `mpirun -np 24 vasp_std`.

### Plugins

#### Wannier90

1. Download Wannier90 from http://www.wannier.org/download/ . *Notice: currently VASP only support Wannier90-1.2*

2. Modify compile file for Wannier90  `make.sys.intel`. Here we use the MKL.
```bash
#LIBDIR = /opt/intel/mkl721/lib/32
#LIBS = -L$(LIBDIR) -lmkl_lapack -lmkl_ia32 -lguide -lpthread
LIBDIR = $(MKLROOT)/lib/intel64
LIBS = -L$(LIBDIR) -mkl -lpthread
```

3. Compile and test
```bash
cp ./config/make.inc.ifort make.inc
make 
make lib # compile to get the libary: libwannier.a 
make tests # test whether the compilation is success
```

4. Copy the `libwannier.a ` libary file to VASP libary path and modify VASP `makefile.include`.

```bash
#Precompiler options
CPP_OPTIONS= -DHOST=\"LinuxIFC\"\
             -DMPI -DMPI_BLOCK=8000 \
             -Duse_collective \
             -DscaLAPACK \
             -DCACHE_SIZE=4000 \
             -Davoidalloc \
             -Duse_bse_te \
             -Dtbdyn \
             -Duse_shmem \
             -DVASP2WANNIER90   ## modify this line for Wannier90
             
LLIBS += ../../libwannier.a  ## change here to the location of libwannier.a
```

### Compilation optimization
If you use `Intel Xeon Silver/Gold/Platium` CPU, using the following compilation parameters will get a 2✖ speedup! (Already test on 205 server)
```shell
OFLAG      = -O3 -xCORE-AVX512
```

### TODO in the future

1. Install vasp_gpu version
2. Benchmark different libary (FFTW/MKL)
3. other plugins: VASP-neb, vasp-beef
4. vasp6


## LAMMPS Installation Guide

### Short Introduction

LAMMPS is a classical molecular dynamics code with a focus on materials modeling. It's an acronym for Large-scale Atomic/Molecular Massively Parallel Simulator.

!!! tip None
    I have installed one in cluster51, in directory /share/apps/lammps-7Aug19/. The compiler version: <gcc 6.3.0> and <openmpi 3.0.0> for your information.

### Install Guide

- Git clone or download package from [website](https://lammps.sandia.gov/download.html)

```bash
# command for git
git clone -b stable https://github.com/lammps/lammps.git mylammps
```

- We assume you the package path is <lammps-root>

```bash
cd <lammps-root>/src
#choose one of the following or both
# build a serial LAMMPS executable
make serial 
# build a parallel LAMMPS executable with MPI
make mpi        
```

- You will see the executable binary in `src/lmp_serial` or `src/lmp_mpi`

### Packages and Extra Interfaces of LAMMPS

!!! tip None
    Contact Cluster Administrator if you need any uninstalled packages

#### General for Installing Package

- To install package of LAMMPS, just type `make yes-<package name>` for example, `make yes-user-intel`

#### Building USER-ATC Package

- Before you install this package by `make yes-user-atc`, you should install `lib-atc` which is a library for atc package
- Go to the directory `<LAMMPS root>/lib/atc`, you can follow the instruction in the `README`. Remember to load module `gcc` and `open mpi`

```bash
cd <LAMMPS root>/lib/atc
```

- `lib-atc` need library `lapack` and `blas` installed. Check whether this library installed or not by command:

```bash 
#check for lapack library
ldconfig -p | grep lapack
#check for blas library
ldconfig -p | grep blas
```

- If `lapack` and `blas` are installed. Change the value of  `EXTRAMAKE` variable to `Makefile.lammps.installed` in the file `Makefile.mpi`.

```bash
EXTRAMAKE= Makefile.lammps.installed
```

- Make library by following command

```bash
make -f Makefile.mpi
```

- Make sure you have `libatc.a` and `Makefile.lammps` in your current directory
- Back to directory `<LAMMPS root>/src/` and type `make mpi` to compile mpi version of LAMMPS

#### Building Inteface with n2p2

- make sure you have shared library `libnnpif-shared` in your `<path to n2p2>/lib/`
- export the following in your environmental variable(optional)

```bash
#export this if you use shared library, skip if you are using static library
export LD_LIBRARY_PATH=<path to n2p2>/lib:${LD_LIBRARY_PATH}
```

- Go to LAMMPS root

```bash
cd <LAMMPS root>/
ln -s <path to n2p2> lib/nnp
cp -r <path to n2p2>/src/interface/LAMMPS/src/USER-NNP <LAMMPS root>/src
cd <LAMMPS root>/src
make yes-user-nnp
make mpi
```

#### Building with Plumed

- Before you install, make sure the Plumed has installed
- To directory `<LAMMPS root>/src/` 

```bash
make lib-plumed args="-p <path to plumed directory>"
make yes-user-plumed
make mpi
```



## DeePMD Installation Guide

### Short Introduction

DeePMD-kit is a package written in Python/C++, designed to minimize the effort required to build deep learning based model of interatomic potential energy and force field and to perform molecular dynamics (MD). This brings new hopes to addressing the accuracy-versus-efficiency dilemma in molecular simulations. Applications of DeePMD-kit span from finite molecules to extended systems and from metallic systems to chemically bonded systems. [Ref. Paper](https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.120.143001)

### Install Guide

- Here, we display the most easiest way to install DeePMD Code.
- Make sure you have `GPU` install in your computer. Usually, you can check with the drive of `GPU`
- Install the `anaconda3` from website. After you installed anaconda3, you can use `conda` command.
- Install DeePMD with cpu or gpu version. Installation by this way will install lammps as well.

```bash
#install of cpu version
conda install deepmd-kit=*=*cpu lammps-dp=*=*cpu -c deepmodeling
#install of gpu version
conda install deepmd-kit=*=*gpu lammps-dp=*=*gpu -c deepmodeling
```

- That's all for installation. Check the install package use command:

```bash
conda list | grep deep
```

- You will find four packages related with DeePMD code. You can now directly use command `dp` , `lmp`.
- To test DeePMD Code. Download DeePMD code from github by:

```bash
git clone https://github.com/deepmodeling/deepmd-kit.git
```

- Go to the directory `examples/water/train/`
- Test training by

```bash
dp train water_se_a.json
```

### Install Guide of DeePMD

[快速安装](./deepmd-kit_installation_191.md)

## n2p2 Installation Guide

### Short Introduction

n2p2 is a machine learning code to training a machine learning potential. It original paper is from [J. Behler and M. Parrinello, Phys. Rev. Lett. 98, 146401 (2007)](https://doi.org/10.1103/PhysRevLett.98.146401)

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
PROJECT_LDFLAGS_BLAS=-lblas -lgslcblas
```

- Save and quit this file, use the following command to compile code:

```bash
#choose one of the following command
make MODE=shared # compile a binary with shared library
make MODE=static # compile a binary with static library, I use this one
```

- After you compiled successfully, you will have all the excutable binary at `n2p2/bin/` directory
- Add `n2p2/bin/` to your `PATH` environmental variable, you can easily use this. The most important binary is `nnp-train`, this is used for training.
- Add n2p2 library to your `LD_LIBRARY_PATH` in `.bashrc`

```bash
export LD_LIBRARY_PATH=<Path to n2p2>/lib/:$LD_LIBRARY_PATH
```

## Plumed Installation Guide

### Short Introduction

PLUMED is an open-source, community-developed library that provides a wide range of different methods, which include:

- enhanced-sampling algorithms
- free-energy methods
- tools to analyze the vast amounts of data produced by molecular dynamics (MD) simulations.

These techniques can be used in combination with a large toolbox of collective variables that describe complex processes in physics, chemistry, material science, and biology.

!!! tip None
    I have installed one in cluster51. Use module load plumed/2.6.0 to use this library. The compiler version: <gcc 6.3.0> <openmpi/3.0.0> for your information

### Install Guide

- Download package from [here.](https://www.plumed.org//download.html)
- Basic Configure

```bash
./configure --prefix=<path you want to install> LDFLAGS=-L'/share/apps/lib/fftw/3.3.8/lib' CPPFLAGS=-I'/share/apps/lib/fftw/3.3.8/lib '
```

- Compile

```bash
make -j 32
make install
```



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

This guide is from: [website tutorial](https://coral.ise.lehigh.edu/jild13/2016/07/11/hello/)

!!! tip None
    I have installed one in cluster51, in directory /share/apps/lib/gsl-2.6. The compiler version: <gcc 6.3.0> for your information

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
- add libray path to LD_LIBRARY_PATH in `.bashrc`

```bash
export LD_LIBRARY_PATH=<path to libgsl>/lib:$LD_LIBRARY_PATH
```

## Libxc Library Installation Guide

- Download the latest stable version of libxc from official website:

```bash
wget http://www.tddft.org/programs/libxc/down.php?file=4.3.4/libxc-4.3.4.tar.gz
```



## FFTW Library Installation Guide

### Short Introduction

FFTW is a C subroutine library for computing the discrete Fourier transform (DFT) in one or more dimensions, of arbitrary input size, and of both real and complex data (as well as of even/odd data, i.e. the discrete cosine/sine transforms or DCT/DST).

!!! tip None
    I have installed one in cluster51, in directory /share/apps/lib/fftw/3.3.8. Use module load fftw/3.3.8 to use this library. The compiler version: <gcc 6.3.0> for your information

### Install Guide

- Download the release version from official website using wget

```bash
wget http://www.fftw.org/fftw-3.3.8.tar.gz
```

- Unzi the package

```bash
tar -xvf fftw-3.3.8.tar.gz
```

- Go to the directory `fftw-3.3.8`

```bash
./configure --prefix=<path to you want to install>    \
            --enable-shared  \
            --enable-threads \
            --enable-sse2    \
            --enable-avx     
```

- If configure is finished

```bash
make
#check if you install finished
make check
#install to the final directory which you have set in --prefix
make install
```





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

  

