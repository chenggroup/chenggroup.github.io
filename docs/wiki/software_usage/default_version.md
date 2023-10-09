---
title: 软件默认版本推荐
authors: Yunpei Liu
comments: true
---

# 软件默认版本推荐

目前集群上很多软件都编译了多个版本，但由于软硬件平台、版本、环境的更新，需要对常用软件的一些版本梳理如下，并给出建议使用版本。

Zeus 集群采用 `module` 对软件环境进行管理，通常使用前需要加载环境，例如 `module load vasp/5.4.4`即可加载 VASP 5.4.4 版本运行所需环境。因此下文对软件推荐版本的说明，将会列出Zeus上使用的`<module name>`，具体使用时请自行补全为`module load <module name>`。

注意如果在 `~/.bashrc` 或 `~/.bash_profile` 中加载了环境，如果与下述版本用到的环境存在冲突，可在提交脚本中加入`module purge`行进行卸载，以免产生冲突。

注意： CentOS 7 默认使用的 GCC 版本为4.9.4，Python 版本为2.7，Python 3 版本为 3.6，故以下涉及到上述环境若未加载，则表示使用默认环境。

| 软件名 | 推荐版本 | 命令 | 需要调用环境 | 备注 |
| :----: | :------: | :---: | :------: | :---: |
| VASP | `vasp/5.4.4` | 常规计算：`vasp_std` <br> Gamma点 ：`vasp_gam` | `intel/17.5.239` <br> `mpi/intel/2017.5.239` | CPU并行计算 |
| CP2K | `cp2k/7.1`| 启用OpenMP：`cp2k_psmp` <br> 未启用：`cp2k_popt` | `gcc/5.5.0` <br> `intel/17.5.239` <br> `mpi/intel/2017.5.239` | CPU并行计算 |
| DeePMD-kit | `deepmd/2.0-cuda11.3` | 训练：`dp` <br> 跑MD：`lmp_mpi` | `cuda/11.3` <br> `gcc/7.4.0` <br> `intel/17.5.239` <br> `mpi/intel/2017.5.239` | GPU加速势函数训练，采用的Lammps版本是20201029 |
