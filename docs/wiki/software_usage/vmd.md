---
title: vmd 使用说明 
authors: Yongbin Zhuang
comments: true
---

# VMD 使用说明

## VMD介绍

VMD是分子可视化软件，主要用以查看分子动力学轨迹，

官网: http://www.ks.uiuc.edu/Research/vmd/

## VMD安装

### Linux 和 Windows

直接查看官网，其他无需特殊注意

### MacOS Catalina版本以上

由于苹果不再支持32位的软件，因此需要64位版本的VMD。

已经编译好的软件从这里下载: https://www.ks.uiuc.edu/Research/vmd/mailing_list/vmd-l/31222.html



### 使用集群的VMD进行远程查看

现在51和52集群上均安装了VMD/1.9.3

使用方法是

```bash
module load vmd/1.9.3
```

然后如同在本地端使用vmd一样使用即可。

#### 集群打开vmd报错

如果遇到报错

```
XRequest.149: BadMatch (invalid parameter attributes) 0xa00105
XRequest.149: GLXBadContext 0xa00001
```

首先在集群上查看

```
glxinfo
glxgears
```

如果得到报错

```
name of display: localhost:24.0
libGL error: No matching fbConfigs or visuals found
libGL error: failed to load driver: swrast
X Error of failed request:  GLXBadContext
  Major opcode of failed request:  149 (GLX)
  Minor opcode of failed request:  6 (X_GLXIsDirect)
  Serial number of failed request:  23
  Current serial number in output stream:  22
```

和

```
libGL error: No matching fbConfigs or visuals found
libGL error: failed to load driver: swrast
X Error of failed request:  BadValue (integer parameter out of range for operation)
  Major opcode of failed request:  149 (GLX)
  Minor opcode of failed request:  3 (X_GLXCreateContext)
  Value in failed request:  0x0
  Serial number of failed request:  28
  Current serial number in output stream:  30
```

那么请在 **本地Mac/iMac的终端上** 退出 **XQuartz** 然后在本地终端里输入:

```
defaults write org.macosforge.xquartz.X11 enable_iglx -bool true 
```

即可解决问题

Ref: https://www.ks.uiuc.edu/Research/vmd/mailing_list/vmd-l/28494.html

在 XQuartz 2.8.0 版本之后，其配置文件的位置从`org.macosforge.xquartz.X11`变成了`org.xquartz.X11`，因此上述的命令应当改为
```
defaults write org.xquartz.X11 enable_iglx -bool true
```

笔者在Apple Silicon的MAC上使用XQuartz连接服务器涉及`OpenGL`渲染器的程序时（如`vmd`）会遇到以下报错：
```
libGL error: No matching fbConfigs or visuals found
libGL error: failed to load driver: swrast
```
经过较为[粗浅的调研](https://github.com/XQuartz/XQuartz/issues/144)和linux端，目前将问题定位在`mesa`的驱动支持部分，或许是Apple Silicon的平台现在不支持`mesa`的渲染方式。现在还没有影响到正常的使用，但是每次都会有报错。
在上面的参考中有人给出了在mac下编译对应驱动的[参考](https://github.com/XQuartz/XQuartz/issues/144#issuecomment-1783952222)，后续可以考虑进行测试。~~XQuartz最后一次更新停留在2023年，该跑路了~~

#### WSL 远程使用 VMD 的注意事项

请参阅 [Windows下 WSL 使用简介](../cluster_usage/wsl_usage.md#vmd) 中的介绍。

