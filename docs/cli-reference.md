# CLI 命令参考

ADoc 的所有命令行命令。

## 项目管理

### `adoc init [name]`
初始化新项目。

```bash
adoc init my-docs
cd my-docs
```

### `adoc status`
显示项目状态。

```bash
adoc status
```

## 文档操作

### `adoc create <title>`
创建新文档。

```bash
# 基本用法
adoc create "快速开始"

# 带内容
adoc create "API文档" --content "# API\n\n## 接口列表"

# 从管道输入
echo "这是内容" | adoc create "新文档" --stdin

# 从文件
adoc create "导入文档" --file ./source.md

# 指定分类
adoc create "教程" --category guide
```

### `adoc update <id>`
更新文档。

```bash
# 替换内容
adoc update my-doc --content "新内容"

# 追加内容
adoc update my-doc --append "\n\n## 新章节"

# 从管道
echo "管道内容" | adoc update my-doc --stdin

# 从文件
adoc update my-doc --file ./updated.md
```

### `adoc get <id>`
获取文档内容。

```bash
adoc get my-doc
adoc get path/to/doc
```

### `adoc list`
列出所有文档。

```bash
# 基本列表
adoc list

# 树形视图
adoc list --tree

# JSON 格式
adoc list --json

# 按分类筛选
adoc list --category guide

# 包含 .vitepress 目录
adoc list --all
```

### `adoc delete <id>`
删除文档。

```bash
adoc delete my-doc
```

### `adoc search <query>`
搜索文档。

```bash
adoc search "关键词"
adoc search "语音录音"
```

### `adoc index`
重建文档索引。

```bash
adoc index
```

## 导入同步

### `adoc import feishu <space-id>`
从飞书知识库导入。

```bash
# 需要先配置 adoc.config.json
adoc import feishu 7434170131409928194
```

### `adoc sync`
同步飞书更新。

```bash
adoc sync
```

## 构建部署

### `adoc build`
构建静态站点。

```bash
adoc build
```

### `adoc preview`
本地预览。

```bash
adoc preview
adoc preview --port=3000
```

### `adoc deploy [target]`
部署到托管平台。

```bash
# GitHub Pages（默认）
adoc deploy

# 指定仓库
adoc deploy github-pages https://github.com/user/repo.git

# Vercel
adoc deploy vercel
```

## 其他

### `adoc --version` / `adoc -v`
显示版本。

### `adoc --help` / `adoc help`
显示帮助。
