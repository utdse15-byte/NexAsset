<div align="center">
  <h1>NexAsset 🚀</h1>
  <p>An Enterprise-Grade IT Asset Management System (ITAM)</p>
  
  <p>
    <a href="https://nex-asset.vercel.app"><b>Live Demo</b></a> •
    <a href="README_CN.md">中文文档</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/React-19-blue" alt="React">
    <img src="https://img.shields.io/badge/Vite-6-brightgreen" alt="Vite">
    <img src="https://img.shields.io/badge/TypeScript-5-blue" alt="TypeScript">
    <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
  </p>
</div>

## 📌 Introduction

**NexAsset** is a modern, enterprise-ready IT Asset Management (ITAM) system designed to track and manage the entire lifecycle of hardware and software assets within an organization. It provides a robust architecture for inventory tracking, procurement workflows, role-based access control, and comprehensive data analytics.

## ✨ Key Features

- **📊 Smart Dashboard & Analytics**: Visualize asset lifecycle, depreciation, departmental usage, and maintenance statistics.
- **💻 Asset Inventory**: Full lifecycle management including filtering, searching, checkout/return, maintenance, and retirement tracking.
- **📦 Consumables & Purchasing**: Track stock levels with low-stock alerts. Manage end-to-end procurement workflows from request to approval and receiving.
- **🔐 Enterprise Security**: Comprehensive User & Department management with strict Role-Based Access Control (RBAC) at both the page and button levels.
- **🌍 Internationalization (i18n)**: Seamless switching between English and Simplified Chinese setups.
- **🌙 Dark Mode Support**: Beautifully crafted dark mode for low-light environments.
- **🧪 Engineering Excellence**: 
  - Integrated with **React Query** for optimized server-state management and caching.
  - Comprehensive unit test coverage using **Vitest** for core business logic.
  - Automated CI/CD pipelines via **GitHub Actions** for rigorous linting and type checking.
  - Advanced **MSW (Mock Service Worker)** integration for robust offline local development and persistence.

## 🛠️ Technology Stack

| Category | Technology |
|---|---|
| Framework | **React 19** |
| Build Tool | **Vite 6** |
| Language | **TypeScript 5** |
| UI Library | **Ant Design 5** |
| Styling | **Tailwind CSS 4** |
| State Management | **Zustand** |
| Data Fetching | **Axios + @tanstack/react-query** |
| Routing | **React Router 7** |
| Charts | **ApexCharts** |
| Animation | **Framer Motion** |
| Linter & Formatter | **Biome** |
| Testing | **Vitest + Testing Library** |

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20.0.0
- pnpm >= 10.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/NexAsset.git
cd NexAsset

# Install dependencies
pnpm install

# Start the development server
pnpm dev

# Run unit tests
pnpm test
```

The development server will be running at `http://localhost:3001` with MSW intercepting all API requests locally.

## 📂 Project Structure

This project is built upon the excellent foundation of [slash-admin by d3george](https://github.com/d3george/slash-admin).

```text
src/
├── api/          # Axios instances and API service definitions
├── assets/       # Static resources (images, icons)
├── components/   # Reusable UI components
├── hooks/        # Custom React hooks (e.g., useCopyToClipboard)
├── layouts/      # Global layout components
├── locales/      # i18n translation files (en_US, zh_CN)
├── pages/        # Application view components categorized by feature
├── routes/       # React Router 7 configuration
├── store/        # Zustand state stores
├── theme/        # Ant Design & Tailwind theme configurations
├── types/        # TypeScript interfaces and type definitions
├── utils/        # Utility functions and helpers
└── _mock/        # MSW handlers and local persistent mock data
```

## 📝 License

Released under the [MIT License](LICENSE).
