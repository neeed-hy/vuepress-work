# git相关的学习记录

## gitea相关

在东软环境配置gitea的邮件服务时，需要添加 SKIP_VERIFY = true , 用来跳过验证，邮件功能才能够正常使用。

## gitlab相关

### 一次完整的部署流程

下面对使用docker进行Gitlab部署，并配置ssh key 连接形式这一过程进行记录。

#### 下载镜像

```bash
docker pull gitlab/gitlab-ce
```

#### docker-compose.yml文件

文件样例：

```yml
gitlab:
  image: 'gitlab/gitlab-ce:latest'
  restart: always
  hostname: 'gitlab.example.com'
  environment:
    GITLAB_OMNIBUS_CONFIG: |
      external_url 'https://gitlab.example.com:8929'
      gitlab_rails['gitlab_shell_ssh_port'] = 2224
  ports:
    - '8929:8929'
    - '2224:22'
  volumes:
    - '/srv/gitlab/config:/etc/gitlab'
    - '/srv/gitlab/logs:/var/log/gitlab'
    - '/srv/gitlab/data:/var/opt/gitlab'
```

docker-compose.yml文件说明：  

* hostname以及external_url请更改为部署服务器的地址。例如：

   ```yml
   hostname: '10.4.130.174'
   environment:
    GITLAB_OMNIBUS_CONFIG: |
      external_url 'https://10.4.130.174:8929'
   ```

* external_url必须是https，否则在登陆时会出现422错误。由于没有证书，初次访问页面时会报警，无视即可。或者进行证书注册。  
* external_url中设置的端口可以任意设置，该端口为实际页面访问端口。
* 如果不对ssh端口进行修改，那么默认会使用22端口。但是由于使用了docker镜像，因此镜像的22端口与宿主机的22端口会产生冲突，ssh只会登陆宿主机，无法登录镜像。因此必须要对22端口进行映射。映射的端口号可以任意设置，但一定要与ports中的一致。  
ports设置值中的单引号不能够省略，这是.yml文件格式对小于60的端口号的要求。  
实际的样例为：

#### 启动

docker-compose 命令需要切换到root用户才能够使用。

```bash
su root
docker-compose up -d
```

启动过程要持续两三分钟。

启动完毕后，访问页面。访问的地址为docker-compose.yml中external_url的地址。  
初次登录会要求用户输入密码。该密码为root用户密码，请仔细保存。  
建议登入系统后每人新建账户进行系统的使用，不要使用root用户。

#### SSH Keys

clone git 仓库有两种方法，一种是https,一种是ssh。https方法每次操作都需要使用密码，而且在没有证书的情况下不可用，因此推荐(必须)使用ssh方式与仓库进行连接。  

##### 生成SSH Key pair

在进行连接前必须首先生成SSH Key pair.  

```bash
ssh-keygen -t rsa -C "xxx@xxx.com" （你的邮箱，也是你在git服务器上的账号）
```

执行完该条命令后会生成两个文件：

```html
id_rsa.pub    (公钥)
id_rsa        (私钥)
```

生成的位置在：

```html
C:\Users\用户名\.ssh       (windows)
~/.ssh                    (linux)
```

##### 与Gitlab连接

在gitlab中搜索ssh，进入个人ssh keys 设置页。  
将公钥使用文本编辑器打开，并将公钥的所有内容粘贴到gitlab中，并添加。

#### clone仓库

在设置完成后，便可以使用ssh方式clone仓库。点击仓库中的clone按钮，复制"Clone with SSH"框中的内容。随后在本地开发机上输入：

```bash
git clone 你仓库的地址
git clone ssh://git@10.4.130.174:2224/y.he/test.git     (样例)
```

第一次连接仓库需要确认连接，需要手动输入"yes"，才能正常连接。  
如果一切正常，恭喜你，你已经成功的clone了仓库！
