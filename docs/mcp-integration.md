# MCP Server 集成

ADoc 提供 MCP (Model Context Protocol) Server，让 AI 直接操作文档。

## 什么是 MCP？

MCP 是 Anthropic 推出的协议，让 AI 应用能够调用外部工具。

通过 ADoc MCP Server，Claude/Cursor 可以：
- 创建、更新、删除文档
- 搜索文档内容
- 构建和部署站点

## 配置

### Claude Desktop

编辑配置文件：

macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "adoc": {
      "command": "adoc-mcp",
      "cwd": "/path/to/your/docs/project"
    }
  }
}
```

重启 Claude Desktop 生效。

### Cursor

在设置 → MCP 中添加：

```json
{
  "command": "adoc-mcp",
  "cwd": "/path/to/your/docs/project"
}
```

## 可用工具

| 工具 | 说明 | 参数 |
|------|------|------|
| `adoc_list` | 列出所有文档 | `category?` |
| `adoc_get` | 获取文档内容 | `id` |
| `adoc_create` | 创建文档 | `title`, `content?`, `category?` |
| `adoc_update` | 更新文档 | `id`, `content` |
| `adoc_delete` | 删除文档 | `id` |
| `adoc_search` | 搜索文档 | `query` |
| `adoc_build` | 构建站点 | - |
| `adoc_deploy` | 部署 | `target?` |

## 使用示例

配置完成后，在 Claude 中直接说：

> "帮我创建一篇关于 API 认证的文档"

Claude 会调用 `adoc_create` 工具。

> "更新快速开始文档，添加视频教程链接"

Claude 会调用 `adoc_get` 获取内容，然后 `adoc_update` 更新。

> "部署最新的文档到线上"

Claude 会调用 `adoc_build` 然后 `adoc_deploy`。

## 工作流示例

```
用户: 我们新增了一个导出 PDF 的功能，帮我更新文档

Claude: 好的，我来更新文档。
        [调用 adoc_get id="features"]
        [调用 adoc_update id="features" content="...新增 PDF 导出..."]
        [调用 adoc_build]
        [调用 adoc_deploy]
        
        文档已更新并部署 ✅
        预览: https://your-docs.github.io/
```

## 调试

查看 MCP Server 日志：

```bash
# 直接运行查看输出
adoc-mcp
```

检查是否正常响应 MCP 协议。
