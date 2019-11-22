---
title: SSH Usage Note
authors: Yongbin Zhuang
---

# SSH Usage Note

*This Note Cannot teach you EveryThing, But you can get more information from command `man ssh_config`*, `man ssh`

## Create key pair for your own use

`ssh` is the command used for logging in remote computer safely. There exist two ways to login by `ssh`

1. use password
2. use key 

The first way is familiar with you, like you did with windows system before. The safer one is the second way, i. e. use key to login.

To use key, you have to generate one! use the command to generate key:

```bash
$ ssh-keygen
```

Follow the instructions (actually, you just need to keep push `enter` button  :eyeglasses: ​​). From default setting, you will obtain `id_rsa` and `id_rsa.pub` file in your `~/.ssh/` directory.`id_rsa` is the private key used to login, please take care of your key! `id_rsa.pub` is the public key which acts as a lock. You should give your `id_rsa.pub` file to cluster administrator.

{% include alert.html type="tip" content="Give Your Public Key to cluster administrator, then you can get the cluster account." %}

## Login to Remote Cluster with Proxy

There are often inconvinences or restricted policies when we use HPC. 
Especially, the HPC has restricted the port or IP address when we try to connect by SSH. To login HPC when you outside the office, you have to login your office computer remotely, then login the HPC. There has configuration you can set to simplify this process.

Let me explain some terminology:

- `proxy`: the proxy is the office computer you use to login HPC. Because HPC restricts the reachable IP.
- `key`: A file used to connect the HPC.
- `port`: another restriction on connection to HPC 

Let's set a scenario:
Now you are not in the office, but you can only connect to you office computer by the computer we said `proxy` at hand. And through `A`, you login the HPC we said `cluster51`. At normal, you will do the following thing:

```bash
$ ssh username@proxy
$ ssh -p port_number -i key_file username@cluster51
```

Can we simplify it? Of course! Open you ssh config file at `~/.ssh/config`: just paste the following code

```bash
Host proxy #nickname you set for your office computer
         User robinzhuang #username you set for login
         Hostname 10.24.3.xxx #IP address of your office computer, change the xxx to real one!
 
Host chenglab51 #nickname for your cluster
         User ch1_101 #username you set, change to real one!
         Hostname 121.192.191.xx #IP for cluster, replace XX!
         AddKeysToAgent yes
         IdentityFile ~/.ssh/id_rsa # the key file location used in login 
         Port xx # specify the port number, replace xx with real port !
         ProxyCommand ssh chenglab nc %h %p
```

Then use the computer at hand, directly type:

```bash
$ ssh chenglab51
```

Now you can directly connect to the HPC!

This configuration can also apply to your `scp` command, you can directly transfer file with proxy computer:

```bash
$ scp chenglab51:remote_file local_directory_path
```





## Trouble Shooting

### ssh private key are too open

The error message is 

```bash
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@ WARNING: UNPROTECTED PRIVATE KEY FILE! @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
Permissions 0644 for '/home/me/.ssh/id_rsa_targethost' are too open.
It is recommended that your private key files are NOT accessible by others.
This private key will be ignored.
bad permissions: ignore key: /home/me/.ssh/id_rsa_targethost
```

This arises from the permission of your private key:`id_rsa` file.

Use command `ls -l` to see your `id_rsa` permission. if it is not `-rw-------`, you should change it to that! Use the following command: 

```bash
$ chmod 600 ~/.ssh/id_rsa
```

