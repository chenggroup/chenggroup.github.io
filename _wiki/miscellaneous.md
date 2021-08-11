---
Authors: Yongbin Zhuang
priority: 100.1

---

# Miscellaneous

**Put temporary or unclassied content here!**



## Run Process when you logout shell.

Everytime you login the cluster, you want to run some commands while you have to logout the shell. Unfortunately, these commands will stop as soon as you logout. How to keep commands run? The trick here is use command `nohup` and `&`.

 ``` bash
nohup command &
 ```

You just need to prepend `nohup` and append `&` in your commands.Now, you can go back and have a nice sleep.


## Deleting symbolic links

Symbolic links are like windows shortcuts (快捷方式), a type of small file links to a presumably a large file or a complex directory. You have probably seen them if you are using `deepmd`. If you need to delete these links, especailly symbolic links associates with directories, you need to pay special attention. 

Bare with you that *symbolic links are just files, you delete them just like you delete txt files*. Below is a typical training directory of a `dp-gen` run.

```shell
00.train/
├── 000
├── 001
├── 002
├── 003
├── data.init -> /data/rhbi/TiO2-ML/00.cp2k_md
├── data.iters
├── graph.000.pb -> 000/frozen_model.pb
├── graph.001.pb -> 001/frozen_model.pb
├── graph.002.pb -> 002/frozen_model.pb
├── graph.003.pb -> 003/frozen_model.pb
└── jr.json
```

Let's say you want to delet 'graph.000.pb', you simply run

```bash
rm graph.000.pb
```

No drama, the file will be removed successfully. However, if you want to remove 'data.init', you type the following command

```bash
rm data.init/
```

and you will recieve an error massage

```bash
rm: cannot remove ‘data.init/’: Is a directory
```

Remember that **symbolic links are just files**! Since 'data.init' links to a directory, `bash` auto-completion recognizes it as an directory. However, you should delete backslash (think a symlink as a txt file) and get the correct command 

```bash
rm data.init
```

{% include alert.html type="danger" title="danger" content="You SHOULD NOT run 'rm -rf data.iter/*', this will delet all your precious train set data!!!" %}

