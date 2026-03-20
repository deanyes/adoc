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

## Agent 使用指南

Agent 通过 GitHub CLI (`gh`) 或 GitHub API 操作文档。以下是完整流程：

### 1. 创建文档仓库

```bash
# 创建新仓库
gh repo create my-project-docs --public --clone
cd my-project-docs
```

### 2. 初始化文档结构

```bash
# 创建目录
mkdir -p docs/{getting-started,features,faq}

# 创建首页
cat > docs/index.md << 'EOF'
---
title: 产品名称
---

# 欢迎使用产品名称

## 快速开始
[开始使用](getting-started/index.md)

## 功能介绍
[查看功能](features/index.md)

## 常见问题
[查看 FAQ](faq/index.md)
EOF

# 创建快速开始页面
cat > docs/getting-started/index.md << 'EOF'
---
title: 快速开始
---

# 快速开始

## 安装
...

## 配置
...
EOF
```

### 3. 启用 GitHub Pages

```bash
# 提交代码
git add . && git commit -m "docs: initialize" && git push

# 启用 GitHub Pages（使用 docs 目录）
gh api repos/{owner}/{repo}/pages -X POST \
  -f source='{"branch":"main","path":"/docs"}'
```

### 4. 获取文档地址

```bash
# 文档将发布到：
echo "https://{owner}.github.io/{repo}/"
```

### 5. 更新文档

```bash
# 添加新页面
cat > docs/new-page.md << 'EOF'
---
title: 新页面
---

# 新页面内容
EOF

# 提交推送
git add . && git commit -m "docs: add new page" && git push
```

### 完整示例

Agent 收到指令后的完整操作：

```bash
#!/bin/bash
# Agent 为 my-app 项目创建文档

REPO="my-app-docs"
OWNER="username"

# 1. 创建仓库
gh repo create $REPO --public --clone
cd $REPO

# 2. 初始化文档
mkdir -p docs
echo "# My App 使用文档" > docs/index.md
echo "## 快速开始" >> docs/index.md

# 3. 提交
git add . && git commit -m "docs: init" && git push

# 4. 启用 Pages
gh api repos/$OWNER/$REPO/pages -X POST -f source='{"branch":"main","path":"/docs"}'

# 5. 输出结果
echo "✅ 文档地址: https://$OWNER.github.io/$REPO/"
```

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
