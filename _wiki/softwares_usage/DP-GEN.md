---
title: DP-GEN使用入门
authors: 朱嘉欣
priority: 2.3
---

# DP-GEN使用入门

## 简介

Deep Potential Generator (DP-GEN) 是一个将神经网络势能（machine learning potential）和主动学习（active learing）结合起来的工作流。该包主要由张林峰（普林斯顿大学），王涵（北京应用物理与计算数学研究所）开发。如有问题，可以向他们询问。

以下为参考信息：

- [GitHub](https://github.com/deepmodeling/dpgen)
- 参考文献：[Active learning of uniformly accurate interatomic potentials for materials simulation](https://journals.aps.org/prmaterials/abstract/10.1103/PhysRevMaterials.3.023804)

{% include alert.html type="warning" content="此页面仅限提供贡献者对于该软件的理解，如有任何问题请联系贡献者。建议在阅读此篇前先对DeePMD-kit有一定了解。" %}
指路：[DeePMD-kit]({{ site.baseurl }}/wiki/softwares_usage/DeePMD-kit)

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

{% include alert.html type="warning" content="machine.json只指定计算执行的地址，计算生成的数据存储在param.json和machine.json所在文件夹下,计算所需的训练集和结构文件在param.json中指定路径（位于dpgen run命令所在服务服务器上）。205上的计算执行地址建议写在\home文件夹下，但是提交任务建议在205/51/52的\data下。" %}

- 初始训练集数据

  放在提交dpgen所在的服务器上，用于训练势函数，参照[DeePMD-kit]({{ site.baseurl }}/wiki/softwares_usage/DeePMD-kit)中方法生成。

- MD采样的初始结构

  放在提交dpgen所在的服务器上，必须使用vasp5.x的POSCAR，把.xyz文件转化为POSCAR的脚本可见[文末](###script-from-xyz-to-poscar)。

### 输出文件

在提交dpgen的文件夹下会出现以下输出文件，用于指示任务运行的状况：

- `dpgen.log`

  包括了运行轮数，单个任务提交的情况，采样准确度等详细的信息。

- `record.dpgen`

  由多行 `x y` 组成，记录任务进程。其中`x`为运行的轮数（iteration），从0开始；`y`取0-8，其中0-2指代训练，3-5指代采样和筛选，6-8指代标记。

  dpgen通过读取这个文件来决定从哪里重启计算，所以我们可以通过手动修改这个文件来决定重启的点。例如，在第`x`轮中我们发现采样的准确度过低，需要增加初始结构的数量重新跑MD，我们就可以把`record.dpgen`文件在`x 2`之后的内容删除，重新提交dpgen任务。

- `nohup.out` 

  这个并不是必要输出，但是建议使用[nohup命令]({{ site.baseurl }}/wiki/miscellaneous)把dpgen挂在后台运行。这个文件中输出的信息和`dpgen.log`的基本一致。

## 例子

接下来，把铂水界面势函数训练所用的`param.json`分解成几个部分进行解释，在实际使用中需要把几段放在一起。

{% include alert.html type="info" title="comment" content="文件中的注释用_comment标注。" %}

- 基本参数设置

```python
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
    "init_data_prefix": "/data/jxzhu/edl/pzc/hydroxide/ml_potential/pt-oh", 
    "init_data_sys": [
        "init/system-000","init/system-001"
    ], 
    "_comment": " path of training set ",
    "init_batch_size": [
        1,1
    ], 
    "sys_configs": [
        ["/data/jxzhu/edl/pzc/hydroxide/ml_potential/pt-oh/init/configs/POSCAR_0[0-9]"],
        ["/data/jxzhu/edl/pzc/hydroxide/ml_potential/pt-oh/init/configs/POSCAR_1[0-9]"]
    ], 
    "_comment": " path of initial structure for sampling ",
    "sys_batch_size": [
        1,1
    ], 
     
    ......
}



```

- 势函数训练（DPMD）

  ```python
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

  ```python
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

 - 标记（计算单点能，此处以CP2K为例，VASP的设置可在官方GitHub中查看）

```python
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
                "BASIS_SET_FILE_NAME": "/data/jxzhu/BASIC_SET/BASIS_MOLOPT",
                "POTENTIAL_FILE_NAME": "/data/jxzhu/BASIC_SET/GTH_POTENTIALS",
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
                                        "PARAMETER_FILE_NAME": "/data/jxzhu/BASIC_SET/dftd3.dat",
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

{% include alert.html type="tip" title="计算设置" content="CP2K的input中部分参数有默认设置写入，具体可参照cp2k.py。" %}

指路：[cp2k.py](https://github.com/deepmodeling/dpgen/blob/master/dpgen/generator/lib/cp2k.py)

{% include alert.html type="warning" title="计算设置" content="金属体系OT section需要手动关闭，具体见上方的设置。" %}



`machine.json`示例

```python
{
  "train": [
    {
      "machine": {
        "machine_type": "lsf",
        "hostname": "210.34.15.205",
        "port": 22,
        "username": "jxzhu",
        "work_path": "/home/jxzhu/pt-oh/train"
      },
      "resources": {
        "node_cpu": 4,
        "numb_node": 1,
        "task_per_node": 4,
        "partition": "large",
        "exclude_list": [],
        "source_list": [
          "/share/base/scripts/export_visible_devices"
        ],
        "module_list": [
            "cuda/9.2",
            "deepmd/1.0"
		],
        "time_limit": "23:0:0"
      },
      "python_path": "/share/deepmd-1.0/bin/python3.6"
    }
  ],
  "model_devi": [
    {
      "machine": {
        "machine_type": "lsf",
        "hostname": "210.34.15.205",
        "port": 22,
        "username": "jxzhu",
        "work_path": "/home/jxzhu/pt-oh/dpmd"
      },
      "resources": {
        "node_cpu": 2,
        "numb_node": 1,
        "task_per_node": 2,
        "partition": "large",
        "exclude_list": [],
        "source_list": [
          "/share/base/scripts/export_visible_devices"
        ],
        "module_list": [
            "cuda/9.2",
            "deepmd/1.0",
            "gcc/4.9.4"
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
        "machine_type": "lsf",
        "hostname": "121.192.191.52",
        "port": 6666,
        "username": "jxzhu",
        "work_path": "/data/jxzhu/edl/pzc/hydroxide/ml_potential/pt-oh/labelling"
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
{% include alert.html type="info" title="登录设置" content="如果服务器是密码登录，在username之后加上关键词password并写上密码。输入的内容要用引号括起！" %}

{% include alert.html type="info" title="GPU调用设置" content="根据上述规则，在训练时通常使用4个CPU核作为标记，而采样（MD）时采用2个。在训练和采样中我们调用source_list关键词下的脚本自动检索占用显存少于特定值的GPU进行提交。对于训练任务，建议独占一张GPU，故可不设置<code>-t xxx</code> （默认为100）。对于采样步骤，可以采用上文中的设置，也可以调用同一目录下的avail_gpu.sh并设置<code>-t 50</code>（或一个更小的值），防止多任务挤兑。" %}

准备好所有的输入文件后，就可以用以下指令提交dpgen任务啦！

`dpgen run param.json machine.json`

{% include alert.html type="info" title="提交任务" content="如果在51/52提交，需要在服务器上自行安装dpgen。具体做法见[官方GitHub](http
s://github.com/deepmodeling/dpgen)。" %}

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
