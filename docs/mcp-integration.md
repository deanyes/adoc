# MCP Server 集成

ADoc 提供 MCP Server，让 Claude/Cursor 等 AI 直接操作文档。

## 配置

### Claude Desktop

编辑 `~/Library/Application Support/Claude/claude_desktop_config.json`：

```json
{
  "mcpServers": {
    "adoc": {
      "command": "npx",
      "args": ["-y", "adoc-agent", "mcp"]
    }
  }
}
```

### Cursor

在设置中添加 MCP Server 配置。

## 可用工具

| 工具 | 说明 |
|------|------|
| `adoc_list` | 列出所有文档 |
| `adoc_get` | 获取文档内容 |
| `adoc_create` | 创建文档 |
| `adoc_update` | 更新文档 |
| `adoc_delete` | 删除文档 |
| `adoc_search` | 搜索文档 |
| `adoc_build` | 构建站点 |
| `adoc_deploy` | 部署 |

## 使用示例

在 Claude 中直接说：

> "用 adoc 创建一篇关于产品介绍的文档"

Claude 会自动调用 `adoc_create` 工具。
