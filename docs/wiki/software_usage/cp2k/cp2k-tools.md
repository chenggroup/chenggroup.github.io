---
title: CP2K:tools
authors: 庄永斌
comments: true
---
# CP2K

cp2k有许多方便的工具。可以帮我们脚本化工作流程，节约时间。

## PYCP2K: 脚本化输入文件生成工具
主要使用Python语言，可以把cp2k输入工作集成为Python
具体使用链接[看这里](https://github.com/SINGROUP/pycp2k)

要注意的是，他这里只适用v5.1以前版本的 cp2k。如果我们使用例如v7.1以上的版本，那么可以自己生成对应的包。
详情见Pycp2k github的 README 中 Manual installation 部分。
在我们集群，要生成 xml 文件，首先`module load cp2k/7.1`，然后使用`cp2k.popt --xml`命令即可得到 xml 文件。
其他按照 Manual installation 的指示即可。
