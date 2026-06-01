# Render 上线部署说明

目标：让任何手机或电脑都能通过公网地址访问这个 H5。

## 1. 准备 GitHub 仓库

1. 登录 GitHub。
2. 新建一个仓库，例如 `family-phd-navigator`。
3. 把本项目上传到仓库。

如果你熟悉终端，可以在项目目录执行：

```bash
git init
git add .
git commit -m "Initial family phd navigator"
git branch -M main
git remote add origin 你的GitHub仓库地址
git push -u origin main
```

## 2. 在 Render 创建服务

1. 打开 https://render.com/
2. 注册或登录。
3. 点击 New。
4. 选择 Blueprint。
5. 连接刚才的 GitHub 仓库。
6. Render 会自动读取项目根目录的 `render.yaml`。
7. 确认创建。

## 3. Render 会自动执行

构建命令：

```bash
npm run render-build
```

启动命令：

```bash
npm start
```

部署完成后，Render 会给你一个公网地址，例如：

```text
https://family-phd-navigator.onrender.com
```

任何手机或电脑都可以打开这个地址使用。

## 4. 免费版 SQLite 说明

当前 `render.yaml` 是免费部署版：

```text
DATABASE_PATH=server/db/navigator.sqlite
```

这可以免费跑起来，但后台改过的数据不适合长期保存。服务重启、重新部署后，数据可能恢复到初始内置数据。

如果以后要稳定保存后台数据，可以把 `render-paid-with-disk.yaml` 的内容复制到 `render.yaml`，再升级 Render 付费服务。付费版会把数据库保存到：

```text
/var/data/navigator.sqlite
```

## 5. 绑定自己的域名

如果你买了域名，可以在 Render 服务里进入 Settings -> Custom Domains，添加域名，例如：

```text
phd.yourdomain.com
```

然后按 Render 给出的 DNS 记录去域名服务商后台配置。

## 6. 上线后的维护方式

打开公网地址，点击底部「后台」，即可维护：

- 国家政策管理
- 学校管理
- 导师管理
- 预算数据管理
- 申请材料管理
- 流程步骤管理
- 官方链接和更新时间

## 7. 重要提醒

当前后台没有登录密码，公网部署后任何知道地址的人都可以进入后台修改数据。正式给别人使用前，建议先加一个简单管理员密码。
