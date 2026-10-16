# 海峡金成品立体库

智能仓储管理系统移动端（海峡金成品立体库）。

## 技术栈

- **框架**: Umi Max (React)
- **UI**: Ant Design + Pro Components
- **样式**: Tailwind CSS
- **语言**: TypeScript
- **扫码**: html5-qrcode
- **调试**: VConsole

## 快速开始

使用 Node.js 22 或 24，并统一使用 npm 管理依赖；仓库和 CI 使用 `package-lock.json` 锁定版本。

```bash
# 按锁文件安装依赖（也可替换此前由 pnpm 安装的 node_modules）
npm ci

# 启动开发服务器
npm run dev

# 构建生产环境
npm run build
```

## 脚本

| 脚本                 | 说明                       |
| -------------------- | -------------------------- |
| `npm run dev`        | 启动开发服务器（dev 环境） |
| `npm run build`      | 生产环境构建               |
| `npm run build:test` | 测试环境构建               |
| `npm run lint`       | ESLint 代码检查            |
| `npm run format`     | Prettier 代码格式化        |

## 目录结构

```
src/
├── app.tsx                   # 全局入口：初始化状态、布局、请求配置
├── assets/                   # 静态资源
├── components/               # 公共组件
│   ├── barcode-scanner/      # 条码/二维码扫描器
│   └── exception-notification/ # 全局异常轮询弹窗
├── constants/                # 常量
├── hooks/                    # 自定义 Hooks
├── models/                   # 全局数据模型
├── pages/                    # 页面组件
│   ├── login/                # 登录（账号密码 + 二维码登录）
│   ├── warehouse/            # 货仓：货位网格、入库/出库
│   ├── task/                 # 任务：任务列表、拖拽排序、批量操作
│   ├── exception/            # 异常：异常认领、解决、重试
│   └── log/                  # 日志：操作日志查看
├── services/                 # API 服务层（按模块划分）
├── store/                    # 状态管理
└── utils/                    # 工具函数（请求、存储、格式化）
```

## 页面路由

| 路由         | 页面 | 说明                        |
| ------------ | ---- | --------------------------- |
| `/login`     | 登录 | 账号密码及二维码认证        |
| `/warehouse` | 货仓 | 货位网格视图、扫码入库/出库 |
| `/task`      | 任务 | 任务管理，支持拖拽排序      |
| `/exception` | 异常 | 异常认领、解决、重试        |
| `/log`       | 日志 | 操作日志查看                |
