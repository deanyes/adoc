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

```bash
gh auth status  # 确保 GitHub CLI 已登录
```

## 一键创建文档（推荐）

```bash
npx create-adoc <仓库名> --name "站点标题" --deploy
```

**示例：**
```bash
npx create-adoc my-docs --name "我的文档" --deploy
```

**输出：**
```
✅ 文档创建完成！

📖 文档地址: https://xxx.github.io/my-docs/
📁 仓库地址: https://github.com/xxx/my-docs
```

就这一条命令，自动完成：
- 从模板创建仓库
- 配置站点名称
- 安装依赖并构建
- 部署到 GitHub Pages

## 手动流程（备用）

如果 npx 不可用：

```bash
# 1. 从模板创建
gh repo create my-docs --public --clone --template deanyes/adoc-template
cd my-docs

# 2. 修改配置
# 编辑 tome.config.js 中的 name

# 3. 安装构建
npm install
npm run build

# 4. 部署
npx gh-pages -d out
```

## 添加/编辑文档

```bash
# 编辑 pages/ 目录下的 .md 文件
# 重新部署
npm run build && npx gh-pages -d out
```

## 检查部署状态

```bash
curl -sI https://<用户名>.github.io/<仓库名>/ | head -1
# 返回 HTTP/2 200 表示成功
```

## 输出格式

完成后返回：

```
✅ 文档创建完成！

📖 文档地址：https://{用户名}.github.io/{仓库名}/
📁 仓库地址：https://github.com/{用户名}/{仓库名}

文档已部署，1-2分钟后可访问。
```
