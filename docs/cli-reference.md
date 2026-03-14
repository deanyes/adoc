# CLI 命令参考

## 项目管理

### adoc init [name]

初始化新项目。

```bash
adoc init my-docs
```

创建 `adoc.config.json` 和 `docs/` 目录。

### adoc status

显示项目状态。

```bash
adoc status
```

输出：
```
📊 ADoc Project Status

Project: my-docs
Title:   My Documentation

Documents: 15
Images:    42
Built:     2026-03-14 23:00

Configuration:
  Feishu: ✅ Configured
  Deploy: github-pages
```

## 文档操作

### adoc create \<title\>

创建新文档。

```bash
adoc create "API 文档"
```

### adoc update \<id\>

更新文档（打开编辑器）。

```bash
adoc update api-docs
```

### adoc get \<id\>

获取文档内容。

```bash
adoc get api-docs
```

### adoc list

列出所有文档。

```bash
adoc list
```

### adoc delete \<id\>

删除文档。

```bash
adoc delete api-docs
```

### adoc search \<query\>

搜索文档。

```bash
adoc search "API"
```

## 导入同步

### adoc import feishu \<space-id\>

从飞书知识空间导入。

```bash
adoc import feishu 7434170131409928194
```

功能：
- 递归获取所有子文档
- 自动下载图片到本地
- 生成 VitePress 配置
- 保持文档层级结构

### adoc sync

检查并同步源文档更新。

```bash
adoc sync
```

## 构建部署

### adoc build

构建静态站点。

```bash
adoc build
```

使用 VitePress 构建到 `docs/.vitepress/dist/`。

### adoc preview

本地预览。

```bash
adoc preview
adoc preview --port=3000
```

### adoc deploy [target]

部署到托管平台。

```bash
adoc deploy                  # 默认 github-pages
adoc deploy github-pages
adoc deploy vercel           # 计划中
```
