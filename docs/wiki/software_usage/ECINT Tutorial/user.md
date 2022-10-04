---
title: ECINT 的使用
todo: update pbc section
author: 熊景放
comments: true
---

# ECINT 的使用

## 安装与配置

在使用 ECINT 前，需安装并配置好 aiida-core 与 aiida 插件，不过也可以在 hydrogen 上体验已配置好的环境

## 如何进入 hydrogen

1. 联系集群管理员，将你的公钥放到 hydrogen 上

2. 在海洋楼网络环境下，通过以下命令可进入 hydrogen

```bash
ssh -p 8099 chenglab@10.24.3.144
```

> 建议在用工作流时，先在 `~/users` 下建立一个以自己名字命名的工作目录，`users/public.data` 为 51/52 的 `/public.data`

## 输入文件

在想要运行工作流的工作路径下准备一个 `.json` 输入文件，示例如下 (要用 `"`，而不是 `'`): 

```yaml
{
  "workflow": "NebWorkChain",
  "webhook": "https://oapi.dingtalk.com/robot/send?access_token=xxxxxx",
  "resdir": "results",
  "structure": ["ethane_1_opt.xyz", "ethane_s1.xyz", "ethane_ts.xyz", "ethane_s2.xyz"],
  "cell": [12, 12, 12],
  "metadata": {
    "kind_section": {
      "BASIS_SET": "TZV2P-GTH",
      "POTENTIAL": "GTH-PBE"
    }
  }
}
```

或者也可以用 `.yaml` 输入文件，示例如下 (`-` 和 `ethane_1_opt.xyz` 之间不要漏了空格):

```yaml
workflow: NebWorkChain
webhook: https://oapi.dingtalk.com/robot/send?access_token=xxxxxx
resdir: results
structure:
  - ethane_1_opt.xyz
  - ethane_s1.xyz
  - ethane_ts.xyz
  - ethane_s2.xyz
cell: [12, 12, 12]
metadata:
  kind_section:
    BASIS_SET: TZV2P-GTH
    POTENTIAL: GTH-PBE
```

> 更多输入的例子在 <https://github.com/chenggroup/ecint/tree/develop/example>

### 各关键词解释

- **workflow** (必填): workflow 的名字，具体可选的请见[可选用的 workflow](#可选用的-workflow) 部分

- **webhook** (选填): 钉钉机器人 [webhook](https://chenggroup.github.io/wiki/notification_for_hpc#申请钉钉机器人)，当工作流完成时想要即时收到钉钉提醒时可设置，否则可不用

- **resdir** (选填, default: 当前所在路径): 结果文件的储存路径

- **structure/structures_folder** (必填其中之一): 仅输入一个结构时，structure 为结构文件的路径 (非列表)，对于 neb 这种需要多个输入结构的，structure 为结构文件路径的列表。如果批量进行计算，则把批量的结构所在文件夹加入 structures_folder (暂不支持 neb)

- **cell** (选填): 设置了 cell 后会改变那些结构中不包含 cell 信息的 cell。如果用的是 .xyz 格式，一般需要设置 cell (因为 .xyz 一般不包含 cell 的信息)，.cif or POSCAR(.vasp) 则不需要设置。cell 的格式与 ase 中的 cell 格式保持一致，如 [12, 12, 12] 或 [[12, 0, 0], [0, 12, 0], [0, 0, 12]] 或 [12, 12, 12, 90, 90, 90]

- **metadata** (选填): 

  > 以下参数可不填，对于不同的 workflow 均有不同的[默认值](#可选用的-workflow)

  - config: 可以为 dict, .json, .yaml，表示 cp2k 输入参数的基本设置，以 dict 的形式来表示 cp2k 输入，一些细致的设置，如计算精度，可在此处修改，也可[通过 cp2k 输入文件进行转化](#CP2K-input-转-config)。无特殊需求可不更改。config 的示例如下: 

  - kind_section: 配置 BASIS_SET 和 POTENTIAL 的基本信息，可以有四种输入形式
  
    > 若设置了 kind_section 的话，需同时设置 `BASIS_SET` 与 `POTENTIAL`。如果按元素来指定了 `BASIS_SET` 或 `POTENTIAL` 的话，需要指定所有元素的设置。设置比较复杂的话推荐以文件的方式 (下面的第四种方法) 来引用 `kind_section`

    - ```python
      # .json
      "kind_section": {"BASIS_SET": "TZV2P-GTH", "POTENTIAL": "GTH-PBE"}
  
      # or .yaml
      kind_section:
        BASIS_SET: TZV2P-GTH
        POTENTIAL: GTH-PBE
      ```
      
    - ```python
      # .json
      "kind_section": {"H": {"BASIS_SET": "TZV2P-GTH", "POTENTIAL": "GTH-PBE"}, "O": {"BASIS_SET": "TZV2P-GTH", "POTENTIAL": "GTH-PBE"}, ...}
  
      # or .yaml
      kind_section:
        H:
          BASIS_SET: TZV2P-GTH
          POTENTIAL: GTH-PBE
        O:
          BASIS_SET: TZV2P-GTH
          POTENTIAL: GTH-PBE
        ...
      ```
      
    - ```python
      # .json
      "kind_section": [{"_": "H", "BASIS_SET": "TZV2P-GTH", "POTENTIAL": "GTH-PBE"}, {"_": "O", "BASIS_SET": "TZV2P-GTH", "POTENTIAL": "GTH-PBE"}, ...]
      
      # or .yaml
      kind_section:
        - _: H
          BASIS_SET: TZV2P-GTH
          POTENTIAL: GTH-PBE
        - _: O
          BASIS_SET: TZV2P-GTH
          POTENTIAL: GTH-PBE
        ...
      ```
  
    - ```python
      # <<YOUR_KIND_SECTION_FILE>> example
      kind_section:
        H:
          BASIS_SET: TZV2P-GTH
          POTENTIAL: GTH-PBE
        O:
          BASIS_SET: TZV2P-GTH
          POTENTIAL: GTH-PBE
        ...
      
      # .json
      "kind_section": "<<YOUR_KIND_SECTION_FILE>>"  # YOUR_KIND_SECTION_FILE can be .json or .yaml
      
      # or .yaml
      kind_section: <<YOUR_KIND_SECTION_FILE>>  # .json or .yaml
      ```
  
  - **machine**: 选择配置好的服务器 (目前仅支持 `cp2k@aiida_test`) 以及配置资源的使用情况
  
    ```json
    // example
    {
        "code@computer": "cp2k@aiida_test",
        "nnode": 2,
        "queue": "medium"
    }
    ```
  
    - code@computer: 配置好的 aiida 服务器 (目前仅支持 `cp2k@aiida_test`)
    - nnode/nprocs/n (选填其中之一): 使用服务器节点数/使用服务器核数/使用服务器核数
    - walltime/max_wallclock_seconds/w (选填其中之一): 强制终止计算时间，单位 s
    - queue/queue_name/q (选填其中之一): 服务器队列名
    - ptile: 每节点至少需使用的核数，默认值为每节点的核数
  
  - ...: some parameters for special workflow
  
- **subdata** (选填): 

  > 用于修改多步工作流中，每步工作流的 `config`, `kind_section`, `machine`, 其设置会覆盖掉 `metada` 中的相关设置。
  >
  > e.g. `NebWorkChain` 由三部分组成: `geoopt`, `neb`, `frequency`. 若输入如下: 
  >
  > ```yaml
  > workflow: NebWorkChain
  > webhook: https://oapi.dingtalk.com/robot/send?access_token=xxx  # your own webhook
  > resdir: results_yaml
  > structure:
  >   - ethane_1_opt.xyz
  >   - ethane_s1.xyz
  >   - ethane_ts.xyz
  >   - ethane_s2.xyz
  > cell:
  >   - [12, 0, 0]
  >   - [0, 12, 0]
  >   - [0, 0, 12]
  > metadata:
  >   kind_section:
  >     BASIS_SET: DZVP-MOLOPT-SR-GTH
  >     POTENTIAL: GTH-PBE
  > subdata:
  >   geoopt:
  >     kind_section:
  >       BASIS_SET: TZV2P-MOLOPT-GTH
  >       POTENTIAL: GTH-PBE
  > ```
  >
  > 则 `geoopt` 部分的 `kind_section` 会被更新为 `{"BASIS_SET": "TZV2P-MOLOPT-GTH", "POTENTIAL": "GTH-PBE"}` ，而 `neb` 与 `frequency` 部分的 `kind_section` 则与 `metadata` 中的保持一致。

  - <<sub_workflow_1>>: 
    - config: 见 `metadata`
    - kind_section: 见 `metadata`
    - machine: 见 `metadata`
  - <<sub_workflow_2>>: 
    - config
    - kind_section
    - machine
  - ...

## 可选用的 workflow

输出的基本信息在 `results.dat` 中，以下 workflow 中仅说明除了 `results.dat` 外的输出文件

### EnergySingleWorkChain

> Just single point energy

- 输入默认值:
  - config: [energy.json](https://github.com/chenggroup/ecint/blob/develop/ecint/workflow/units/energy.json)
  - kind_section: `{"BASIS_SET": "DZVP-MOLOPT-SR-GTH", "POTENTIAL": "GTH-PBE"}`
  - machine: `{"code@computer": "cp2k@aiida_test", "nnode": 1, "walltime": 12 * 60 * 60, "queue": "medium"}`
- 其他输出: 
  - 包含能量信息的结构: `coords.xyz`

### GeooptSingleWorkChain

> Just geomertry optimization

- 输入默认值:
  - config: [geoopt.json](https://github.com/chenggroup/ecint/blob/develop/ecint/workflow/units/geoopt.json)
  - kind_section: `{"BASIS_SET": "DZVP-MOLOPT-SR-GTH", "POTENTIAL": "GTH-PBE"}`
  - machine: `{"code@computer": "cp2k@aiida_test", "nnode": 1, "walltime": 12 * 60 * 60, "queue": "medium"}`
- 其他输出: 
  - 结构优化完后的结构: `structure_geoopt.xyz`

### NebSingleWorkChain

> Just CI-NEB

- 输入默认值:
  - config: [neb.json](https://github.com/chenggroup/ecint/blob/develop/ecint/workflow/units/neb.json)
  - kind_section: `{"BASIS_SET": "DZVP-MOLOPT-SR-GTH", "POTENTIAL": "GTH-PBE"}`
  - machine: `{"code@computer": "cp2k@aiida_test", "nnode": number_of_replica, "queue": "large"}`
- 其他输出:
  - 包含始终态及中间态的 trajectory: `images_traj.xyz`
  - 势能曲线: `potential_energy_curve.png`
  - 过渡态结构: `transition_state.xyz`

### FrequencySingleWorkChain

> Just vabrational analysis

- 输入默认值:
  - config: [frequency.json](https://github.com/chenggroup/ecint/blob/develop/ecint/workflow/units/frequency.json)
  - kind_section: `{"BASIS_SET": "DZVP-MOLOPT-SR-GTH", "POTENTIAL": "GTH-PBE"}`
  - machine: `{"code@computer": "cp2k@aiida_test", "nnode": 4, "queue": "large"}`
- 其他输出:
  - 振动频率的值: `frequency.txt`

### NebWorkChain

> Goopt for initial and final state --> NEB --> Vabrational analysis

- 输入默认值:
  - geoopt: {default value in GeooptSingleWorkChain}
  - neb: {default value in NebSingleWorkChain}
  - frequency: {default value in FrequencySingleWorkChain}
- 其他输出:
  - all outputs of GeooptSingleWorkChain, NebSingleWorkChain and FrequencySingleWorkChain

## CP2K input 转 config

使用工具 `inp2config` 可将 cp2k 输入文件转成 `config` 所需的形式, `<<CP2K_INP>>` 为 cp2k 输入文件路径 `<<CONFIG>>` 为输出的 `config` 文件路径，后缀为 `.json`/`.yaml`:

```bash
inp2config <<CP2K_INP>> <<CONFIG>>
# e.g.
inp2config input.inp config.yaml
```

要根据 cp2k 输入文件一并生成 `kind_section` 的输入设置, `<<KIND_SECTION>>` 为输出的 `kind_section` 路径，后缀为 `.json/.yaml`:

```bash
inp2config <<CP2K_INP>> <<CONFIG>> -k <<KIND_SECTIOn>>
# e.g.
inp2config input.inp config.yaml -k kind_section.yaml
```

## 提交任务

运行以下命令即可提交工作流，`<<YOUR_INPUT_FILE>>` 为 `.json` 或 `.yaml` 输入文件的路径，缺省值为当前路径下的 `ecint.json`

```bash
ecrun <<YOUR_INPUT_FILE>>
```

## 推送

计算完成的截图如下: 

<img src="https://i.loli.net/2020/08/04/9WA7ebPaCGoSy62.png" alt="image-20200804224518088"  />

计算出错的截图如下:

<img src="https://i.loli.net/2020/08/05/bd1FeLXTjq6vMhx.png" alt="image-20200805150759298" style="zoom: 64%;" />

## 常见错误

### 读取结构文件错误

```bash
  File "xxx/lib/python3.7/site-packages/ase/io/formats.py", line 599, in read
    io = ioformats[format]
KeyError: 'coord'
```

错误原因: 无法识别扩展名

解决方案: 注意扩展名，使用正确的扩展名，如 `.xyz`, `.cif`, POSCAR 可用 `POSCAR` 与 `.vasp`

### 读取 xyz 错误

```bash
ase.io.extxyz.XYZError: ase.io.extxyz: Expected xyz header but got: invalid literal for int() with base 10: ...
```

错误原因: xyz 文件格式错误，xyz 文件第一行是所有原子个数，第二行是注释行(可空着)，第三行开始才是坐标

解决方案: 如果第一行开始就是坐标的话，需要在前面加上原子个数 (如 180) 的行以及一个空行

