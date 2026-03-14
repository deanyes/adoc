# ADoc

**Agent-first Documentation Tool** — 让 AI Agent 来创建、维护、发布文档

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 为什么需要 ADoc？

### 痛点

| 传统文档维护 | 问题 |
|-------------|------|
| 人工编写 | 耗时耗力，写完就过时 |
| 手动同步 | 飞书写一遍、官网写一遍、Help Center 再写一遍 |
| 格式混乱 | 每个人风格不同，排版不统一 |
| 图片管理 | 截图、上传、替换链接，繁琐 |
| 更新滞后 | 产品迭代快，文档永远跟不上 |

### ADoc 的解决方案

```
人类提供信息 → AI Agent 编写文档 → 自动构建发布
```

**核心理念**：文档应该由 AI 来维护，人类只需要提供信息。

---

## 产品介绍

ADoc 是一个专为 AI Agent 设计的文档管理工具：

- **导入**：从飞书知识库一键导入，自动下载图片
- **管理**：创建、更新、搜索文档，结构化存储
- **构建**：生成静态站点（VitePress）
- **部署**：一键部署到 GitHub Pages
- **协作**：MCP Server 让 Claude/Cursor 直接操作

---

## 使用场景

### 场景一：产品文档维护

```
产品经理：@文档助手 我们新增了一个语音转文字功能
文档助手：好的，我来更新文档
          → adoc update voice-to-text
          → adoc build
          → adoc deploy
文档助手：文档已更新并发布 ✅
```

### 场景二：从飞书迁移文档

```bash
# 配置飞书凭证
adoc init my-docs
# 编辑 adoc.config.json 填入 appId 和 appSecret

# 一键导入整个知识空间
adoc import feishu 7434170131409928194

# 构建并部署
adoc build
adoc deploy github-pages
```

### 场景三：AI Agent 自主维护

通过 MCP Server，让 Claude/Cursor 直接操作文档：

```json
{
  "mcpServers": {
    "adoc": { "command": "adoc-mcp" }
  }
}
```

然后直接说："帮我创建一篇关于 API 使用的文档"

---

## 安装

```bash
# 克隆并安装
git clone https://github.com/deanyes/adoc.git
cd adoc
npm install && npm run build && npm link
```

验证安装：
```bash
adoc --version
```

---

## 快速开始

### 1. 初始化项目

```bash
adoc init my-docs
cd my-docs
```

### 2. 配置飞书（可选）

编辑 `adoc.config.json`：

```json
{
  "import": {
    "feishu": {
      "appId": "your-app-id",
      "appSecret": "your-app-secret"
    }
  }
}
```

### 3. 导入文档

```bash
# 从飞书导入
adoc import feishu <space-id>

# 或手动创建
adoc create "我的第一篇文档"
```

### 4. 构建预览

```bash
adoc build
adoc preview
```

### 5. 部署

```bash
adoc deploy github-pages
```

---

## CLI 命令

| 命令 | 说明 |
|------|------|
| `adoc init [name]` | 初始化项目 |
| `adoc status` | 查看项目状态 |
| `adoc create <title>` | 创建文档 |
| `adoc update <id>` | 更新文档 |
| `adoc get <id>` | 获取文档内容 |
| `adoc list` | 列出所有文档 |
| `adoc delete <id>` | 删除文档 |
| `adoc search <query>` | 搜索文档 |
| `adoc index` | 重建索引 |
| `adoc list --tree` | 树形显示 |
| `adoc import feishu <id>` | 从飞书导入 |
| `adoc sync` | 同步更新 |
| `adoc build` | 构建静态站点 |
| `adoc preview` | 本地预览 |
| `adoc deploy [target]` | 部署 |

---

## 技术架构

```
┌─────────────────────────────────────────────┐
│                  ADoc CLI                    │
├─────────────────────────────────────────────┤
│  Import    │  Manage   │  Build   │  Deploy │
│  ────────  │  ───────  │  ─────   │  ────── │
│  Feishu    │  CRUD     │VitePress │  GitHub │
│  Notion*   │  Search   │          │  Vercel*│
└─────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
   ┌──────────┐        ┌──────────────┐
   │ MCP      │        │ Static Site  │
   │ Server   │        │ (HTML/CSS/JS)│
   └──────────┘        └──────────────┘
         │
         ▼
   Claude / Cursor / 其他 AI
```

*计划中

---

## 数据格式

### 文档结构

```
my-docs/
├── adoc.config.json    # 配置文件
├── adoc.lock.json      # 文档索引
└── docs/
    ├── index.md
    ├── getting-started.md
    └── images/
        └── screenshot.png
```

### 文档 Frontmatter

```yaml
---
id: getting-started
title: 快速开始
category: guide
tags: [入门, 教程]
createdAt: 2026-03-14
updatedAt: 2026-03-14
---
```

---

## MCP 集成

### 配置

Claude Desktop (`~/Library/Application Support/Claude/claude_desktop_config.json`)：

```json
{
  "mcpServers": {
    "adoc": {
      "command": "adoc-mcp"
    }
  }
}
```

### 可用工具

| 工具 | 说明 |
|------|------|
| `adoc_list` | 列出文档 |
| `adoc_get` | 获取内容 |
| `adoc_create` | 创建文档 |
| `adoc_update` | 更新文档 |
| `adoc_delete` | 删除文档 |
| `adoc_search` | 搜索 |
| `adoc_build` | 构建 |
| `adoc_deploy` | 部署 |

---

## 路线图

- [x] CLI 核心功能
- [x] 飞书导入
- [x] VitePress 构建
- [x] GitHub Pages 部署
- [x] MCP Server
- [ ] Notion 导入
- [ ] Vercel 部署
- [ ] 多语言支持
- [ ] 版本管理
- [ ] npm 发布

---

## 贡献

欢迎提 Issue 和 PR！

## License

MIT © 2026 dean YANG

---

## OpenClaw Skill

ADoc 可以作为 OpenClaw Skill 使用，让任何 Agent 都能维护文档。

### 安装 Skill

```bash
# 复制到 skills 目录
mkdir -p ~/.openclaw/skills/adoc
curl -fsSL https://raw.githubusercontent.com/deanyes/adoc/main/skill/SKILL.md -o ~/.openclaw/skills/adoc/SKILL.md
curl -fsSL https://raw.githubusercontent.com/deanyes/adoc/main/skill/install.sh -o ~/.openclaw/skills/adoc/install.sh
chmod +x ~/.openclaw/skills/adoc/install.sh

# 安装 ADoc CLI
~/.openclaw/skills/adoc/install.sh
```

### 使用

安装后，对任何 OpenClaw Agent 说：

> "帮我维护产品文档"
> "把飞书知识库同步到官网"
> "更新帮助中心，新增了 X 功能"

Agent 会自动使用 ADoc 完成任务。
