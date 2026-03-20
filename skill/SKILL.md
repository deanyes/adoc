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
gh auth status
```

## 一键创建文档（使用 ADoc Tome 模板）

```bash
#!/bin/bash
# === 配置区域（根据用户请求修改）===
PROJECT_NAME="项目名称"      # 例如：My App
REPO_NAME="项目名-docs"      # 例如：my-app-docs

# === 以下自动执行 ===

# 1. 获取用户名
OWNER=$(gh api user --jq '.login')

# 2. 从模板创建仓库
gh repo create "$REPO_NAME" --public --clone --template deanyes/adoc-template
cd "$REPO_NAME"

# 3. 修改配置文件中的项目名
sed -i '' "s/ADoc Template/$PROJECT_NAME/g" docs/.vitepress/config.mts 2>/dev/null || \
sed -i "s/ADoc Template/$PROJECT_NAME/g" docs/.vitepress/config.mts

sed -i '' "s/ADoc Template/$PROJECT_NAME/g" docs/index.md 2>/dev/null || \
sed -i "s/ADoc Template/$PROJECT_NAME/g" docs/index.md

# 4. 提交修改
git add -A
git commit -m "docs: customize for $PROJECT_NAME"
git push

# 5. 启用 GitHub Pages
sleep 2
gh api "repos/$OWNER/$REPO_NAME/pages" -X POST \
  -f build_type="workflow" 2>/dev/null || \
gh api "repos/$OWNER/$REPO_NAME/pages" -X PUT \
  -f build_type="workflow" 2>/dev/null || \
echo "请手动在 Settings > Pages 启用 GitHub Actions 部署"

# 6. 输出结果
echo ""
echo "✅ 文档创建完成！"
echo ""
echo "📖 文档地址：https://$OWNER.github.io/$REPO_NAME/"
echo "📁 仓库地址：https://github.com/$OWNER/$REPO_NAME"
echo ""
echo "下一步："
echo "1. 编辑 docs/ 目录下的 Markdown 文件添加内容"
echo "2. git add . && git commit -m 'docs: update' && git push"
echo "3. GitHub Actions 会自动构建部署"
echo ""
echo "注意：首次部署需要 2-3 分钟"
```

## 添加新页面

```bash
# 在 docs/ 目录下创建 Markdown 文件
cat > docs/new-page.md << 'EOF'
---
title: 新页面
---

# 新页面标题

内容...
EOF

# 如果需要侧边栏显示，编辑 docs/.vitepress/config.mts 添加到 sidebar
```

## 修改主题颜色

编辑 `docs/.vitepress/theme/style.css`，修改 CSS 变量：

```css
:root {
  --vp-c-brand-1: #F59E0B;  /* 主色 */
  --vp-c-brand-2: #D97706;  /* 悬停色 */
}
```

## 文档结构

```
docs/
├── index.md              # 首页
├── getting-started/      # 快速开始
│   └── index.md
├── features/             # 功能介绍
│   └── index.md
└── .vitepress/
    ├── config.mts        # 站点配置
    └── theme/
        ├── index.js      # 主题入口
        └── style.css     # Tome 样式
```

## 输出格式

完成后返回：

```
✅ 文档创建完成！

📖 文档地址：https://{owner}.github.io/{repo}/
📁 仓库地址：https://github.com/{owner}/{repo}

下一步：
1. 编辑 docs/ 目录下的 Markdown 文件添加内容
2. git add . && git commit -m 'docs: update' && git push
3. GitHub Actions 会自动构建部署

注意：首次部署需要 2-3 分钟
```
