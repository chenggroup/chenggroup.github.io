---
title: 如何发布 News
authors: 
  - 熊景放
---

# 如何发布 News (致管理员)

因为迁移新的实现，暂不启用。

服务器的一些信息或是其他零碎的信息可发布在 News 里。

## 上传文件

### 文件的格式

请上传 markdown 格式的文件，当然也支持一些 [markdown 的拓展功能](./howtodo.md#markdown-语法) 。

### 文件的命名

文件以 `YYYY-MM-dd-name.md` 来命名，如 `2019-11-01-welcome.md` 。

> 如果文件前缀的日期是个未来日期，则其不会在 News 页面上显示，不过当到了其日期之后则会自动出现在 News 页面上。

### 设置 News 的摘要

在一级标题之下， `<!--more-->` 之上的内容会被当作摘要。进入 `read more` 之前会显示摘要。

### 设置 News 的分类

在 [YAML Front Matter](howtodo.md#yaml-front-matter) 处添加 `tags` 可更方便地按照某些标签来检索 News，`tags` 示例如下所示：

```yaml
---
tags:
  - HPCreview
  - HPCreport
---
```

## 查看 News

进入 <{{ config.site_url }}/news> 可查看所有 News，<{{ config.site_url }}/archive> 可查看按时间分类的 News。
