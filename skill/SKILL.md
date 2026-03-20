---
name: adoc
description: |
  用 ADoc 为 GitHub 项目创建和维护使用文档。Agent 优先的文档工具。
  触发场景：
  - "给 xxx 项目建文档"
  - "用 ADoc 创建使用文档"
  - "帮我写产品文档"
  - "初始化文档站"
  - 任何涉及为项目创建/维护用户文档的需求
---

# ADoc - Agent 优先的文档工具

基于 Tome 框架，和 Get笔记文档同款样式。

## 前提条件

```bash
gh auth status  # 确保已登录
```

## 一键创建文档

```bash
#!/bin/bash
# === 配置（根据用户需求修改）===
PROJECT_NAME="项目名称"
REPO_NAME="项目名-docs"

# === 自动执行 ===
OWNER=$(gh api user --jq '.login')

# 1. 从模板创建
gh repo create "$REPO_NAME" --public --clone --template deanyes/adoc-template
cd "$REPO_NAME"

# 2. 修改项目名
sed -i '' "s/文档标题/$PROJECT_NAME/g" tome.config.js 2>/dev/null || \
sed -i "s/文档标题/$PROJECT_NAME/g" tome.config.js

# 3. 安装依赖并构建
npm install
npm run build

# 4. 部署到 GitHub Pages（推送 out 目录）
npx gh-pages -d out

# 5. 启用 Pages
gh api "repos/$OWNER/$REPO_NAME/pages" -X POST -f source='{"branch":"gh-pages","path":"/"}' 2>/dev/null || true

echo ""
echo "✅ 文档创建完成！"
echo ""
echo "📖 文档地址：https://$OWNER.github.io/$REPO_NAME/"
echo "📁 仓库地址：https://github.com/$OWNER/$REPO_NAME"
echo ""
echo "编辑文档：修改 pages/ 目录下的 .md 文件"
echo "重新部署：npm run build && npx gh-pages -d out"
```

## 添加新页面

1. 在 `pages/` 目录创建 .md 文件
2. 在 `tome.config.js` 的 navigation 中添加页面路径
3. 重新构建部署

## 文档结构

```
pages/
├── getting-started/
│   ├── index.md
│   └── quickstart.md
├── features/
│   └── index.md
└── faq/
    └── index.md
```

## 输出格式

```
✅ 文档创建完成！

📖 文档地址：https://{owner}.github.io/{repo}/
📁 仓库地址：https://github.com/{owner}/{repo}

编辑文档：修改 pages/ 目录下的 .md 文件
重新部署：npm run build && npx gh-pages -d out
```
