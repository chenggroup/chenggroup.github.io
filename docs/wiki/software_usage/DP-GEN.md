---
title: DP-GEN使用入门
authors: 朱嘉欣，庄永斌
comments: true
---

# DP-GEN使用入门

## 简介

Deep Potential Generator (DP-GEN) 是一个将神经网络势能（machine learning potential）和主动学习（active learing）结合起来的工作流。该包主要由张林峰（普林斯顿大学），王涵（北京应用物理与计算数学研究所）开发。如有问题，可以向他们询问。

以下为参考信息：

- [GitHub](https://github.com/deepmodeling/dpgen)
- 参考文献：[Active learning of uniformly accurate interatomic potentials for materials simulation](https://journals.aps.org/prmaterials/abstract/10.1103/PhysRevMaterials.3.023804)

!!! warning None
    此页面仅限提供贡献者对于该软件的理解，如有任何问题请联系贡献者。建议在阅读此篇前先对DeePMD-kit有一定了解。
指路：[DeePMD-kit](./DP-GEN.md)

DP-GEN的工作流是由以下三步组成的循环：

- 训练：DeePMD-kit同时训练**多条**（一般是4条）参数初始化不同的势函数（GPU）。
- 采样和筛选：基于训练得到的势函数和指定的初始结构利用LAMMPS进行classical MD，扩展构型空间。然后对MD中得到的构型依照特定指标（对某个构型用不同的势函数预测所得的原子力的标准差）进行筛选（GPU）。
- 标记：将筛选所得的构型进行DFTMD单点能计算，得到力和能量，加入训练集进行新一轮的训练（51或52）。

### 输入文件 

为了使dpgen运行起来，我们需要准备如下的文件：

- `param.json` 

  三步计算中所用的参数，具体指神经网络训练的参数，lammps中MD的参数和DFTMD计算单点能的参数。

- `machine.json` 

  制定上述三个步骤分别在哪个服务器计算。

!!! tip
    在 Zeus 集群上配置 `machine.json`</code>`，请参阅[GPU使用说明](../cluster_usage/gpu_usage.md)</a>

- 初始训练集数据

  放在提交dpgen所在的服务器上，用于训练势函数，参照[DeePMD-kit](./DeePMD-kit.md)中方法生成。

- MD采样的初始结构

  放在提交dpgen所在的服务器上，必须使用vasp5.x的POSCAR，把.xyz文件转化为POSCAR的脚本可见[文末](#script-from-xyz-to-poscar)。

### 输出文件

在提交dpgen的文件夹下会出现以下输出文件，用于指示任务运行的状况：

- `dpgen.log`

  包括了运行轮数，单个任务提交的情况，采样准确度等详细的信息。

- `record.dpgen`

  由多行 `x y` 组成，记录任务进程。其中`x`为运行的轮数（iteration），从0开始；`y`取0-8，其中0-2指代训练，3-5指代采样和筛选，6-8指代标记。

  dpgen通过读取这个文件来决定从哪里重启计算，所以我们可以通过手动修改这个文件来决定重启的点。例如，在第`x`轮中我们发现采样的准确度过低，需要增加初始结构的数量重新跑MD，我们就可以把`record.dpgen`文件在`x 2`之后的内容删除，重新提交dpgen任务。

- `nohup.out` 

  这个并不是必要输出，但是建议使用[nohup命令](../miscellaneous.md#run-process-when-you-logout-shell)把dpgen挂在后台运行。这个文件中输出的信息和`dpgen.log`的基本一致。

## 例子

接下来，把铂水界面势函数训练所用的`param.json`分解成几个部分进行解释，在实际使用中需要把几段放在一起。

!!! info "comment"
    文件中的注释用_comment标注。

### 基本参数设置: `params.json`

```json title="param.json"
{ 
    "type_map": [        
        "O", 
        "H",
        "Pt"
    ], 
    "mass_map": [ 
        15.999,
        1.0079,
        195.08
    ], 
    "_comment": " atoms in your systems ",
    "init_data_prefix": "/data/kmr/edl/pzc/hydroxide/ml_potential/pt-oh", 
    "init_data_sys": [
        "init/system-000","init/system-001"
    ], 
    "_comment": " path of training set ",
    "init_batch_size": [
        1,1
    ], 
    "sys_configs": [
        ["/data/kmr/edl/pzc/hydroxide/ml_potential/pt-oh/init/configs/POSCAR_0[0-9]"],
        ["/data/kmr/edl/pzc/hydroxide/ml_potential/pt-oh/init/configs/POSCAR_1[0-9]"]
    ], 
    "_comment": " path of initial structure for sampling ",
    "sys_batch_size": [
        1,1
    ], 
     
    ......
}
```

- 势函数训练（DPMD）

```json title="param.json"
  {
      ......
      "numb_models": 4, 
      "_comment": " number of NNP for model deviation ",
      "train_param": "input.json", 
      "_comment": " name of automatically generated input file for DPMD ",
      "default_training_param": {
          "model": {
          "descriptor": {
          "type": "se_a",
  	"_comment": "could be bigger than the number of atoms of the very element",
          "sel": [68, 136, 64], 
          "rcut_smth": 0.50, 
          "rcut": 5.00, 
          "neuron": [25, 50, 100], 
          "resnet_dt": false, 
          "axis_neuron": 16,
          "seed": 1
          },
          "fitting_net": {
          "n_neuron": [240, 240, 240], 
          "resnet_dt": true, 
          "seed": 1
          }},
          "learning_rate": {
          "type": "exp",
          "start_lr": 0.005, 
          "decay_steps": 2000,
          "_comment": "last 20000 or 400000", 
          "decay_rate": 0.95
          },
          "loss": {
          "start_pref_e": 0.02, 
          "limit_pref_e": 1, 
          "start_pref_f": 1000, 
          "limit_pref_f": 1, 
          "start_pref_v": 0, 
          "limit_pref_v": 0
          },
          "training": {
          "systems": [ ], 
          "set_prefix": "set", 
          "stop_batch": 400000, 
          "batch_size": 1, 
          "seed": 1,
          "disp_file": "lcurve.out", 
          "disp_freq": 100, 
          "numb_test": 4, 
          "save_freq": 1000, 
          "save_ckpt": "model.ckpt", 
          "load_ckpt": "model.ckpt", 
          "disp_training": true, 
          "time_training": true, 
          "profiling": false, 
          "profiling_file": "timeline.json"
          }},
      "_comment": "modify according your systems!", 
      ......
  }
```

- 采样和筛选（Lammps）

```json title="param.json"
{  
    "model_devi_dt":            0.0005,
    "_comment": "model_devi_dt: Timesteps for MD. Consistent with DFTMD!",
    "model_devi_skip":          0,
    "_comment": "model_devi_skip: the first x frames of the recorded frames",
    "model_devi_f_trust_lo":    0.075,
    "model_devi_f_trust_hi":    0.10,
    "_comment": "modify according to the error distribution of system",
    "model_devi_e_trust_lo":    1e10,
    "model_devi_e_trust_hi":    1e10,
    "model_devi_clean_traj":    false,
    "model_devi_jobs": [
    {"temps": [300,400],"sys_idx": [0,1],"trj_freq": 10,"nsteps":  2000,"ensemble": "nvt","_idx": 0},
    {"temps": [300,400],"sys_idx": [0,1],"trj_freq": 10,"nsteps":  2000,"ensemble": "nvt","_idx": 1}
    ],
    "_comment": "sys_idx should correspond to sys_configs in the beginning",
    "_comment": "add the _idx step by step",
    "_comment": "modify nsteps and sys_idx based on model deviation accuracy",
    ......
}
```

 - 标记（计算单点能，此处以CP2K为例，VASP的设置可在官方文档中查看）

```json title="param.json"
{
    ......
    "fp_style":		"cp2k",
    "shuffle_poscar":	false,
    "fp_task_max":	200,
    "_comment":         "the maximum number of stcs to calc.",
    "fp_task_min":	5,
    "fp_pp_path":	".",
    "fp_pp_files":	[],
    "_comment":"the maximum number of stcs to calc.",
     "_comment": "fp_params: modify according your systems!",
    "fp_params": {
        "FORCE_EVAL":{
            "DFT":{
                "BASIS_SET_FILE_NAME": "/data/kmr/BASIC_SET/BASIS_MOLOPT",
                "POTENTIAL_FILE_NAME": "/data/kmr/BASIC_SET/GTH_POTENTIALS",
                "MGRID":{
                    "CUTOFF": 400
                },
                "QS":{
                    "EPS_DEFAULT": 1.0E-13
                },
                "SCF":{
                    "SCF_GUESS": "ATOMIC",
                    "EPS_SCF": 1.0E-6,
                    "MAX_SCF": 500,
                    "ADDED_MOS": 500,
                    "CHOLESKY": "INVERSE",
                    "SMEAR":{"ON"
                        "METHOD": "FERMI_DIRAC",
                        "ELECTRONIC_TEMPERATURE": 300
                    },
                    "DIAGONALIZATION":{
                        "ALGORITHM": "STANDARD"
                    },
                    "MIXING":{
                               "METHOD": "BROYDEN_MIXING",
                               "ALPHA":   0.3,
                               "BETA":    1.5,
                               "NBROYDEN":  14
                    }
                },
                "XC":{
                        "XC_FUNCTIONAL":{"_": "PBE"},
                        "XC_GRID":{
                                "XC_SMOOTH_RHO": "NN50",
                                "XC_DERIV": "NN50_SMOOTH"
                        },
                        "vdW_POTENTIAL":{
                                "DISPERSION_FUNCTIONAL": "PAIR_POTENTIAL",
                                "PAIR_POTENTIAL":{
                                        "TYPE": "DFTD3",
                                        "PARAMETER_FILE_NAME": "/data/kmr/BASIC_SET/dftd3.dat",
                                        "REFERENCE_FUNCTIONAL": "PBE"
                                }
                        }
                }
           },
            "SUBSYS":{
                        "KIND":{
                                "_": ["O", "H","Pt"],
                                "POTENTIAL": ["GTH-PBE-q6", "GTH-PBE-q1","GTH-PBE-q10"],
                                "BASIS_SET": ["DZVP-MOLOPT-SR-GTH", "DZVP-MOLOPT-SR-GTH","DZVP-A5-Q10-323-MOL-T1-DERIVED_SET-1"]
                        }
            }
        }
    }
}
```

!!! tip "计算设置"
    CP2K的input中部分参数有默认设置写入，具体可参照cp2k.py。

指路：[cp2k.py](https://github.com/deepmodeling/dpgen/blob/master/dpgen/generator/lib/cp2k.py)

!!! warning "计算设置"
    金属体系OT section需要手动关闭，具体见上方的设置。
### 任务提交设置: `machine.json`

> 从 DP-GEN 0.10.0 版本开始，官方引入了对 DPDispatcher 的支持，并计划将 `machine.json` 迁移到 DPDispatcher 上。
> DPDispatcher 相比原本 DP-GEN 自带的 Dispatcher，在接口和语法上有较大变化，需要额外指定 `api_version` 大于或等于 1.0。

关于 DPDispatcher 项目的说明，请参阅[这里](https://github.com/deepmodeling/dpdispatcher)。

DPDispatcher 相比旧版，基于配置字典而非文件Flag来管理所提交的任务，稳定性更优，且对作业管理系统的支持更加灵活多样，内置接口可支持多任务并行提交。
但新版在操作习惯上有较大改变，需要适应和调整。

以 LSF 为例，对 `machine.json` 的写法举例如下，请留意以下的注意事项。

!!! danger "注意"
    <p><code>train</code> 部分和<code>model_devi</code>部分使用了对新版 LSF 提供支持的写法，即同时指定 <code>gpu_usage</code> 和 <code>gpu_new_syntax</code> 为 <code>True</code>，从而可在提交脚本中使用新版 LSF 的语法。</p><p>`para_deg`表示在同一张卡上同时运行的任务数，通常可不写出，此时默认值为1。这里给出的例子表示在同一张卡上同时运行两个Lammps任务。</p><p><code>fp</code> 部分使用的是针对CPU计算使用的语法。</p>

!!! danger "注意"
    <p>注意在<code>fp</code>部分，<code>mpiexec.hydra</code>需要明确写出以确保任务是并行执行的，可参考以下例子中的写法：<code>mpiexec.hydra -genvall vasp_gam</code>。若你不知道这部分该如何书写，请参考集群上的提交脚本说明(`/data/share/base/scripts`)。</p>

若在191上向191上提交任务，可以考虑使用`LocalContext`，可以减少文件压缩传输的额外IO开销。

```json title="machine.json"
{
  "api_version": "1.0",
  "train": [
    {
      "command": "dp",
      "machine": {
        "batch_type": "Slurm",
        "context_type": "LocalContext",
        "local_root": "./",
        "remote_root": "/data/tom/dprun/train",
      },
      "resources": {
        "number_node": 1,
        "cpu_per_node": 1,
        "gpu_per_node": 1,
        "queue_name": "gpu3",
        "group_size": 1,
        "module_list": [
          "deepmd/2.0"
        ]
      }
    }
  ],
  "model_devi":[
    {
      "command": "lmp_mpi",
      "machine":{
        "batch_type": "Slurm",
        "context_type": "SSHContext",
        "local_root": "./",
        "remote_root": "/data/jerry/dprun/md",
        "remote_profile": {
          "hostname": "198.76.54.32",
          "username": "jerry",
          "port": 6666
        }
      },
      "resources": {
        "number_node": 1,
        "cpu_per_node": 1,
        "gpu_per_node": 1,
        "queue_name": "gpu2",
        "group_size": 5,
        "kwargs": {
          "custom_gpu_line": [
            "#SBATCH --gres=gpu:1g.10gb:1"
          ]
        },
        "strategy": {"if_cuda_multi_devices": false},
        "para_deg": 2,
        "module_list": [
          "deepmd/2.1"
        ],
        "source_list": []
      }
    }
  ],
  "fp":[
    {
      "command": "mpiexec.hydra -genvall cp2k.popt input.inp",
      "machine":{
        "batch_type": "Slurm",
        "context_type": "SSHContext",
        "local_root": "./",
        "remote_root": "/data/jerry/dprun/fp",
        "remote_profile": {
          "hostname": "198.76.54.32",
          "username": "jerry",
          "port": 6666
        }
      },
      "resources": {
        "number_node": 2,
        "cpu_per_node": 32,
        "gpu_per_node": 0,
        "queue_name": "c53-medium",
        "group_size": 10,
        "module_list": [
          "intel/17.5.239",
          "mpi/intel/2017.5.239",
          "gcc/5.5.0"
          "cp2k/7.1"
        ]
      }
    }
  ]
}
```

相关参数含义，详情请参阅官方文档
[machine](https://docs.deepmodeling.org/projects/dpdispatcher/en/latest/machine.html) 和
[resources](https://docs.deepmodeling.org/projects/dpdispatcher/en/latest/resources.html) 部分的说明。

以下是部分参数含义：

| 参数                   | 描述                                         |
| :-------------------- | :------------------------------------------ |
| `machine`             | 指定远程服务器的配置信息。 |
| `batch_type`          | 提交作业系统的类型，可指定 `LSF`, `Slurm`, `Shell` 等。 |
| `context_type`        | 连接到远程服务器的方式，常用可选参数`SSHContext`, `LocalContext`, `LazyLocalContext`等。详见官方文档说明。 |
| `SSHContext`          | 通过SSH连接到远程主机，通常情况下从一个服务器提交到另一个时可使用。 |
| `LocalContext`        | 若需要在当前服务器上提交任务，可选择此选项，则不必通过SSH连接。此时 `remote_profile` 部分可不写。 |
| `remote_root`         | 任务在目标主机上提交的绝对路径。 |
| `remote_profile`      | 远程主机设置，若`context_type`为`LocalContext`, `LazyLocalContext`可不写。 |
| `hostname`            | 远程主机IP。 |
| `username`            | 远程主机用户名。 |
| `password`            | 远程主机密码。若通过密钥登陆可不写。 |
| `port`                | SSH连接的端口，默认为22。
| `key_filename`        | SSH密钥存放的路径。默认放在`~/.ssh`下，此时可不写。 |
| `passphrase`          | 密钥安全口令，通常在创建密钥时设置。若为空可不写。 |
| `resource`            | 作业提交相关配置信息。 |
| `number_node`         | 作业使用的节点数。 |
| `cpu_per_node`        | 每个节点上使用CPU核数。 |
| `gpu_per_node`        | 每个节点上使用GPU卡数。 |
| `kwargs`              | 可选参数，依据各作业系统支持的配置而定。详见官方文档。 |
| `custom_gpu_line`     | 自定义GPU提交命令，可根据语法自定义。根据作业管理系统不同，以 `#BSUB` (LSF) 或 `#SBATCH` (Slurm) 开头。文中的例子即在`gpu2`上使用MIG实例（1g.10gb）。 |
| `custom_flags`        | 其他需要使用的Flag，例如Walltime、作业名等设置。 |
| `queue_name`          | 任务提交的队列名。 |
| `group_size`          | 每个作业绑定的任务个数。 |
| `if_cuda_multi_devices` | 是否允许任务运行在多卡上，默认为 `True`。在Zeus上建议写成 `False`。 |
| `para_deg`            | 同一卡上同时运行的任务数。默认为1。 |
| `module_list`         | 需要load的module。可不写。|
| `module_unload_list`  | 需要unload的module。可不写。|
| `source_list`         | 需要source的脚本路径。可不写。 |
| `envs`                | 需要引入的环境变量。可不写。 |

!!! info "登录设置"
    如果服务器是密码登录，在username之后加上关键词password并写上密码。输入的内容要用引号括起！

准备好所有的输入文件后，就可以用以下指令提交dpgen任务啦！

`dpgen run param.json machine.json`

!!! info "提交任务"
    如果在191提交，需要在服务器上自行安装dpgen。具体做法见[官方GitHub](https://github.com/deepmodeling/dpgen)。
    一般来说运行如下命令即可：

    ```bash
    pip install --user dpgen
    ```

!!! info "Slurm获取状态异常问题的解决"
    若遇到以下报错，很大可能是因为Slurm暂时无法获取任务状态。由于旧版本DPDispatcher对这类波动导致的报错没有充分考虑，会直接退出：

    ```
    RuntimeError: status command squeue fails to execute.job_id:13544 
    error message:squeue: error: Invalid user for SlurmUser slurm, ignored
    squeue: fatal: Unable to process configuration file
    ```

    新版这一部分已经做了调整，但由于之前的版本空文件夹复制过程存在严重bug，请务必保证DPDispatcher版本在0.5.6以上。

    ```bash
    pip install --upgrade --user dpdispatcher
    ```

!!! danger "支持"
    目前DP-GEN 0.11以上版本已经移除了旧版 `dispatcher` 的支持，推荐迁移到 DPDispatcher 上。为防止兼容性问题，这里仍保留了旧版的输入，请注意甄别。

    ```json title="machine_old.json"
    {
      "train": [
        {
          "machine": {
            "machine_type": "slurm",
            "hostname": "123.45.67.89",
            "port": 22,
            "username": "kmr",
            "work_path": "/home/kmr/pt-oh/train"
          },
          "resources": {
            "node_gpu": 1,
            "numb_node": 1,
            "task_per_node": 1,
            "partition": "large",
            "exclude_list": [],
            "source_list": [],
            "module_list": [
                "deepmd/2.1"
    		],
            "time_limit": "23:0:0"
          },
          "python_path": "/share/apps/deepmd/2.1/bin/python"
        }
      ],
      "model_devi": [
        {
          "machine": {
            "machine_type": "slurm",
            "hostname": "123.45.67.89",
            "port": 22,
            "username": "kmr",
            "work_path": "/home/kmr/pt-oh/dpmd"
          },
          "resources": {
            "node_gpu": 1,
            "numb_node": 1,
            "task_per_node": 1,
            "partition": "large",
            "exclude_list": [],
            "source_list": [],
            "module_list": [
                "deepmd/2.1"
    		],
            "time_limit": "23:0:0"
          },
          "command": "lmp_mpi",
          "group_size": 80
        }
      ],
      "fp": [
        {
          "machine": {
            "machine_type": "slurm",
            "hostname": "123.45.67.90",
            "port": 6666,
            "username": "kmr",
            "work_path": "/data/kmr/edl/pzc/hydroxide/ml_potential/pt-oh/labelling"
          },
          "resources": {
            "cvasp": false,
            "task_per_node": 28,
            "numb_node": 1,
            "node_cpu": 28,
            "exclude_list": [],
            "with_mpi": true,
            "source_list": [
            ],
            "module_list": [
                "intel/17.5.239",
                "mpi/intel/17.5.239",
                "cp2k/6.1"
    	    ],
            "time_limit": "12:00:00",
            "partition": "medium",
            "_comment": "that's Bel"
          },
          "command": "cp2k.popt input.inp",
          "group_size": 50 
        }
      ]
    }
    ```

## 训练集收集

DP-GEN代码迭代生成的训练集是分散储存的。可以用DP-GEN自带的collect函数进行数据收集。

首先可以使用`dpgen collect -h` 查看使用说明

常用用法是

```bash
dpgen collect JOB_DIR OUTPUT_DIR -p param.json
```

JOB_DIR就是DP-GEN的输出目录，包含有`iter.0000*`一系列的目录。OUTPUT_DIR就是收集的数据准备放到哪。param.json就是运行DP-GEN跑的param文件。

例如：

```bash
dpgen collect ./ ./collect -p param-ruo2.json
```

以上命令会把当前文件夹的DP-GEN数据收集好放入collect目录里。

```
init.000  init.001  sys.000  sys.001
```

`init.*`是初始训练集，`sys.*`是后来DP-GEN生成的训练集，按照param的sys分类。

## Bonus！

### 常见报错问题（欢迎补充&修正）

- ... expecting value ...

  可能是数组或者字典末尾多写了逗号

- ERROR: lost atoms ...

  可能是Lammps算model_devi的时候因为势函数太差导致有原子重合而报错。可以手动在对应的单条轨迹的input.lammps中加入

```python
  thermo_modify   lost ignore flush yes
```

  然后在上一级文件夹下面手动提交任务

```shell
  bsub<*.sub
```
- AssertionError

  某个单点能计算中断后重新开始，导致cp2k的output中有重叠。可以在02.fp文件夹下用以下脚本进行检查：
```python
import dpdata
import glob
l = glob.glob("task.002*")
l.sort()
stc = dpdata.LabeledSystem(l[0]+'/output',fmt='cp2k/output')
for i in l[1:]:
    print(i)
    stc += dpdata.LabeledSystem(i+'/output',fmt='cp2k/output')
```

  其中`task.002.*`代表遍历002system中的被标记的结构。如果不同系统的原子数相同，也可以直接用`task.00*`一次性检查所有的结构。

- 如果你发现进行 model deviation 从一开始就非常大，并且测试集的结构被打乱，有可能是在 param 文件中设置了`"shuffle_poscar": true`。该选项会随机打乱测试集原始 `POSCAR` 中的行，并用打乱后的结构进行 model deviation 测试。该选项主要用于打乱合金体系的结构，然而对于界面或者共价键连接的体系（如半导体），随机打乱原子的将会使界面结构或者半导体结构变成混乱的一锅粥，没有任何化学含义，因此我们不用进行shuffle（也不可以）。请在 param 文件中设置:
```python
...
"shuffle_poscar": false
...
```

### script from xyz to POSCAR

```python
from ase.io import iread, write
import ase.build

for j in range(2):
    i=0
    for atoms in iread('./traj_'+str(j)+'.xyz', format='xyz'):
        atoms.set_cell([11.246, 11.246, 35.94,90,90,90])
        i=i+1
        if i%20==0:
            atoms=ase.build.sort(atoms)
            ase.io.write('POSCAR_'+str(j)+'_'+str(int(i/20)-1), atoms, format='vasp',vasp5=True)

```
或者调用`ase.io.vasp`里的`write`:

```python
def write_vasp(filename, atoms, label=None, direct=False, sort=None,
symbol_count=None, long_format=True, vasp5=False,
ignore_constraints=False):
```
