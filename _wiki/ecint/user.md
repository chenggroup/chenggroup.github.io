---
title: ECINT 的使用
author: 熊景放
---

# ECINT 的使用

## 安装与配置

在使用 ECINT 前，需安装并配置好 aiida-core 与 aiida 插件，不过也可以在 hydrogen 上体验已配置好的环境

## 如何进入 hydrogen

1. 联系 {{ page.author }} ，将你的公钥放到 hydrogen 上

2. 在海洋楼网络环境下，通过以下命令可进入 hydrogen

```bash
ssh -p 8099 chenglab@10.24.3.144
```

## 运行

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
      "BASIS_SET": "DZVP-MOLOPT-SR-GTH",
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
    BASIS_SET: DZVP-MOLOPT-SR-GTH
    POTENTIAL: GTH-PBE
```

### 各关键词解释

- **workflow** (必填): workflow 的名字

- **webhook** (选填): 钉钉机器人 [webhook](https://chenggroup.github.io/wiki/notification_for_hpc#申请钉钉机器人)，当工作流完成时想要即时收到钉钉提醒时可设置，否则可不用

- **resdir** (选填, default: 当前所在路径): 结果文件的储存路径

- **structure/structures_folder** (必填其中之一): 如果需要输入多个结构 structure 则是列表的形式，列表中是所需的结构文件的路径，如果是 structure 直接输入一个结构文件路径即可，如果批量进行计算，则把批量的结构所在文件夹加入 structures_folder

- **cell** (选填): 设置了 cell 后会改变那些结构中不包含 cell 信息的 cell。如果用的是 .xyz 格式，一般需要设置 cell (因为 .xyz 一般不包含 cell 的信息)，.cif or POSCAR(.vasp) 则不需要设置。cell 的格式与 ase 中的 cell 格式保持一致，如 [12, 12, 12] 或 [[12, 0, 0], [0, 12, 0], [0, 0, 12]] 或 [12, 12, 12, 90, 90, 90]

- **metadata** (选填): 

  - config: cp2k 输入参数的基本设置

  - kind_section: 配置 BASIS_SET 和 POTENTIAL 的基本信息，可以有四种输入形式

    - ```python
      # .json
      "kind_section": {"BASIS_SET": "DZVP-MOLOPT-SR-GTH", "POTENTIAL": "GTH-PBE"}

      # or .yaml
      kind_section:
        BASIS_SET: DZVP-MOLOPT-SR-GTH
      POTENTIAL: GTH-PBE
      ```
      
    - ```python
      # .json
      "kind_section": {"H": {"BASIS_SET": "DZVP-MOLOPT-SR-GTH", "POTENTIAL": "GTH-PBE"}, "O": {"BASIS_SET": "DZVP-MOLOPT-SR-GTH", "POTENTIAL": "GTH-PBE"}, ...}
  
      # or .yaml
      kind_section:
        H:
          BASIS_SET: DZVP-MOLOPT-SR-GTH
          POTENTIAL: GTH-PBE
        O:
          BASIS_SET: DZVP-MOLOPT-SR-GTH
          POTENTIAL: GTH-PBE
        ...
      ```
      
    - ```python
      # .json
      "kind_section": [{"_": "H", "BASIS_SET": "DZVP-MOLOPT-SR-GTH", "POTENTIAL": "GTH-PBE"}, {"_": "O", "BASIS_SET": "DZVP-MOLOPT-SR-GTH", "POTENTIAL": "GTH-PBE"}, ...]
      
      # or .yaml
      kind_section:
        - _: H
          BASIS_SET: DZVP-MOLOPT-SR-GTH
          POTENTIAL: GTH-PBE
        - _: O
          BASIS_SET: DZVP-MOLOPT-SR-GTH
          POTENTIAL: GTH-PBE
        ...
      ```
  
    - ```python
      # .json
      "kind_section": "<<YOUR_KIND_SECTION_FILE>>"  # YOUR_KIND_SECTION_FILE can be .json or .yaml
      
      # or .yaml
      kind_section: <<YOUR_KIND_SECTION_FILE>>  # .json or .yaml
      ```
  
  - machine: 选择配置好的服务器 (目前仅支持 `cp2k@aiida_test`) 以及配置资源的使用情况
  
  - ...: some parameters for special workflow

### 可选用的 workflow

输出的基本信息在 `results.dat` 中，以下 workflow 中仅说明除了 `results.dat` 外的输出文件

- EnergySingleWorkChain: just single point energy
- GeooptSingleWorkChain: just geomertry optimization
- NebSingleWorkChain: just CI-NEB
- FrequencySingleWorkChain: just vabrational analysis
- NebWorkChain: Goopt for initial and final state --> NEB --> Vabrational analysis

### 运行命令

运行以下命令即可提交工作流，`<<YOUR_INPUT_FILE>>` 为 `.json` 或 `.yaml` 输入文件的路径，缺省值为当前路径下的 `ecint.json`

```bash
ecrun <<YOUR_INPUT_FILE>>
```

## 常见错误

待补充...