---
title: CP2K:REFTRAJ根据已有MD轨迹计算
author: 毕睿豪
comments: true
---

#  根据已有轨迹运行CP2K分子动力学计算

## 学习目标

- CP2K 分子动力学计算的输入文件

- 如何根据已有的CP2K轨迹进行计算

## 学习资料

CP2K官方手册：[Section MD](https://manual.cp2k.org/cp2k-8_2-branch/CP2K_INPUT/MOTION/MD.html) 

CP2K官方练习：[AIMD of bulk liquid water](https://www.cp2k.org/exercises:2016_summer_school:aimd)

## CP2K MD Section 的输入文件

请先了解CP2K的输入文件语法，指路：[CP2K:能量与力的计算](./cp2k-e-f.md)。

CP2K 的输入文件由不同的 *SECTION* 组成，而每个 SECTION 下级有可以包含 *SUBSECTION* 和 *KEYWORDS*，这些不同等级的 SECTION 和 KEYWORD 都是大写英文单词。一份输入文件的语法如下：

```
&SECTION
  &SUSECTION
  ...
  &END SUBSECTION
  KEYWORD1 <value>
  KEYWORD2 <value>
  ...
&END SECTION
```

而如果希望用CP2K进行MD计算，需要根据体系的需要，配置[CP2K:能量与力的计算](./cp2k-e-f.md)中介绍的 `GLOBAL` 和 `FORCE_EVAL` 这两部分，并且将 SECTION `GLOBAL` 下的关键字 `RUN_TYPE` 改为`MD`。

```
&GLOBAL
  ...
  RUN_TYPE MD <---- 运行MD任务请将 RUN_TYPE 改为 MD
&END GLOBAL
```

此外，还需要在配置文件 `input.inp` 中写入 ：

- `MOTION`: 包含如何演变原子核（例如MD），控制输出什么数据

  > SECTION in `input.inp`. This section defines a set of tool connected with the motion of the nuclei. 

- `MD`:  包含了一些分子动力学模拟的基本参数，如选择什么系综（ensemble）、温度、步长和总步数等。
  
  > SUBSECTION in `MOTION`. This section defines the whole set of parameters needed perform an MD run. 

### 一个简单的 MOTION 部分的例子

```
&MOTION 
  &MD
    ENSEMBLE NVE
    STEPS 10
    TIMESTEP 0.5
    TEMPERATURE 300.0
  &END MD
  &PRINT
    &CELL
      &EACH
        MD 1
      &END EACH
    &END CELL
    &FORCES
      &EACH
        MD 1
      &END EACH
    &END FORCES
    &TRAJECTORY
      &EACH
        MD 1
      &END EACH
    &END TRAJECTORY
    &VELOCITIES
      &EACH
        MD 1
      &END EACH
    &END VELOCITIES
  &END PRINT
&END MOTION
```

以上例子非常直接，一行一行读下来字面意思就是MD的参数设置。值得注意的是在 `PRINT` 部分中的 `&EACH MD 1 &END EACH` 控制的是MD打印输出的频率，指的是每一步MD模拟对应一个输出，设置成`3`就是每三步输出一次。`EACH`中MD输出频率缺省值是`1`。

!!! warning None
    为了方便分析，`CELL` 的输出频率应该和 `TRAJECTORY` 的保持一致


## 根据已有轨迹进行MD计算

有的时候，我们需要对已有的一条MD轨迹进行计算：

- 对机器学习势函数生成的MD轨迹进行精确计算

- 更改`FORCE_EVAL` 部分的参数，提升已有轨迹能量和力的计算的精度

- ……

我们可以在CP2K输入文件的 `MD` SECTION 下加入`REFTRAJ` SECTION来实现对已有轨迹的计算。

以TiO2为例子，需要在提交任务的目录下准备：

```shell
tree
.
├── cp2k.lsf					<---- cp2k 任务提交脚本（/data/share/base/scripts/cp2k.lsf） 
├── input.inp  				<---- cp2k 输入文件
├── reftraj.xyz       <---- 已有的轨迹
└── rutile.xyz    		<---- 可以是轨迹中的一帧结构

0 directories, 4 files
```

其中 `rutile.xyz` 对应的是输入文件`input.inp`中 `SUBSYS` 中指定盒子中的原子坐标文件，可以直接选用已有轨迹中的某一帧数据。

针对这一任务，在 `MOTION` 部分写入

```
&MOTION
  &MD
    &REFTRAJ
      TRAJ_FILE_NAME reftraj.xyz
      EVAL_ENERGY_FORCES .TRUE.
      EVAL_FORCES .TRUE.
      FIRST_SNAPSHOT 1
      LAST_SNAPSHOT 50
      STRIDE 1
    &END REFTRAJ
    ...
  &END MD
  &PRINT
    ...
  &END PRINT
```

其中 `TRAJ_FILE_NAME` 关键字指定了当前文件夹下的 `reftraj.xyz` 做为需要计算的轨迹。

值得注意的是，CP2K输入文件中给关键字赋逻辑值时用 `.TRUE.` 或 `.FALSE.`，而 `EVAL_ENERGY_FORCES` 和 `EVAL_FORCES` 的缺省值是 `.FALSE.`，因此如果要计算能量和力必须要明确指定这两个关键字。

`FIRST_SNAPSHOT` , `LAST_SNAPSHOT` 和 `STRIDE`这一组关键词指定了如何对 `reftraj.xyz` 的结构进行计算。指的是从已有轨迹的第 *FIRST_SNAPSHOT* 帧到第 *LAST_SNAPSHOT* 帧结构，每 *STRIDE* 帧结构计算一次。而对于本例子，`reftraj.xyz`中共有50帧结构，因此以上配置文件表明从已有轨迹的第 *1* 帧到第 *50* 帧结构，每 *1* 帧结构计算一次，所以这样设置会计算已有轨迹中的每一个结构的能量和力。



