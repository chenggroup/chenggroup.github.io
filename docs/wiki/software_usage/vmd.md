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

那么请在**本地Mac/iMac的终端上**退出**XQuartz**然后在本地终端里输入:

```
defaults write org.macosforge.xquartz.X11 enable_iglx -bool true 
```

即可解决问题

Ref: https://www.ks.uiuc.edu/Research/vmd/mailing_list/vmd-l/28494.html

