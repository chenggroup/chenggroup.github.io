---
Title: High Performance Cluster(HPC) Topics
Authors: Yongbin Zhuang

---





#High Performance Cluster(HPC) Topics

## Basic Concepts

### CPU/Core

CPU is the acronym of Central Processing Unit. You might have been familiar with this terminology. This object is used to compute numbers, excute your codes and so on. Actually, we prefer the word `core` when we gather a number of CPUs together to form a High Performance Cluster(HPC). `Core` is just a alias for CPU in HPC.

### Memory/内存

The reason I present the chinese word here is to make a connection between what you have learn before and the terminology here, like `Memory`. Memory is the places where data is stored. It is nothing more than your `hard disk` except the speed of message communicating with `core`. The `core` will fetch data directly from `memory` when it works/executes some process. Therefore, if you can put everything in your memory if it is big enough, you will have less time you execute your programs.

###Node/节点

This terminology might be redundant if you hear for the first time. It should be enough to count the number of `cores` in HPC, like we have HPC with 1024 `cores`. However, not all of your `cores` can fetch data from same `memory`. Memory has limited space, and cannot connect directly with inifinite `cores`.  Therefore, we have limited number of `cores` to share with one `memory`, which constitute the thing we call `node`. For instance, in `51cluster`(one of HPC in our group), you can type command `bhosts` to display how many nodes we have. In the screen, you will see 32 nodes with 1 login node. For every `node`, it has *24* `cores` with *64* GB `memory` . Check this for `52cluster`, for your practice.

### Message Passing Interface(MPI)

Now, we have another question. If `cores` cannot fetch data from one memory, can they fetch data between each `node`? The answer is *YES*. There has a technics or program called Message Passing Interface(`MPI`). `MPI` is a process run on your `node` which is same as your normal `code`. What the job of `MPI` is exchange message with different `nodes`, of course, it's slower than from direct`memory` . Take a example, we have computed a value `A` in `node1`. By using `MPI`, the `node2` can get the value `A` from `node1`. What is the usage? When you are doing a parallel computation, you don't have to put the data from `node1` back to your `hard disk` then transfer to your `node2` which is definitely slower.







