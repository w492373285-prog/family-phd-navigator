# 一家三口出国读博全流程规划筛选器

一个手机端 H5 项目，用于根据家庭情况生成国家推荐、博士申请路线、学校/导师筛选、配偶工作路径、孩子读书路径、签证材料清单、时间规划、预算测算和最终行动报告。

## 技术栈

- 前端：Vue 3 + Vite，移动端 H5
- 后台：Node.js + Express
- 数据库：SQLite（better-sqlite3）
- PDF：PDFKit

## 安装命令

```bash
cd work/family-phd-navigator
npm run install:all
```

## 启动命令

```bash
cd work/family-phd-navigator
npm run dev
```

启动后访问：

- H5 前端：http://localhost:5173
- 后台接口：http://localhost:3001/api/health

## 公网部署

项目已加入 Render 部署配置：

- `render.yaml`
- `.nvmrc`
- `npm run render-build`
- SQLite 持久化路径 `DATABASE_PATH`

上线步骤见：

[docs/deploy-render.md](docs/deploy-render.md)

## 项目目录说明

```text
family-phd-navigator
├── client                 # Vue3 H5 前端
│   ├── src
│   │   ├── components     # 通用组件
│   │   ├── pages          # 报告页、后台管理页
│   │   ├── services       # API 请求封装
│   │   └── styles         # 移动端样式
│   └── index.html
├── server                 # Express 后台
│   ├── data/seed.js       # 内置国家、学校、导师、预算、材料、流程数据
│   ├── db/database.js     # SQLite 建表和初始化
│   ├── routes             # CRUD、规划和 PDF 接口
│   └── services           # 推荐评分和报告生成逻辑
└── README.md
```

## 后续如何录入国家和学校数据

1. 启动项目后打开 http://localhost:5173。
2. 点击底部「后台」。
3. 在「国家政策」里维护博士学制、申请要求、奖学金、配偶工作、子女教育、医疗、生活成本、签证难度、毕业工签、移民机会、风险提示、官方链接和更新时间。
4. 在同一页切换「学校」「导师」「预算」「材料」「流程」继续录入。
5. 保存后数据会写入 `server/db/navigator.sqlite`，重新生成规划报告会自动使用最新数据。

## 评分规则

国家总分 100 分：

- 博士申请可行性 20 分
- 博士奖学金机会 15 分
- 配偶工作权限 20 分
- 子女教育友好度 15 分
- 生活成本 10 分
- 移民机会 15 分
- 安全与适应度 5 分

系统会在基础评分上结合家庭预算、配偶工作紧迫度、孩子公立学校偏好和申请人研究产出做少量加减分。

## 注意

政策和签证规则会变化，本系统用于规划和筛选，不替代官方政策核验、学校国际办公室确认或专业移民法律意见。
