# ADoc

[![npm version](https://badge.fury.io/js/adoc-agent.svg)](https://www.npmjs.com/package/adoc-agent)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Agent-first documentation tool.** Let AI agents create, maintain, and publish documentation.

## Why ADoc?

Traditional docs tools are designed for humans. ADoc is designed for **AI agents**:

- **Structured data model** - Frontmatter + Markdown, easy for agents to parse and generate
- **MCP integration** - Works with Claude, Cursor, and any MCP-compatible AI
- **Import sources** - Feishu, Notion (coming soon), and more
- **One-click deploy** - GitHub Pages out of the box

## Install

```bash
npm install -g adoc-agent
```

## Quick Start

```bash
# Initialize a new doc project
adoc init my-docs
cd my-docs

# Import from Feishu wiki
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
| `adoc build` | Build static site (VitePress) |
| `adoc preview` | Preview locally |
| `adoc deploy [target]` | Deploy (github-pages) |
| `adoc status` | Show project status |

## MCP Server

For Claude Desktop or Cursor, add to your MCP config:

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

Available MCP tools:
- `adoc_list` - List all documents
- `adoc_get` - Get document content
- `adoc_create` - Create new document
- `adoc_update` - Update document
- `adoc_delete` - Delete document
- `adoc_search` - Search documents
- `adoc_build` - Build static site
- `adoc_deploy` - Deploy to hosting

## Workflow

```
Human provides info → ADoc Agent writes → Preview → Deploy
```

No more manual doc maintenance. Just tell your AI what changed.

## License

MIT © 2026 dean YANG
