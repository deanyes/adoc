# CLI 命令参考

## 项目管理

### `adoc init [name]`
初始化新的 ADoc 项目。

### `adoc status`
显示项目状态（文档数、图片数、配置等）。

## 文档操作

### `adoc create <title>`
创建新文档。

### `adoc update <id>`
更新已有文档。

### `adoc get <id>`
获取文档内容。

### `adoc list`
列出所有文档。

### `adoc delete <id>`
删除文档。

### `adoc search <query>`
搜索文档。

## 导入同步

### `adoc import feishu <space-id>`
从飞书知识空间导入文档。
- 递归获取所有子文档
- 自动下载图片
- 生成 VitePress 配置

### `adoc sync`
检查源文档更新并同步。

## 构建部署

### `adoc build`
构建静态站点（VitePress）。

### `adoc preview`
启动本地预览服务器。

### `adoc deploy [target]`
部署到托管平台。
- `github-pages` - GitHub Pages（默认）
