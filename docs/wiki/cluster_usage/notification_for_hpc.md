---
title: 计算任务的推送
author: 熊景放
comments: true
---

# 计算任务的推送

## 推送至钉钉

计算节点可访问互联网的服务器，可以设置任务完成后推送到钉钉。效果如下

![image-20200715201517823](https://i.loli.net/2020/07/15/Wphq61LDiOtB5kx.png)

### 申请钉钉机器人

> 申请步骤需要在PC端钉钉操作

首先需要申请一个钉钉机器人，并拿到 `webhook` ，步骤如下：

1. 点击头像-->`机器人管理`

2. 添加 `自定义` 机器人

![image-20200715184517490](https://i.loli.net/2020/07/15/l1ghQP5vJq86FXB.png)

3. 群组选择工作通知，安全设置中添加关键词 Job, info

![image-20200715183755580](https://i.loli.net/2020/07/15/OvCEsWlgdyDSnBP.png)

4. 复制机器人的 `webhook`

### 服务器上设置推送

在服务器提交脚本中加上 `module load notification` ，并在最后加上 `dingtalk_notification WEBHOOK` 即可实现推送至钉钉。示例脚本如下:

```bash
#!/bin/bash
#BSUB -J "test"
#BSUB -o %J.txt
#BSUB -e %J.txt
#BSUB -q large
#BSUB -n 2
#BSUB -W 12:00

module load notification

MPIRUN_COMMAND  # your command to run software

dingtalk_notification https://oapi.dingtalk.com/robot/send?access_token=xxxx  # replace it by your webhook
```

其中 `notification` 的示例如下，请自行编辑`modulefile`文件（可参考[此处](https://zhuanlan.zhihu.com/p/50725572)），并替换 `<YOUR_HPC_NAME>` 与 `<YOUR_IP>` 的值:

```bash
#%Module

set-alias    dingtalk_notification {
    curl $1 \
        -H 'Content-Type: application/json' \
        -d '{
            "msgtype": "markdown",
            "markdown": {
                "title":"Job Info",
                "text": "'"Job Info \\n
\\n
Job $LSB_JOBID is finished in **<YOUR_HPC_NAME>**! \\n
\\n
> Server ip: **<YOUR_IP>** \\n
> \\n
> Job id: **$LSB_JOBID** \\n
> \\n
> Job name: **$LSB_JOBNAME** \\n
> \\n
> Job queue: **$LSB_QUEUE** \\n
> \\n
> Job workdir: **$LS_EXECCWD** \\n"'"
            }
        }'
}
```

