---
title: MDAnalysis 软件包的使用
authors: 毕睿豪，王程玄
comments: true
---

# `MDAnalysis` 软件包的使用

## 我是否需要使用`MDAnalysis`

`MDAnalysis`是一个处理分子动力学模拟轨迹的`python`软件包。它最为突出的是优点是全面的轨迹io方法，可以处理常见分子动力学模拟的输出轨迹格式。同时，`MDAnalysis`和的io理念使其更加适合作为大轨迹文件逐帧进行统计分析的工具。该软件内置了很多分子动力学模拟分析方法，所以你可以用它轻松地实现一些例行分析。比如，径向分布函数(RDF), 水密度（number density）和氢键分析等。除过内置方法，用户也可以用`MDAnalysis`自定义分析方法。

(内置分析)[https://docs.mdanalysis.org/stable/documentation_pages/analysis_modules.html]

(如何DIY你自己的分析)[https://userguide.mdanalysis.org/stable/examples/analysis/custom_trajectory_analysis.html]

如果你需要作如下的分析，`MDAnalysis`就非常适合你：

* MD统计分析：需要对MD轨迹中每一个单帧进行相同操作，并且需要循环整条轨迹的统计。例如，你需要统计A原子和B原子间的距离

* 周期性体系的距离计算：高效快速的距离计算库函数，提供`[a, b, c, alpha, beta, gamma]` cell parameter就可以考虑PBC下的距离。

## IO 理念

### 1. 初始化

`MDAnalysis`将轨迹文件，topology信息等抽象为一个`Universe` class. 例如一条xyz轨迹可以如下初始化，

```python
from MDAnalysis import Universe
xyzfile = "./tio2-water.xyz"
u = Universe(xyzfile)
u.dimensions = np.array([10, 10, 10, 90, 90, 90])    # assign cell parameter
```

这样初始化一个`u`实例其实并不会读取整个文件，在此阶段，用户可以使用`u`进行选择部分原子，得到一个`atomgroup`对象。例如，使用

```python
ag      = u.atoms        # select all atoms
xyz     = ag.positions   # get the coordinates for these atoms
element = ag.elements    # the element labels for theses atoms
```

可以将所有原子选取成一个`atomgroup`对象。其实`MDAnalysis`支持一些更fancy的选择语法，类似于`VMD`的语法，详见[MDAnalysis选择语法](https://docs.mdanalysis.org/stable/documentation_pages/selections.html)。但是，根据笔者的经验，这中选择语法对我们研究的体系来说不好用，使用`ASE`进行这些选择就会更加方便。

### 2. 轨迹的读取

在初始化一个`Universe`后，你可以通过如下方法手动激活轨迹的读取：

```python
print(u.trajectory)                 # reading the trajectory
n_frames = u.trajectory.n_frames    # get the number of frames of your traj
u.trajectory.ts.dt = 0.0005         # set dt to 0.0005 ps, otherwise you will get a warning 
```

否则，在运行分析之前，`MDAnalysis`不会自动读取文件。

实际上，就算在上面的读取过程中，`MDAnalysis`也不会把轨迹读入内存，而是读取了一条轨迹的开头在文件的位置。以我们比较熟悉的`xyz`文件为例，

```
100                                 <- 帧开头
TIMESTEP: 0
*.*****    *.*****    *.*****
*.*****    *.*****    *.*****
              ·
              ·
              ·
              ·
*.*****    *.*****    *.*****
100                                 <- 帧开头
TIMESTEP: 2
*.*****    *.*****    *.***** 。    
```

`MDAnalysis`会遍历整个文件流，将轨迹开头在文件流中的位置保存在`u.trajectory._offsets`中。

```
    |+----------------+----------------+----------------+--···············--+----------------|
    |*             ️   *            ️    *            ️    *              ️     *                |
    |*             ️   *            ️    *            ️    *              ️     *                |
    |*             ️   *            ️    *            ️    *              ️     *                |
    |*             ️   *            ️    *            ️    *              ️     *                |
    |v                v                v                v                   v                |
    ------------------------------------------------------------------------------------------
    |0                1                2                3                   N                |
array(
    [<_offsets(0)>,   <_offsets(1)>,   <_offsets(2)>,   <_offsets(3)>, ..., <_offsets(N)>    ]
)  ---> u.trajectory._offsets
```

有了这些帧开头在文件的地方，`MDAnalysis`就可以任意读区任意一帧轨迹文件的的数据。例如，如果你需要读区第70帧的坐标，你就可以

```python
>>> print(u.trajectory)
>>> ag = u.atoms
>>> print(u.trajectory.ts)
< Timestep 0 with unit cell dimensions None >
>>> for ii in range(69):
...     u.trajectory.next()
>>> print(u.trajectory.ts) 
< Timestep 69 with unit cell dimensions None >
>>> xyz70 = ag.atoms
>>> u.trajectory.rewind()                       
< Timestep 0 with unit cell dimensions None >
```

可以看到，`u.trajectory`其实是一个迭代器，你可以通过`u.trajectory.next()`方法下一得到下一帧的trajectory。同时，这一帧的坐标也会更新至`atomgroup.position`。实际上，在使用`MDAnalysis`进行分析时你不需要执行这些底层的`next`和`rewind`方法，这些繁琐的步骤已经包装好了。

实际上可以直接通过索引的方式对第70帧的结果进行提取：
```python
>>> print(u.trajectory[70])
< Timestep 70 with unit cell dimensions None >
```

同时，正因为`u.trajectory`是一个迭代器，对于其父类`ProtoReader`，其中定义了`__iter__`方法来返回一个迭代器对象，同时定义了`__next__`方法来回应对应的迭代过程。而在`__next__`方法返回的即为`next()`函数中的内容。因此如果想对一条轨迹进行切片分析而不是逐帧分析，我们就可以使用切片后的轨迹来进行迭代：

```python
>>> for ts in u.trajectory[10:10000:20]:    # 从第10帧到10000帧每20步取一帧
...     print(ts.frame)
10 30 50 70 90 110 130 150 ...
```

综上所述，`MDAnalysis`的轨迹读取方式有如下优点:

* 因为实际读取的是offsets，也就是帧开头的位置，仅仅读了N个整数。不像隔壁`ASE`，会实例化N个`Atoms`（包括了整条轨迹的坐标），于是会非常占用内存。`MDAnalysis`的io方法内存占用小，loop也更快。

* 读取offsets后你可以将`Universe`对象保存下来[见下文](#save-universe)，读取后不需要再遍历整个轨迹文件。这样，假如你又有了新的分析，你就可以省下遍历文件的时间。

## 保存一个`Universe`实例 { #save-universe }

假如说你现在有一条轨迹文件`traj.xyz`，你可以通过如下方法将其保存下来，节省二次分析时读取帧开头的时间。

```python
import pickle
from MDAnalysis import Universe

>>> xyzfile = "/path/to/traj.xyz"     # !!! Use absolute path. It's more robust.     
>>> outuni  = "./traj.uni"
>>> u = Universe(xyzfile)
>>> print(u.trajectory)               # This will take some time
<XYZReader /path/to/traj.xyz with 100 frames of 3240 atoms>
>>> with open(outuni, 'wb') as f:
...    pickle.dump(u, f)
```

建议初始化`Universe`时使用绝对路径，这样你可以将复制到`traj.uni`复制到任意路径对轨迹分析。在二次分析时，你可以直接这样读取一个`Universe`:

```python 
>>> with open(outuni, 'rb') as f:
...     v = pickle.load(f) 
>>> print(v.trajectory)
<XYZReader /path/to/traj.xyz with 100 frames of 3240 atoms>
```

笔者的经验是，在我们的`<fat>`节点上，遍历一个 6G 大小的xyz轨迹文件的帧开头需要 3 min。

## 距离计算库函数

`MDAnalysis`有优秀的底层距离计算函数库`MDAnalysis.lib.distances`，是开发者用`C`语言编写底层方法，用`python`包装一个库，详见[`lib.distances` API](https://docs.mdanalysis.org/stable/documentation_pages/lib/distances.html)。它长于在于计算周期性边界条件（PBC）下的原子间距离，并且文档翔实。而且与`MDAnalysis`的`Universe`、`Analysis`等类相独立，你只需要提供原子坐标，盒子大小，cutoff大小，就可以得到距离、角度等数据。

下面是笔者用该函数库里`capped_distance`方法包装的的一个配位数计算器。

```python
def count_cn(atoms1, atoms2, cutoff_hi, cutoff_lo=None, cell=None):
    """count the coordination number(CN) for atoms1 (center atoms), where atoms2 are coordinate atom. This function will calculate CN within range cutoff_lo < d < cutoff_lo, where d is the distance between atoms1 and atoms2. Minimum image convention is applied if cell is not None

    Args:
        atoms1 (numpy.ndarray): Array with shape (N, 3), where N is the number of center atoms. 'atoms1' are the position of center atoms. 
        atoms2 (numpy.ndarray): Array with shape (M, 3), where M is the number of coordination atoms. 'atoms2' are the positions of coordination atoms.
        cutoff_hi (float): Max cutoff for calculating coordination number. 
        cutoff_lo (float or None, optional): Min cutoff for calculating coordination number. This function will calculate CN within range cutoff_lo < d < cutoff_lo, where d is the distance between atoms1 and atoms2. Defaults to None.
        cell (numpy.ndarray, optional): Array with shape (6,), Array([a, b, c, alpha, beta, gamma]). Simulation cell parameters. If it's not None, the CN calculation will use minimum image convention. Defaults to None.

    Returns:
        results: Array with shape (N,), CN of each atoms atoms1
    """
    pairs, _ = capped_distance(reference=atoms1,
                               configuration=atoms2,
                               max_cutoff=cutoff_hi,
                               min_cutoff=cutoff_lo,
                               box=cell)
    _minlength = atoms1.shape[0]
    results = np.bincount(pairs[:, 0], minlength=_minlength)
    return results
```

其实隔壁`ASE.geometry`下也有类似的底层方法，但是笔者认为使用体验确实不如`MDAnalysis.lib.distances`（计算速度慢，文档少）。

下面对两组原子距离矩阵进行benchmark，每组100个原子，结果是一个100x100的`numpy.array`，可以发现`MDAnalysis.lib.distances`会快15倍。所以当你有上万个这样计算的时候，使用`ASE`的函数库会影响你的效率。

```python
>>> import numpy as np
>>> from ase.geometry import get_distances
>>> from MDAnalysis.lib.distances import distance_array
                       ·
                       ·
                       ·
>>> print(xyz1.shape, xyz2.shape)
(100, 3) (100, 3)
>>> print(cell)
[[50.5123      0.          0.        ]
 [ 5.05820546 13.34921731  0.        ]
 [ 0.          0.         47.8433    ]]
>>> print(cellpar)
[50.5123 14.2754 47.8433 90.     90.     69.2476]

In[1]: %%timeit
...    dmatrix_mda = distance_array(xyz1, xyz2, box=cellpar)
1.03 ms ± 5.11 µs per loop (mean ± std. dev. of 7 runs, 1,000 loops each)

In[2]: %%timeit
...    vec, dmatrix_ase = get_distances(xyz1, xyz2, cell=cell, pbc=True)
16.6 ms ± 133 µs per loop (mean ± std. dev. of 7 runs, 100 loops each)
```

### 注意：如果你在处理非正交的模拟盒子

我们注意到，在上述距离计算的例子里，我们需要通过cell parameter，[a, b, c, alpha, beta, gamma]，给`MDAnalysis.lib.distances`提供模拟盒子的信息。而实际上，计算距离的时候cell parameter会先通过内部方法转化成3x3的盒子矩阵。如果你的盒子并不是正交的，应该先检查你提供的cell parameter能否正确得到3x3的矩阵，再使用这个函数库，否则你可能会得到错误的结果。[这里是他们使用的python转换脚本](http://www.mail-archive.com/gmx-users@gromacs.org/msg28032.html)。


## 复杂的轨迹分析——简要介绍面对对象编程的方法
在实际的催化自由能计算当中，在分析过程中实际涉及的变量往往不止于一个简单的分子动力学轨迹文件。如在增强采样的轨迹当中，就会有涉及bias偏置势的`COLVAR`文件，其中的`*bias`是获得不同结构在实际的相空间中的权重的重要参数。

同时，面对过程的编程方法在遇见大量的重复过程的时候往往会面对变量繁多、过程复杂的问题。比如对同样的化学体系在不同的温度下进行分子动力学采样，使用程序对结果进行分析的时候，如果是面对过程编程，要么使用大量的变量来对数据进行提取，要么增加一个变量中数据的维度。因此在遇到复杂的数据处理时很容易理不清过程，找不到问题所在。因此就需要引入面对对象编程的思路，在这种模式下我们解决问题的方法从过程导向变成了对象导向。这个对象可以是任何东西，比如一个文件，一个路径等等，而我们想获得这个对象的信息来解决我们想知道的问题，就需要定义一些方法来处理。

下面我们结合一个例子来大致说明面对对象编程的简要思路过程：

**问题描述**

在一条增强采样的轨迹当中，我们想要提取结构中一种原子(A)的另外一种原子(B)的配位数分布以及在不同配位数下面的结构分布特征，并结合增强采样的权重来对结果进行更为严谨的分析。首先我们需要引入轨迹文件中的分子结构信息，再计算给定环境的配位数，提取配位环境的原子坐标，并在后续计算局部结构的特征信息（如键角、二面角分布等）。在这些结构当中，我们需要同时提取`COLVAR`文件中对应的`bias`信息，用于在后续过程中的加权。

在使用`MDAnalysis`库对这样的文件结构分析的时候，得益于强大的工具支持，我们处理的复杂的问题也就可以更为迅速。参考本文开始时给出的[网页中的相关段落](https://userguide.mdanalysis.org/stable/examples/analysis/custom_trajectory_analysis.html#Creating-your-own-class)，我们是首先引入相应的坐标信息文件以及`COLVAR`文件来初始化类（在问题的处理过程当中，这一步相当于引入原始信息，当然我们也可以在对应的方法当中再引入，如果有方法中需要用到的统一的信息，在`__init__`方法中引入是最为直观和方便的）：
```python
class A_center_analysis(AnalysisBase):
    def __init__(self, lmpfile, COLVAR_file, verbose=True):
        u = Universe(lmpfile, topology_format="LAMMPSDUMP")
        u.select_atoms("type 1").masses = 114
        u.select_atoms("type 2").masses = 514
        u.trajectory.ts.dt = 0.0005
        self.cell = u.dimensions
        self.bias = np.loadtxt(COLVAR_file, skiprows=1, usecols=-1)

        assert u.trajectory.n_frames == len(self.bias) 
        
        self.atomgroup = u.select_atoms("all")
        super(A_center_analysis, self).__init__(self.atomgroup.universe.trajectory, verbose=verbose)

```
其中```super()```函数用于调用父类`AnalysisBase`当中的初始化函数，以便于后续变量的易用性。

此后我们定义准备好的结果变量，在原例当中只使用了一个`self.result`变量来包含所有的结果，在后续的调用当中不是很明朗，因此在此处可以多定义一些。
```python
    def _prepare(self):
        self.cn_2 = np.array([])        
        self.angle_2 = np.array([])
        self.bias_2 = np.array([])
```

与之类似的，我们可以使用`_conclude()`方法对计算结果进行后处理，就不需要在最后一帧结束后进行判断再进行后处理了。比如前面定义的几个变量为列表，在最后想换成`np.array()`的格式，就可以在`_conclude()`方法中进行变换。
```python
    def _conclude(self):
        self.cn_2 = np.array([])        
        self.angle_2 = np.array([])
        self.bias_2 = np.array([])
```

此后，我们可以定义我们对应的分析方法，并将关心的结果放到合适的类属性当中（这一步就是将原始信息进行处理，获得对象的一系列属性的过程）
```python
    def _append(self, cn, data):
        assert data.shape == (cn+1, 3)
        if cn == 2:
            self.cn_2 = np.append(self.cn_2, data)
            self.cn_2 = self.cn_2.reshape(-1,3,3)

            BAB_angle = calc_angles(data[1],data[0],data[2], box=self.cell)
            self.angle_2 = np.append(self.angle_2, BAB_angle)
            self.bias_2 = np.append(self.bias_2, self.bias[self.atomgroup.ts.frame])    # 此处对结构对应的bias信息进行提取
        else:
            pass
    
    def _single_frame(self):
        A_coord = self.atomgroup.select_atoms("type 1").ts[:]
        B_coord = self.atomgroup.select_atoms("type 2").ts[:]
    
        pairs, _ = capped_distance(reference=A_coord,configuration=o_coord,
                                   max_cutoff=2.6,min_cutoff=None,
                                   box=self.cell)
        _minlength = A_coord.shape[0]
        cn_results = np.bincount(pairs[:, 0], minlength=_minlength)
    
        for A_cn in range(2,5):
            A_centers = A_coord[cn_results == A_cn]
            for ag_center in ag_centers:
                A_B_map = distance_array(A_center, B_coord, box=self.cell)[0]
                coordinated_B_coord = B_coord[A_B_map.argsort() < A_cn]
                self._append(A_cn, np.vstack((A_center, coordinated_B_coord)))
```
其中，`_single_frame()`方法是后续在跑的过程当中循环迭代的主要程序，其中的`self.atomgroup`可以看作单一一帧的数据，后面的处理方法也是针对于这一帧的。在父类当中的`run()`方法会自动帮忙进行迭代，只需要规定好迭代的范围以及步长即可。

在此处多定义一个`_append()`方法的目的是为了将添加到结果变量中的程序和主要的分析程序分开，以便于后续的功能拓展（如对配位数等于3的坐标信息进行二次处理就可以直接在`_append()`函数当中添加功能而不用再动提取信息的相关程序）。

在后续的调用过程中，我们只需要初始化相关分析类并run就可以了
```python
>>> lmpfile = "300.lammpstrj"
>>> a_300 = A_center_analysis(lmpfile, "COLVAR")
>>> a_300.run(start=200000, stop=-1, step=100)
>>> print(a_300.bias_2.shape, a_300.angle_2.shape, a_300.cn_2.shape)
(20472,) (20472,) (20472, 3, 3)
```
从输出的数据尺寸相同可以看出比较符合我们的预期，能够做到结构和对应的偏置势一一对应，在后续的分布处理过程当中，我们可以对其进行直方图概率密度估计（当然更严谨的方法是使用高斯核概率密度估计的方法）：
```python
>>> plt.hist(a_300.angle_2*180/np.pi, weights=np.exp(beta*a_300.bias_2), bins=100, density=True)
```
同样的，可以将程序再向上封装一层，即相同体系的不同温度下的结果作为一个类的对象来进行分析，这样输出的结果更为清晰。这样的封装可能就需要统一文件命名方式，以及格式化的路径命名方式等等，在实际的工作当中带来的效率提升往往很可观。