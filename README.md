# My Wiki

This repo is generated from [vsoch/mkdocs-jekyll template](https://github.com/vsoch/mkdocs-jekyll), and can also active as a template.

It adds three main features:

- TOC can highlight when locate a position.
- Preview h1 h2 h3 toc on the right sidebar.
- Preview all your wikis on the left sidebar.

## Usage

### 1. Get the code

You can clone the repository right to where you want to host the wikis:

```bash
git clone https://github.com/chenggroup/chenggroup.github.io.git
cd chenggroup.github.io.git
```

### 2. Customize

To edit configuration values, customize the [_config.yml](https://github.com/xjf729/mywiki/blob/master/_config.yml).
To add wikis, write them into the [_wiki](https://github.com/xjf729/mywiki/tree/master/_wiki) folder. 

### 3. Options

Most of the configuration values in the [_config.yml](https://github.com/xjf729/mywiki/blob/master/_config.yml) are self explanatory,
and for more details, see the [jekyll configuration](https://jekyllrb.com/docs/configuration/)
rendered on the site.

### 4. Serve

Depending on how you installed jekyll:

```bash
jekyll serve
# or
bundle exec jekyll serve
```

Look at [jekyll installation](https://jekyllrb.com/docs/) to get more information.
