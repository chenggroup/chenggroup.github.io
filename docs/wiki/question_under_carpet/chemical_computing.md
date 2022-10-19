---
title: 计算化学踩坑合集
comments: true
---

# 计算化学踩坑合集

有时候，我们会沿用别人测试过的设置进行计算，而不一定会从头进行系统测试。但是，作为计算软件的使用者，我们需要意识到某些可能会出错的地方（或许是很棘手的问题），而不是将这些问题视而不见(_sweep the problems under the carpet_)。在此文章记录大家在项目中碰到的奇奇怪怪的坑，以供参考。

> 有新的内容可以通过 PR 或者评论区提出。可引用[置顶issue #131](https://github.com/chenggroup/chenggroup.github.io/issues/131)

## Cu pseudopotential

涉及 Cu 二价离子的计算可能要采用 19 电子的赝势 (semi-core potential)。

> We found that only the computation of the orbital energy of the empty d-level of aqueous Cu2+ requires the use of a semi-core potential with explicit 3s and 3p electrons.
> Ref: J. Am. Chem. Soc. 2004, 126, 12, 3928–3938 [[link]](https://pubs.acs.org/doi/full/10.1021/ja0390754)
