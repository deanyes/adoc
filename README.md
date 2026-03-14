# ADoc

**Agent-first documentation tool.** Let AI agents create, maintain, and publish documentation.

## Install

```bash
npm install -g adoc-agent
```

## Quick Start

```bash
# Initialize a new doc project
adoc init my-docs
cd my-docs

# Import from Feishu
adoc import feishu <space-id>

# Build & preview
adoc build
adoc preview

# Deploy to GitHub Pages
adoc deploy github-pages
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `adoc init [name]` | Initialize new project |
| `adoc create <title>` | Create a document |
| `adoc update <id>` | Update a document |
| `adoc get <id>` | Get document content |
| `adoc list` | List all documents |
| `adoc delete <id>` | Delete a document |
| `adoc search <query>` | Search documents |
| `adoc import feishu <space-id>` | Import from Feishu wiki |
| `adoc sync` | Sync changes from source |
| `adoc build` | Build static site |
| `adoc preview` | Preview locally |
| `adoc deploy [target]` | Deploy (github-pages) |
| `adoc status` | Show project status |

## MCP Server

For Claude Desktop or Cursor, add to your MCP config:

```json
{
  "mcpServers": {
    "adoc": {
      "command": "adoc-mcp",
      "args": []
    }
  }
}
```

## Use Case

```
Human provides info → Agent handles writing, formatting, publishing
```

ADoc is designed for AI agents to maintain documentation autonomously.

## License

MIT
