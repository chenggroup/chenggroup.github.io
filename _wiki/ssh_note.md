# SSH Usage Note

Author: Yongbin Zhuang

*This Note Cannot teach you EveryThing, But you can get more information from command `man ssh_config`*

## Login to Remote Cluster with Proxy

There are often inconvinences or restricted policies when we use HPC. 
Especially, the HPC has restricted the port or IP address when we try to connect by SSH. To login HPC when you outside the office, you have to login your office computer remotely, then login the HPC. There has configuration you can set to simplify this process.

Let me explain some terminology:

- `proxy`: the proxy is the office computer you use to login HPC. Because HPC restricts the reachable IP.
- `key`: A file used to connect the HPC.
- `port`: another restriction on connection to HPC 

Let's set a scenario:
Now you are not in the office, but you can only connect to you office computer by the computer we said `A` at hand. And through `A`, you login the HPC we said `cluster51`. At normal, you will do the following thing:

```bash
$ ssh username@A
$ ssh -p port_number -i key_file username@cluster51
```

Can we simplify it? Of course! Open you ssh config file at `~/.ssh/config`: just paste the following code

```bash
Host chenglab #nickname you set for your office computer
         User robinzhuang #username you set for login
         Hostname 10.24.3.xxx #IP address of your office computer, change the xxx to real one!
 
Host chenglab51 #nickname for your cluster
         User ch1_101 #username you set, change to real one!
         Hostname 121.192.191.xx #IP for cluster, replace XX!
 #        AddKeysToAgent yes
         IdentityFile ~/.ssh/id_rsa # the key file location used in login 
         Port xx # specify the port number, replace xx with real port !
         ProxyCommand ssh chenglab nc %h %p
```

Then use the computer at hand, directly type:

```bash
$ ssh chenglab51
```

Now you can directly connect to the HPC!

