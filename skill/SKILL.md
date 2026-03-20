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

为 GitHub 项目自动创建漂亮的使用文档，部署到 GitHub Pages。

## 核心流程

```
用户："给 github.com/xxx/my-app 建文档"
    ↓
1. 创建文档仓库（或在现有仓库添加 docs/）
2. 初始化 ADoc 结构
3. 生成文档内容
4. 配置 GitHub Pages
5. 返回访问地址
    ↓
用户得到：https://xxx.github.io/my-app/
```

## 使用方法

### 方式 1：为现有仓库添加文档

```bash
# 1. Clone 项目（如果本地没有）
gh repo clone owner/repo
cd repo

# 2. 创建 docs 目录结构
mkdir -p docs
cat > docs/index.md << 'EOF'
---
title: 首页
---

# 欢迎使用 {项目名}

这是 {项目名} 的使用文档。

## 快速开始

TODO: 添加快速入门指南

## 功能介绍

TODO: 添加功能说明

## 常见问题

TODO: 添加 FAQ
EOF

# 3. 提交并推送
git add docs/
git commit -m "docs: add documentation"
git push

# 4. 启用 GitHub Pages
gh api repos/{owner}/{repo}/pages -X POST -f source='{"branch":"main","path":"/docs"}' 2>/dev/null || \
gh api repos/{owner}/{repo}/pages -X PUT -f source='{"branch":"main","path":"/docs"}'

# 5. 获取文档地址
echo "文档地址: https://{owner}.github.io/{repo}/"
```

### 方式 2：创建独立文档仓库

```bash
# 1. 创建文档仓库
gh repo create {项目名}-docs --public --clone
cd {项目名}-docs

# 2. 初始化 ADoc 结构
mkdir -p docs/{getting-started,features,faq}

# 创建首页
cat > docs/index.md << 'EOF'
---
title: {项目名} 使用文档
---

# {项目名}

欢迎使用 {项目名}！

## 目录

- [快速开始](getting-started/index.md)
- [功能介绍](features/index.md)
- [常见问题](faq/index.md)
EOF

# 创建子页面
cat > docs/getting-started/index.md << 'EOF'
---
title: 快速开始
---

# 快速开始

## 安装

TODO

## 配置

TODO
EOF

# 3. 添加 Jekyll 配置（GitHub Pages 默认支持）
cat > docs/_config.yml << 'EOF'
title: {项目名} 文档
theme: minima
EOF

# 4. 提交推送
git add .
git commit -m "docs: initialize documentation"
git push

# 5. 启用 GitHub Pages
gh api repos/{owner}/{项目名}-docs/pages -X POST -f source='{"branch":"main","path":"/docs"}'

echo "文档地址: https://{owner}.github.io/{项目名}-docs/"
```

## 文档结构约定

```
docs/
├── index.md              # 首页
├── _config.yml           # Jekyll 配置
├── getting-started/      # 快速入门
│   └── index.md
├── features/             # 功能介绍
│   └── index.md
├── faq/                  # 常见问题
│   └── index.md
└── changelog/            # 更新日志
    └── index.md
```

## 文档模板

### Frontmatter 格式

```yaml
---
title: 页面标题
description: 页面描述（可选）
---
```

### Markdown 规范

- 使用 `#` 作为页面主标题（与 frontmatter title 一致）
- 使用 `##` 作为章节标题
- 代码块标注语言：```python, ```bash 等
- 图片放在 `docs/images/` 目录

## 高级功能

### 使用 ADoc 编辑器

如需可视化编辑，访问：https://deanyes.github.io/adoc/

1. 粘贴 GitHub Token（需要 repo 权限）
2. 选择文档仓库
3. 在编辑器中修改
4. 保存自动推送

### 自定义域名

```bash
# 在 docs/ 目录添加 CNAME 文件
echo "docs.example.com" > docs/CNAME
git add docs/CNAME && git commit -m "docs: add custom domain" && git push

# 在域名 DNS 添加 CNAME 记录指向 {owner}.github.io
```

## 输出格式

完成后返回：

```
✅ 文档创建完成！

📖 文档地址：https://{owner}.github.io/{repo}/
✏️ 编辑地址：https://deanyes.github.io/adoc/ （选择仓库 {owner}/{repo}）

文档结构：
- docs/index.md - 首页
- docs/getting-started/ - 快速入门
- docs/features/ - 功能介绍
- docs/faq/ - 常见问题
```
