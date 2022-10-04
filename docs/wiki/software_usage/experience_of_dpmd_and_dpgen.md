---
title: DPMD和DPGEN使用经验
authors: 黄剑兴
comments: true
---

# DPMD和DPGEN使用经验

## DPMD train.json参数设置和理解：

## dp-kit 安装
- 如果本地有GPU，推荐使用dp-kit全包下载，总大小1G。 shell执行安装。便于在本地开发测试。

## DeepPotential
1. 形象化理解sel_a：一个原子越高概率出现，对应sela越大；sela对应以任意原子为center，能找到的该原子的最大数目
2. neuron network和resnet大小一般不修改；同时训练多个势函数需要修改随机种子`seed`
3. 用于实际使用的势函数需要well-train，需要“长训练”，常用设置为：

```python
"learning_rate" - "decay_steps"：20000,
"stop_batch": 400000, # 使用200000 步也大致没有问题。
```

## DPGEN 使用
1. 提交训练后需要跟踪train的情况。有时候由于提交后无法配置GPU资源（被其他程序占用或其他原因），导致训练输出为“nan”，需要重新提交并确保获取GPU资源。
2. V100卡上短训练一般在4~8小时。长训练是短训练10倍时间。理论上dpmd方法训练时间随元素类型数目线性增长。（MN，M原子数，N类型数）。
3. 用于训练的数据要正确的设置`type.raw`。尤其注意初始数据的处理，保证元素顺序，编号正确。
4. 注意测试k-points，dpgen在vasp的INCAR中使用`kspacing`和`kgamma`来决定kpoints。一般要求能量收敛到 1 meV/atom ，力分量收敛到 5 meV/A 以下。
5. dpgen 的exploration步骤通过md采样，探索步数一般随着迭代增加到10000~20000即可。一般增加随机的md起点数目比增加探索步数采样更高效。这是最关键的步骤，设计exploration策略时需要考虑实际使用时要探索体系和采样空间相类似。
6. 通过修改machine.json对应配置让dpgen报错停下，用于数据分析和检测。例如设置错误的端口/IP使任务在某步停下。
7. 如果训练了较旧版本的势函数，可以用更新版本从checkpoint开始，再增加2000步后freeze。（版本差异不能过大）
8. 神经网络拟合能力是很强的，**不consistent的数据（不同k点）也能拟合出非常小的能量/力误差**。所以，要注意使用测试体系检查势函数质量，测试体系取决于所研究的问题。也要注意输入的DFT数据做好充分的计算参数测试。
9. 提交任务后lcurve.out出现NaN；原因可能是内存或gpu没有正确分配。需要重启。
10. dp restart/freeze 要保持在相同的路径下，如果改变了文件夹位置/名称，可以修改checkpoint指明model路径。
11. MD同时使用四个模型评估不影响速度（在显存不占满的情况下）。
12. 使用多个模型MD，在旧版本中是用平均值，新版本>1.0是用第一个势函数值。
13. 注意可视化每轮的训练结果，包括学习曲线（训练误差随batch下降趋势），model_deviation的分布，单点能的收敛和结构正确，对每轮的结果进行分析。

## DFT单点能计算经验
- 一般对体系影响最大的是k点，需要测试不同的k点，k点数目和计算成本是对应的
- vasp擅长小体系多k点并行；大体系少k点会显著较慢；可以使用kspacing控制，参照

```python
from pymatgen import Structure
from math import pi
import numpy as np
import pandas as pd
stc = Structure.from_file('POSCAR')
a,b,c = stc.lattice.abc
# CASTEP 和 VASP 计算KSPACING不同,差一个常数2pi
kspacing_range = np.linspace(0.1, 0.6, 21)
kpoint_a = np.ceil( 2*pi/kspacing_range/a).astype('int')
kpoint_b = np.ceil( 2*pi/kspacing_range/b).astype('int')
kpoint_c = np.ceil( 2*pi/kspacing_range/c).astype('int')

df = pd.DataFrame({'kspacing': kspacing, 'a': kpoint_a, 'b': kpoint_b, 'c': kpoint_c})
print(df) # 查看不同kspacing 对应的K点数目
```

- 主要的INCAR计算参数是
    - ENCUT（一般取600/650保证quality，对计算速度影响不明显）；
     - ISMEAR=0（ISMEAR=-5的 Bloch方法需要k不小于4个，有时候不能用，测试表明，二者能量/力误差在1e-3以下，ISMEAR=0计算成本更低）
    - spin会对体系有非常大影响，一种brute force做法是直接给一个好的初猜（代码辅助），
    - LASPH可以考虑加入，提高精度，极少量成本。
    - LWAVE，LCHARG关掉，减少计算时间和储存空间浪费。
- 测试计算的思路应当是：先选一个最贵的，再提高精度，看是否收敛，之后以此为参照，降低不同参数。在保证了精度可靠的基础上，减少计算成本

```python
from ase.io import read
at = read('OUTCAR')
ref = read('ref/OUTCAR') # 
dE = ref.get_potential_energy() - at.get_potential_energy() # 一般dE 小于10meV
dEperAtom = dE/len(ref) # 要求小于1meV/atom
dF = ref.get_forces() - at.get_forces()
pritn(dF.max(), dF.min()) # 要求在5meV/A以下，尽可能在1meV/A 以下
```

4. LREAL = auto，对于大体系，推荐是real（auto默认会设置），对于GPU，必须要real。由于求积分方法差异，在实空间计算会引入1·2meV/atom的系统误差。
5. VASP输出的结构只要是电子步收敛的，都可以添加到训练集。需要注意添加了错误的结构（能量绝对值极大）会导致训练误差无法下降。
6. 如果VASP计算只有单K点，使用vasp_gam，相对vasp_std可以节省1/6 - 1/3的时间。

### 文件空间管理
随着模拟时间和模拟体系扩增，储存文件占用的空间非常巨大。在储存文件时候注意：
1. 保留必要的输入和输出文件：包括初始结构(data.lmp)，计算设置(input.lammps)，计算输出(log)，轨迹(traj)
2. 建议用如下方案压缩：

```shell
zip -9r -y data.zip data/   # 使用最大压缩率；保留文件相对路径压缩
```

也可以用npz压缩，相比zip直接压缩提高5%左右。

```cpython
import numpy as np
data = ...
data = data.astype('float32') # 保存为32位不损失坐标/力等需要的精度
np.save_compressionz('data.npz', data=data)
data = np.load(data)['data']  # 重新载入
```

