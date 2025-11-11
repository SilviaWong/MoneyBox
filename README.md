# MoneyBox

一个基于 Next.js、Prisma 和 SQLite 的简洁个人记账应用。支持添加、查看、删除收支记录，并提供图表与深浅色主题切换。

## 开发

1. 安装依赖：
   ```bash
   npm install
   ```
2. 初始化数据库（会生成 `prisma/dev.db` 并应用最新结构）：
   ```bash
   npx prisma migrate dev --name init
   ```
3. 启动开发服务器：
   ```bash
   npm run dev
   ```
4. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)。

## 脚本

- `npm run dev`：启动 Next.js 开发服务器。
- `npm run build`：构建生产版本。
- `npm run start`：以生产模式启动。
- `npm run lint`：运行 ESLint。
- `npm run prisma:migrate`：交互式执行 Prisma 迁移。
- `npm run prisma:generate`：重新生成 Prisma Client。

## 技术栈

- Next.js 14（App Router）
- Prisma ORM + SQLite
- Tailwind CSS + Framer Motion 动效
- next-themes 深浅色切换
- Chart.js + react-chartjs-2 类别支出柱状图
