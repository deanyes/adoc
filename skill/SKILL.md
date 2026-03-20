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

## 前提条件

确保 `gh` CLI 已安装且已登录：

```bash
# 检查是否已登录
gh auth status

# 如果未登录，执行登录
gh auth login
```

## 一键创建文档（直接执行）

收到用户请求后，替换变量并执行以下脚本：

```bash
#!/bin/bash
# === 配置区域（根据用户请求修改）===
OWNER="用户的GitHub用户名"
REPO="项目名-docs"
PROJECT_NAME="项目名称"

# === 以下自动执行，无需修改 ===

# 1. 创建仓库
gh repo create "$REPO" --public --clone || { echo "仓库创建失败"; exit 1; }
cd "$REPO"

# 2. 创建文档结构
mkdir -p docs/{getting-started,features,faq}

# 3. 创建首页
cat > docs/index.md << EOF
---
title: $PROJECT_NAME
---

# $PROJECT_NAME

欢迎使用 $PROJECT_NAME！

## 快速开始

查看 [快速入门指南](getting-started/index.md) 开始使用。

## 功能介绍

了解 [核心功能](features/index.md)。

## 常见问题

遇到问题？查看 [FAQ](faq/index.md)。
EOF

# 4. 创建快速开始页面
cat > docs/getting-started/index.md << EOF
---
title: 快速开始
---

# 快速开始

## 安装

\`\`\`bash
# 安装命令
\`\`\`

## 基本使用

1. 第一步
2. 第二步
3. 第三步
EOF

# 5. 创建功能介绍页面
cat > docs/features/index.md << EOF
---
title: 功能介绍
---

# 功能介绍

## 核心功能

- 功能 1
- 功能 2
- 功能 3
EOF

# 6. 创建 FAQ 页面
cat > docs/faq/index.md << EOF
---
title: 常见问题
---

# 常见问题

## Q: 问题 1？

A: 答案 1

## Q: 问题 2？

A: 答案 2
EOF

# 7. 创建 Jekyll 配置
cat > docs/_config.yml << EOF
title: $PROJECT_NAME 文档
description: $PROJECT_NAME 使用文档
theme: minima
EOF

# 8. 提交推送
git add .
git commit -m "docs: initialize $PROJECT_NAME documentation"
git push -u origin main

# 9. 启用 GitHub Pages
sleep 2
gh api "repos/$OWNER/$REPO/pages" -X POST -f source='{"branch":"main","path":"/docs"}' 2>/dev/null || \
gh api "repos/$OWNER/$REPO/pages" -X PUT -f source='{"branch":"main","path":"/docs"}' 2>/dev/null

# 10. 输出结果
echo ""
echo "✅ 文档创建完成！"
echo ""
echo "📖 文档地址：https://$OWNER.github.io/$REPO/"
echo "✏️ 编辑地址：https://deanyes.github.io/adoc/"
echo ""
echo "注意：GitHub Pages 需要 1-2 分钟生效"
```

## 为现有仓库添加文档

如果用户已有项目仓库，想在里面加文档：

```bash
#!/bin/bash
# === 配置 ===
OWNER="用户的GitHub用户名"
REPO="现有仓库名"
PROJECT_NAME="项目名称"

# === 执行 ===
gh repo clone "$OWNER/$REPO"
cd "$REPO"

mkdir -p docs
cat > docs/index.md << EOF
---
title: $PROJECT_NAME 使用文档
---

# $PROJECT_NAME

使用文档内容...
EOF

git add docs/
git commit -m "docs: add documentation"
git push

gh api "repos/$OWNER/$REPO/pages" -X POST -f source='{"branch":"main","path":"/docs"}' 2>/dev/null || \
gh api "repos/$OWNER/$REPO/pages" -X PUT -f source='{"branch":"main","path":"/docs"}'

echo "✅ 文档地址：https://$OWNER.github.io/$REPO/"
```

## 添加/更新文档页面

```bash
# 添加新页面
cat > docs/new-page.md << 'EOF'
---
title: 新页面标题
---

# 新页面标题

内容...
EOF

git add . && git commit -m "docs: add new page" && git push
```

## 获取用户的 GitHub 用户名

```bash
gh api user --jq '.login'
```

## 输出格式

完成后必须返回：

```
✅ 文档创建完成！

📖 文档地址：https://{owner}.github.io/{repo}/
✏️ 编辑地址：https://deanyes.github.io/adoc/

文档结构：
- docs/index.md - 首页
- docs/getting-started/index.md - 快速开始
- docs/features/index.md - 功能介绍
- docs/faq/index.md - 常见问题

提示：GitHub Pages 需要 1-2 分钟生效，届时即可访问文档地址。
```
