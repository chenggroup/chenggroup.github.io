---
title: cp2k入门
authors: Yongbin Zhuang

---

# cp2k 入门

## 学习目标

- 设置CP2K环境变量
- 检查CP2K输入文件input.inp
- 单点能计算
- 结构优化
- 分子动力学

## CP2K的特色

CP2K同时使用了平面波基组和高斯基组，因此可以在傅立叶空间里描述长程作用力和实空间里描述局域的波函数。使用CP2K进行分子动力学(MD)运算效率很高。CP2K使用了单k点的计算方式，又称为gamma approximation，因此在早期CP2K版本中没有K点的设置。近年仅在单点能中加入了k点的计算。

## 设置环境变量

### 哪里获取Basis和PseudoPotential文件

[Github](https://github.com/cp2k/cp2k/tree/master/data)

### 省略路径

CP2K需要用到赝势和基组文件。假设这些文件都存在于目录`/somewhere/basis/`下。可以通过设置环境变量`CP2K_DATA_DIR`来让CP2K自己找到文件。

打开自己的 `~/.bashrc`文件. 添加以下命令

```bash
export CP2K_DATA_DIR=/somewhere/basis/
```

之后在使用赝势和基组时可以直接写文件名字而不需要指出路径。

## 检查cp2k输入文件

在服务器上，需要通过`module lood cp2k/版本号` 来启动cp2k软件。Load后，可以使用cp2k.popt命令，这是CP2K软件的主要程序。

CP2K的计算运行是

```bash
cp2k.popt input.inp > output
```

当然在服务器上需要通过提交脚本来执行命令。

由于CP2K输入文件有时较为庞大，经常会有误写或者语法错误的情况发生，为了避免提交之后被退回来，可以先使用命令检查:

```bash
cp2k.popt -c input.inp
```



