# 快速开始

## 安装

```bash
git clone https://github.com/deanyes/adoc.git
cd adoc
npm install && npm run build && npm link
```

验证：
```bash
adoc --version  # 输出 0.1.0
```

## 第一个项目

### 1. 初始化

```bash
adoc init my-docs
cd my-docs
```

生成的目录结构：
```
my-docs/
├── adoc.config.json
└── docs/
    └── public/images/
```

### 2. 创建文档

```bash
adoc create "产品介绍"
```

编辑 `docs/产品介绍.md`：
```markdown
---
id: product-intro
title: 产品介绍
category: guide
---

# 产品介绍

这是我们的产品...
```

### 3. 构建预览

```bash
adoc build    # 生成静态站点
adoc preview  # 本地预览 http://localhost:4173
```

### 4. 部署

```bash
# 配置 GitHub 仓库
# 编辑 adoc.config.json 添加 deploy.repo

adoc deploy github-pages
```

## 从飞书导入

如果你已有飞书知识库，可以一键导入：

```bash
# 1. 配置飞书凭证（在 adoc.config.json）
{
  "import": {
    "feishu": {
      "appId": "cli_xxx",
      "appSecret": "xxx"
    }
  }
}

# 2. 导入
adoc import feishu 7434170131409928194
```

详见 [飞书导入指南](./feishu-import.md)

## 下一步

- [CLI 命令参考](./cli-reference.md)
- [MCP 集成](./mcp-integration.md)
- [部署指南](./deployment.md)
