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



