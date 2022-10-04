---
title: 如何使用 Wiki
authors: 熊景放
comments: true
---

# 如何使用 Wiki

Wiki 书写使用 markdown 格式。本 wiki 使用 python-markdown 作为 markdown 的解释器，支持一些 markdown 的扩展语法。在本地编辑 markdown 文件时，推荐使用 [VSCode](https://code.visualstudio.com)。

!!! warning
    Typora正式版已经收费，且测试版在某些系统环境已不可用。

有任何问题可以在 <{{ config.repo_url }}/issues> 进行反馈。

> 文档中带有 `*` 的部分可以略过。


## 对某篇 wiki 内容有疑问

请使用页面下方的评论区、登陆Github账号后进行评论。该部分基于[giscus](https://giscus.app/)构建，可以自动创建一个discussion，从而提供方便的互动。此功能需要创建页面的贡献者手动开启。

## 如何上传 wiki

如果还不会 markdown 语法，可以先看 [markdown 语法部分](#markdown-语法)，能被识别为 wiki 的 markdown 文件应在文件的开头插入 [YAML Front Matter](#yaml-front-matter)。把自己的 markdown 文档上传到 wiki 上可以有两种方案，本质都是在使用 Github: 1. 上传文件至 Github 仓库 (推荐)；2. 由 [wiki 网站](../../index.md) 导向编辑页面。

### 上传文件至 github 仓库 (推荐)

推荐通过 pull requests 的方法来增加或修改 [wiki 网站](../../index.md) 上的 wiki。

#### 1. Fork wiki 文档所在仓库

先 fork <{{ config.repo_url }}> ，然后进入 fork 成功后的仓库。

![Screen Shot 2019-11-09 at 02.07.35](https://tva1.sinaimg.cn/large/006y8mN6gy1g8r6kit9pej311t0kxad7.jpg)

#### 2. 创建新文件或上传本地文件

![Screen Shot 2019-11-09 at 02.16.32](https://tva1.sinaimg.cn/large/006y8mN6gy1g8r6wiwgauj311t0kwjue.jpg)

推荐在本地用 typora 等编辑器写好 markdown 后直接上传文件，文件请上传至 [_wiki]({{ config.repo_url }}/tree/master/_wiki) 目录 (master 分支)。也可以修改 fork 的仓库的 _wiki 下的文件，然后再提交 PR。

#### 3. 提交 PR

![Screen Shot 2019-11-09 at 02.31.25](https://tva1.sinaimg.cn/large/006y8mN6gy1g8r757esxtj311t0kwad2.jpg)


### 由 wiki 网站导向编辑页面*

> :warning: 仅推荐 [chenggroup 仓库的成员](https://github.com/orgs/chenggroup/people) 通过这种方式编辑 wiki。  

点击标题右侧的笔的图标可进入相应的 github 仓库中的文件编辑页面。当然，推荐任何人使用 `Ask a Question` 。

## 如何预览 wiki

预览 wiki 也有两种方案：1. 使用 typora 等实时渲染；2. 在本地启动 jekyll 服务。

### 通过 typora (注意已经收费)

使用 [typora](https://www.typora.io/ "轻量化md编辑工具") 编辑器可以很方便地实时渲染 markdown 文件。如果不使用本 wiki 中标注有 `*` 的 [wiki 扩展语法](#按钮) ，则可以大体上认为 typora 所渲染出的文档与直接查看 [wiki 网站](../../index.md) 的文档相差无几，基本仅存在显示风格上的差异。但要注意需更改 typora 的一些设置（见后文），避免和 wiki 所使用的 markdown 扩展功能发生冲突。

#### 修改 markdown 拓展语法设置

需要关闭上下标、高亮以及图表的功能。

![Screen Shot 2019-11-08 at 21.21.10](https://tva1.sinaimg.cn/large/006y8mN6ly1g8qy66mfwgj30im0dcjt0.jpg)

#### 修改数学公式设置

需要关闭数学公式自动添加序号的功能。

![Screen Shot 2019-11-08 at 21.23.00](https://tva1.sinaimg.cn/large/006y8mN6ly1g8qy7qdjgmj30im0dcgn2.jpg)

#### 修改图像设置

需要把默认的无特殊操作改为通过 iPic 上传图片，不过在这之前需要 [下载 iPic](https://apps.apple.com/cn/app/ipic-markdown-图床-文件上传工具/id1101244278?mt=12) 。推荐在 iPic 偏好设置中开启压缩上传图片的选项，这样可以使 wiki 网页加载的速度更快。

![image-20210602152924699](https://cdn.jsdelivr.net/gh/xjf729/FigureBed@master/Imgs/image-20210602152924699.png)

### 通过 Mkdocs 服务*

#### 1. 下载网站源码至本地

```bash
git clone {{ config.repo_url }}.git
cd chenggroup.github.io
```

#### 2. 安装 [mkdocs-material](https://squidfunk.github.io/mkdocs-material/getting-started/) 和 必要的 mkdocs 插件

可参考 [mkdocs-material 官方安装指南](https://squidfunk.github.io/mkdocs-material/getting-started/)

```bash
pip install mkdocs-material \
    mkdocs-awesome-pages-plugin \
    mkdocs-macros-plugin
```

#### 4. 启动 Mkdocs 服务

```bash
mkdocs serve
```

#### 5. 编辑 wiki

把要预览的 wiki 移到 `docs/wiki/` 目录下，或是直接编辑 `docs/wiki/` 目录下的 markdown 文件。

#### 6. 预览 wiki

等待片刻，打开浏览器访问 <http://127.0.0.1:8000> 。

## Markdown 语法

Markdown 是一种标记语言，和代码一样，可以用纯文本的形式来书写。其使用的常用标记符号不超过十个，可以让人专注于文字而不是排版，并且也可以方便地导出为 HTML、PDF 等格式。

### 基本语法

![markdown-basic-gramma](https://tva1.sinaimg.cn/large/006y8mN6ly1g8qom3uma2j30ow0lrtbm.jpg)

> :warning: 插入图片时切勿使用本地路径，否则在 wiki 上无法查看，具体请参考 [Typro 插入图片设置](#修改图像设置)。

可参考 [markdown 教程](https://www.markdownguide.org/basic-syntax/) 与 [练习](https://www.markdowntutorial.com/) 来学习基本语法。

> :warning: 要引用同一篇 wiki 中的小标题（二至六级标题）可以通过 `[sub title](#sub-title)` 来引用。不过需要注意，要把小标题中的空格用 `-` 代替，所有大写字母改成小写，且忽略 `.` , `&` 等特殊符号。比如，用 `[1. Fork wiki 文档所在仓库](#1-fork-wiki-文档所在仓库)` 来表示 [1. Fork wiki 文档所在仓库](#1-fork-wiki-文档所在仓库) 。若有多个同名标题，以 `title`, `tile-1`, `title-2` 来区分。

### GFM 扩展语法

GFM(GitHub Flavored Markdown) 是 github 所使用的 markdown 扩展语法。

#### 清单

```gfm
- [ ] 未完成列表
- [x] 已完成列表
```

- [ ] 未完成列表
- [x] 已完成列表

#### 表情

```gfm
:eyeglasses: :+1:
```

:eyeglasses: :+1:

### Wiki 扩展语法

标注 * 的部分可以不去注意

#### YAML Front Matter

##### 加入标题

只有在 `markdown` 文件的头部加入 `YAML Front Matter` 部分，才能使你写的 wiki 展示在网页上。因此最简单的，请在 `YAML Front Matter` 中加入 `title`，如下所示：

```yaml
---
title: getting-started
---
```

##### 添加作者

在 `YAML Front Matter` 中加入 `authors` 即可添加作者，多个作者用 yaml 语法的列表表示：

```yaml
---
title: getting-started
authors: one author
---
```

```yaml
---
title: getting-started
authors:
  - author1
  - author2
---
```

##### 开启评论功能

对创建页面的编辑者来说，通常情况下请开启评论功能、以便读者可以快速提交反馈或评论，即在 `YAML Front Matter` 部分增加一行：

```yaml
---
...
comments: true
---
```

#### 数学公式

数学公式可以用 LaTeX 语法来书写，两端用 `$`(一般用于行内公式) 或 `$$`(会使公式居中显示) 来标记，如 `$E=mc^2$` 可表示 $E=mc^2$ 。

```gfm
$$
E[\rho] = T_s[\rho] + \int \mathrm{d}r\ v_{\rm ext}(r)\rho(r) + V_{H}[\rho] + E_{\rm xc}[\rho]
$$
```

$$
E[\rho] = T_s[\rho] + \int \mathrm{d}r\ v_{\rm ext}(r)\rho(r) + V_{H}[\rho] + E_{\rm xc}[\rho]
$$

要表示多行公式，需要使用 `aligned`，并要在行尾部加 `\\`。

```gfm
$$
\begin{aligned} \dot{x} &= \sigma(y-x) \\
\dot{y} &= \rho x - y - xz \\
\dot{z} &= -\beta z + xy \end{aligned} 
$$
```

$$
\begin{aligned} \dot{x} &= \sigma(y-x) \\
\dot{y} &= \rho x - y - xz \\
\dot{z} &= -\beta z + xy \end{aligned}
$$

若实现给公式编号等功能，可参照 LaTeX 的做法。

#### 化学式与化学反应式

此功能通过 LaTeX 的 mhchem 插件来实现，使用上与数学公式输入相近，都需要通过 `$` 或 `$$` 来标记。

|                          源码                          |                  化学式与化学反应式                  |
| :----------------------------------------------------: | :--------------------------------------------------: |
|                    `$\ce{Mg(OH)2}$`                    |                    $\ce{Mg(OH)2}$                    |
|                    `$\ce{CrO4^2-}$`                    |                    $\ce{CrO4^2-}$                    |
|                 `$\ce{[Cu(NH3)4]^2+}$`                 |                 $\ce{[Cu(NH3)4]^2+}$                 |
|                  `$\ce{CoCl2.6H2O}$`                   |                  $\ce{CoCl2.6H2O}$                   |
|                `$\ce{^{227}_{90}Th+}$`                 |                $\ce{^{227}_{90}Th+}$                 |
|                    `$\ce{C2H5-OH}$`                    |                    $\ce{C2H5-OH}$                    |
|                   `$\ce{CH3CH=CH2}$`                   |                   $\ce{CH3CH=CH2}$                   |
|                     `$\ce{HC#CH}$`                     |                     $\ce{HC#CH}$                     |
| `$\ce{CaCO3 ->[900\,{}^{\circ}\mathrm{C}] CaO + CO2}$` | $\ce{CaCO3 ->[900\,{}^{\circ}\mathrm{C}] CaO + CO2}$ |
|       `$\ce{H2PO4- <=>C[OH-][H+] H+ + HPO4^2-}$`       |       $\ce{H2PO4- <=>C[OH-][H+] H+ + HPO4^2-}$       |

#### 上下标

一般情况下可以用 `<sup></sup>` 表示上标，用 `<sub></sub>` 表示下标，如 支付宝<sup>TM</sup> 可用 `支付宝<sup>TM</sup>` 表示。

#### 按钮*

```markdown
[Subscribe to our newsletter](#){ .md-button }
```
<!--
改变对应的 `btn-success` class，就能改变按钮相应的颜色

[success](#){ .md-button .md-button--success }
[info](#){ .md-button .md-button--info }
[success](#){ .md-button .md-button--success }
[secondary](#){ .md-button .md-button--secondary }
[primary](#){ .md-button .md-button--primary }
[danger](#){ .md-button .md-button--danger }
[warning](#){ .md-button .md-button--warning }
-->

[default](#){ .md-button }
[primary](#){ .md-button .md-button--primary }

#### 提示*

```markdown
!!! tldr "title"
    TLDR means too long, didn't read
```

改变 `tldr` 即可使用不同的提示类型，比如

!!! tldr "Use `tldr` for this."
    TLDR means too long, didn't read
!!! tip "Use `tip` for this."
    This is a tip.
!!! info "Use `info` for this."
    This is a piece of information, or you can use todo.
!!! question "Use `question` for this."
    This is a question.
!!! warning "Use `warning` for this."
    This is a warning
!!! danger "Use `danger` for this."
    This alerts danger!
!!! success "Use `success` for this."
    This alerts success

#### 流程图

流程图可以用来表示工作流或者步骤等：

````markdown
``` mermaid
graph LR
  A[Start] --> B{Error?};
  B -->|Yes| C[Hmm...];
  C --> D[Debug];
  D --> B;
  B ---->|No| E[Yay!];
```
````

``` mermaid
graph LR
  A[Start] --> B{Error?};
  B -->|Yes| C[Hmm...];
  C --> D[Debug];
  D --> B;
  B ---->|No| E[Yay!];
```

### 引用本网站的其他 wiki

使用

```markdown
[title](relavent/path/to/file.md)
```

即可在 wiki 中引用本网站的其他 wiki 。只需将 `relavent/path/to/file.md` 改成想要引用的 wiki 相对此文档的 **相对路径**。

比如，要想引用 `如何使用 wiki` 这篇 wiki，则只需把 `relavent/path/to/file.md` 换成 `../how_to_edit/howtodo.md`。

![Screen Shot 2019-12-02 at 11.30.03](https://tva1.sinaimg.cn/large/006tNbRwgy1g9i81zy06ij313z071wft.jpg)

!!! warning
    注意这里推荐使用的是相对路径，可不改变同级目录结构。如需修改上级目录结构需要对应更改。

## 参考资料*

要使用更多功能，请参考[mkdocs-material官方文档](https://squidfunk.github.io/mkdocs-material)。

当然，想要快速获得支持，也可以联系作者或者 [Open an issue]({{ config.repo_url }}/issues) 。
