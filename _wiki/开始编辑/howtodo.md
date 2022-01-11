---
title: 如何使用 wiki
authors: 熊景放
priority: 0.1
---

# 如何使用 wiki

wiki 书写使用 markdown 格式。本 wiki 使用 kramdown 作为 markdown 的解释器，支持一些 markdown 的扩展语法。在本地编辑 markdown 文件时，推荐使用 [typora](https://www.typora.io/ "轻量化md编辑工具")，不过要注意不要勾选 typora 设置中的 `Markdown` → `Markdown 扩展语法` → `上标`/`下标`，其与 kramdown 的语法有冲突。

有任何问题可以在 <{{ site.repo }}/issues> 进行反馈。

> 文档中带有 `*` 的部分可以略过。

## 对某篇 wiki 内容有疑问

若某篇 wiki 说得不明白或者有错误，可以使用 `Ask a Question` 的功能。

鼠标移至页面上的省略号，点击 `Ask a Question` 即可跳转至反馈问题的页面 (不过这之前需要有一个 github 的账号): 

![Screen Shot 2019-11-21 at 18.09.52](https://tva1.sinaimg.cn/large/006y8mN6gy1g95to97bj0j30zd07udhn.jpg)

## 如何上传 wiki

如果还不会 markdown 语法，可以先看 [markdown 语法部分](#markdown-语法)，能被识别为 wiki 的 markdown 文件应在文件的开头插入 [YAML Front Matter](#yaml-front-matter)。把自己的 markdown 文档上传到 wiki 上可以有两种方案，本质都是在使用 github: 1. 上传文件至 github 仓库 (推荐)；2. 由 [wiki 网站]({{ site.baseurl }}) 导向编辑页面。

### 上传文件至 github 仓库 (推荐)

推荐通过 pull requests 的方法来增加或修改 [wiki 网站]({{ site.baseurl }}) 上的 wiki。

#### 1. Fork wiki 文档所在仓库

先 fork <{{ site.repo }}> ，然后进入 fork 成功后的仓库。

![Screen Shot 2019-11-09 at 02.07.35](https://tva1.sinaimg.cn/large/006y8mN6gy1g8r6kit9pej311t0kxad7.jpg)

#### 2. 创建新文件或上传本地文件

![Screen Shot 2019-11-09 at 02.16.32](https://tva1.sinaimg.cn/large/006y8mN6gy1g8r6wiwgauj311t0kwjue.jpg)

推荐在本地用 typora 等编辑器写好 markdown 后直接上传文件，文件请上传至 [_wiki]({{ site.repo }}/tree/master/_wiki) 目录 (master 分支)。也可以修改 fork 的仓库的 _wiki 下的文件，然后再提交 PR。

#### 3. 提交 PR

![Screen Shot 2019-11-09 at 02.31.25](https://tva1.sinaimg.cn/large/006y8mN6gy1g8r757esxtj311t0kwad2.jpg)

### 由 wiki 网站导向编辑页面*

> :warning: 仅推荐 [{{ site.github_user }} 仓库的成员](https://github.com/orgs/{{ site.github_user }}/people) 通过这种方式编辑 wiki。  

鼠标放在标题右侧的省略号上会显示出编辑页面以及提交问题的选项，点击 `Edit this page` 可进入相应的 github 仓库中的文件编辑页面。当然，推荐任何人使用 `Ask a Question` 。

## 如何预览 wiki

预览 wiki 也有两种方案：1. 使用 typora 实时渲染；2. 在本地启动 jekyll 服务。

### 通过 typora (推荐)

使用 [typora](https://www.typora.io/ "轻量化md编辑工具") 编辑器可以很方便地实时渲染 markdown 文件。如果不使用本 wiki 中标注有 `*` 的 [wiki 扩展语法](#按钮) ，则可以大体上认为 typora 所渲染出的文档与直接查看 [wiki 网站]({{ site.baseurl }}) 的文档相差无几，基本仅存在显示风格上的差异。但要注意需更改 typora 的一些设置（见后文），避免和 wiki 所使用的 markdown 扩展功能发生冲突。

#### 修改 markdown 拓展语法设置

需要关闭上下标、高亮以及图表的功能。

![Screen Shot 2019-11-08 at 21.21.10](https://tva1.sinaimg.cn/large/006y8mN6ly1g8qy66mfwgj30im0dcjt0.jpg)

#### 修改数学公式设置

需要关闭数学公式自动添加序号的功能。

![Screen Shot 2019-11-08 at 21.23.00](https://tva1.sinaimg.cn/large/006y8mN6ly1g8qy7qdjgmj30im0dcgn2.jpg)

#### 修改图像设置

需要把默认的无特殊操作改为通过 iPic 上传图片，不过在这之前需要 [下载 iPic](https://apps.apple.com/cn/app/ipic-markdown-图床-文件上传工具/id1101244278?mt=12) 。推荐在 iPic 偏好设置中开启压缩上传图片的选项，这样可以使 wiki 网页加载的速度更快。

![image-20210602152924699](https://cdn.jsdelivr.net/gh/xjf729/FigureBed@master/Imgs/image-20210602152924699.png)

### 通过 jekyll 服务*

#### 1. 下载网站源码至本地

```bash
git clone https://github.com/{{ site.github_user }}/{{ site.github_repo }}.git
cd {{ site.github_repo }}
```

#### 2. 用 Ruby Gem 安装 jekyll

可参考 [jekyll 官方安装指南](https://jekyllrb.com/docs/installation/)

#### 3. 安装 jekyll 模版与插件

```bash
bundle install --path vendor/bundle
```

> 若安装很慢，则可以先配置一个国内镜像 <br>`bundle config mirror.https://rubygems.org https://gems.ruby-china.com`

#### 4. 启动 jekyll 服务

```bash
bundle exec jekyll serve
```

#### 5. 编辑 wiki

把要预览的 wiki 移到 `{{ site.github_repo }}/_wiki/` 目录下，或是直接编辑 `_wiki` 目录下的 markdown 文件。

#### 6. 预览 wiki

等待片刻，打开浏览器访问 <http://127.0.0.1:4000> 。

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

#### 添加优先级

用 `priority` 指定文章排列的顺序，本条可加可不加，如果缺少这个值，文章会默认按照标题名排列在最后。`priority` 的值越小，排列得越前面，值一样时按默认顺序排列。

```yaml
---
title: getting-started
authors: one author
priority: 1.1
---
```

> 建议 `priority` 的值设成类似小数的形式，整数部分可以表示一系列你想排列在一起的 wiki，小数部分表示系列文章内部的排列顺序。

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

```html
<button class="btn btn-success">.btn-success</button>
```

改变对应的 `btn-success` class，就能改变按钮相应的颜色

<button class="btn btn-success">.btn-success</button>
<button class="btn btn-info">.btn-info</button>
<button class="btn btn-secondary">.btn-secondary</button>
<button class="btn btn-primary">.btn-primary</button>
<button class="btn btn-danger">.btn-danger</button>
<button class="btn btn-warning">.btn-warning</button>

#### 提示*

```
{%raw%}{% include alert.html type="tldr" title="tldr" content="TLDR means too long, didn't read" %}{%endraw%}
```

> <code>content</code> 中请使用纯文本，不建议在其中使用 <code>markdown</code> 的标记。

改变 `type` 就能使用不同的提示类型

{% include alert.html type="tldr" content="TLDR means too long, didn't read" %}
{% include alert.html type="tip" content="This is a tip." %}
{% include alert.html type="info" content="This is a piece of information, or you can use todo." %}
{% include alert.html type="question" content="This is a question." %}
{% include alert.html type="warning" content="This is a warning" %}
{% include alert.html type="danger" content="This alerts danger!" %}
{% include alert.html type="success" content="This alerts success" %}

#### 测验*

在 `_data/quizzes` 中添加有关测验的 `yaml` 格式文件 (`example-quiz` 是一个简单的例子)，然后在 wiki 中用如下方式引入：

```
{%raw%}{% include quiz.html file='example-quiz' %}{%endraw%}
```

{% include quiz.html file='example-quiz' %}

## 在 wiki 中使用变量

本网站利用 jekyll 搭建，因此可以无缝使用 [jekyll](https://jekyllrb.com/docs/variables/) 中的变量。在下文的情形中推荐使用变量，使用变量可以让 wiki 的迁移和更新更加便利。

### 引用本网站的其他 wiki

使用

```
{% raw %}{{ site.baseurl }}/wiki/name-of-wiki{% endraw %}
```

即可在 wiki 中引用本网站的其他 wiki 。只需将 `name-of-wiki` 改成想要引用的 wiki 文件名，若不清楚文件名是什么，也可点开相应的 wiki，在搜索栏中可找到对应的名称。

比如，要想引用 `如何使用 wiki` 这篇 wiki，则只需把 `name-of-wiki` 换成 `howtodo` 。

![Screen Shot 2019-12-02 at 11.30.03](https://tva1.sinaimg.cn/large/006tNbRwgy1g9i81zy06ij313z071wft.jpg)

> :warning: `name-of-wiki` 为对应 wiki 的文件名，而不是标题名；`name-of-wiki` 不要包含 `.md` 后缀

### 使用自定义的变量

在 [YAML Front Matter](#yaml-front-matter) 中可添加自定义变量，变量名称可随意取，然后通过 `{% raw %}{{ page.yourvariable }}{% endraw %}` 来引用。

比如可通过 `{% raw %}{{ page.priority }}{% endraw %}` 来引用 `priority` 变量，其显示为 {{ page.priority }} 。

## 参考资料*

要了解更多预设的变量，可参考 [jekyll](https://jekyllrb.com/docs/variables/#page-variables) 的变量部分。

要实现更多复杂的功能，比如条件语句，循环语句，过滤器等功能，可参考 [liquid](https://shopify.github.io/liquid/) 语法。

当然，想要快速获得支持，也可以联系作者或者 [Open an issue]({{ site.repo }}/issues) 。
