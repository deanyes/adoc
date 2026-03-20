# ADoc

**Agent 优先的文档工具 —— 让 AI 帮你写文档，一键发布**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

🌐 **在线使用**：https://deanyes.github.io/adoc/

---

## 什么是 ADoc？

ADoc 是一个 **Agent 优先** 的文档工具。你只需要告诉你的 AI Agent：

> "给我的项目建一份使用文档"

Agent 就会自动创建、维护文档，并发布到网上供用户访问。

**零服务器、零成本、完全基于 GitHub。**

---

## 三种角色

| 角色 | 做什么 | 怎么用 |
|------|--------|--------|
| 🤖 **Agent** | 创建和维护文档（主力） | 通过 GitHub API 操作 |
| 👤 **维护者** | 查看/编辑文档 | 访问 ADoc 编辑器 |
| 📖 **用户** | 阅读文档 | 访问发布的文档链接 |

---

## 快速开始

### 方式 1：让 Agent 帮你建文档

告诉你的 AI Agent（OpenClaw / ChatGPT / Claude）：

```
"用 ADoc 给 github.com/xxx/my-project 建使用文档"
```

Agent 会自动完成一切，给你返回文档地址。

### 方式 2：手动使用 ADoc 编辑器

1. 打开 https://deanyes.github.io/adoc/
2. 粘贴 GitHub Token（[创建 Token](https://github.com/settings/tokens/new?scopes=repo)）
3. 选择仓库
4. 开始编辑

---

## 特性

- ✅ **Agent 优先**：AI Agent 可以直接操作，不需要模拟点击
- ✅ **零成本**：完全基于 GitHub，免费托管
- ✅ **美观**：Tome 风格的阅读体验
- ✅ **实时预览**：编辑后立即看到效果
- ✅ **开源**：代码完全开放，可自行部署

---

## 架构

```
┌─────────────────────────────────────────────────────────┐
│                       ADoc                              │
│                                                         │
│   ┌─────────────┐    ┌─────────────┐   ┌────────────┐  │
│   │   Agent     │    │   编辑器    │   │  文档站    │  │
│   │  GitHub API │ →  │  ADoc Web   │ → │ GitHub     │  │
│   │             │    │             │   │ Pages      │  │
│   └─────────────┘    └─────────────┘   └────────────┘  │
│         ↑                  ↑                 ↑         │
│      Agent 调用        维护者编辑        用户阅读      │
└─────────────────────────────────────────────────────────┘
```

---

## 技术栈

- **前端**：React 19 + Tailwind CSS + Milkdown 编辑器
- **存储**：GitHub 仓库（Markdown 文件）
- **部署**：GitHub Pages（完全免费）
- **API**：GitHub REST API（通过 @octokit/rest）

---

## 本地开发

```bash
# 克隆仓库
git clone https://github.com/deanyes/adoc.git
cd adoc/web

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建
npm run build
```

---

## 给 OpenClaw 用户

ADoc 提供了 OpenClaw Skill，安装后你的 Agent 就能用：

```bash
# Skill 在 skills/adoc/
# 使用方式：告诉你的 Agent
"给 github.com/xxx/my-project 建文档"
```

---

## 路线图

- [x] GitHub API 集成
- [x] Milkdown 编辑器
- [x] Tome 风格阅读页面
- [x] GitHub Pages 部署
- [x] OpenClaw Skill
- [ ] 实时协作（多人编辑）
- [ ] 评论系统
- [ ] 版本历史
- [ ] 自定义主题

---

## License

MIT © 2026 dean YANG
