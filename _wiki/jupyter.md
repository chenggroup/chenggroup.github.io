---
Title: Jupyter Software Guide
Authors: Yongbin Zhuang 
---



# Jupyter Software Guides

## Jupyter Notebook

### Open Jupyter Notebook Remotely

Jupyter notebook can open in your browser on your local computer. But if you want to use Jupyter Notebook in remote computer, this will be involved a little extra efforts. Why do we use Jupyter Notebook remotely? Because you don't want to download data (especially big data) from remote computer. You can directly operate those data in remote computer.

Here is the instruction:

- Open you jupyter notebook in your remote cluster by:

```bash
#this operation is done on the remote computer
#<port number> is customized by yourself, for example 8898
jupyter notebook --no-browser --port=<port number>
```

- In your local computer, type this into your command line:

```bash
# make sure to change `username` to your real username in remote host
# change `your_remote_host_name` to your address of your working station
#<port number> is the same as above port number, for example 8898
ssh -N -f -L localhost:8888:localhost:<port number> username@your_remote_host_name
```

{% include alert.html type="tip" content="Remember to kill your ssh port when you don't want to use it." %}

- Open your browser and type `localhost:8888` into the address. If you encounter the page which requires your to enter `password` or `token`, you can find `token` of your notebook by command:

```bash
#type this command in your remote computer, you can find token to enter remote notebook
jupyter notebook list
```



## Jupyter Lab

Under construction

## Jupyter Hub

Under construction