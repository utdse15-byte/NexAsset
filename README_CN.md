# NexAsset

企业级 IT 资产管理系统，用于追踪和管理硬件、软件资产的全生命周期。

![React](https://img.shields.io/badge/React-19-blue) ![Vite](https://img.shields.io/badge/Vite-6-brightgreen) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![License](https://img.shields.io/badge/License-MIT-yellow)

## 功能

### 资产管理
- 资产清单：支持筛选、搜索、借出/归还、维护、报废等操作
- 资产录入：录入新资产信息，支持图片上传
- 耗材管理：库存追踪，支持低库存预警
- 采购管理：从申请、审批到收货的完整流程
- 资产分析：生命周期、折旧、部门使用情况等数据分析

### 系统管理
- 用户管理与角色分配
- 部门管理
- RBAC 权限控制（页面级 + 按钮级）

### 其他
- 仪表盘工作台
- 审计日志
- 中英文切换
- 深色模式

## 技术栈

| 类型 | 技术 |
|------|------|
| 框架 | React 19 |
| 构建工具 | Vite 6 |
| 语言 | TypeScript 5 |
| 组件库 | Ant Design 5 |
| 样式 | Tailwind CSS 4 |
| 状态管理 | Zustand |
| 数据请求 | Axios + React Query |
| 路由 | React Router 7 |
| 图表 | ApexCharts |
| 动画 | Framer Motion |
| 代码规范 | Biome |

## 快速开始

环境要求：
- Node.js >= 20.0.0
- pnpm >= 10.0.0

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建
pnpm build

# 预览构建结果
pnpm preview
```

开发服务器默认运行在 http://localhost:3001

## 项目结构
本项目基于slash-admin by d3george 二次开发
```
src/
├── api/          # API 请求
├── assets/       # 静态资源
├── components/   # 公共组件
├── layouts/      # 布局组件
├── locales/      # 国际化
├── pages/        # 页面
├── routes/       # 路由配置
├── store/        # 状态管理
├── theme/        # 主题配置
├── types/        # 类型定义
├── utils/        # 工具函数
└── _mock/        # Mock 数据
```

## 配置

- 全局配置：`src/global-config.ts`
- 环境变量：`.env`
- 主题：`src/theme/`

## License

MIT
