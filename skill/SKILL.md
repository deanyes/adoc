---
name: adoc
description: |
  用 ADoc 为 GitHub 项目创建使用文档。一条命令完成全部流程。
  触发场景：
  - "给 xxx 项目建文档"
  - "用 ADoc 创建使用文档"
  - "帮我写产品文档"
---

# ADoc - 一键创建文档

## 前提

```bash
gh auth status  # 确保已登录
```

## 使用（一条命令）

```bash
npx github:deanyes/create-adoc <仓库名> --name "站点标题" --deploy
```

**示例：**

```bash
npx github:deanyes/create-adoc my-docs --name "我的文档" --deploy
```

**输出：**

```
✅ 文档创建完成！

📖 文档地址: https://xxx.github.io/my-docs/
📁 仓库地址: https://github.com/xxx/my-docs
```

## 就这一条命令，完成：

1. 从 Tome 模板创建仓库
2. 配置站点名称
3. 安装依赖、构建
4. 部署到 GitHub Pages
5. 返回文档地址

## 后续编辑

```bash
cd my-docs
# 编辑 pages/ 下的 .md 文件
npm run build && npx gh-pages -d out
```
