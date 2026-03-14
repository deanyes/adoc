# ADoc

> Agent-first documentation tool. Let AI agents create and maintain docs.

[![npm version](https://badge.fury.io/js/adoc.svg)](https://www.npmjs.com/package/adoc)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why ADoc?

Traditional docs workflow:
```
Human writes → Human formats → Human uploads images → Human publishes
             ↓ (repeat for every update)
```

ADoc workflow:
```
Human provides info → Agent handles everything → Docs published
```

**ADoc is not another static site generator. It's a tool for AI agents to manage documentation.**

## Features

- 🤖 **Agent-first** - CLI + MCP Server for any AI agent
- 📥 **Multi-source import** - Feishu (Notion coming soon)
- 🎨 **Auto formatting** - AI-optimized structure and metadata
- 🚀 **One-click deploy** - GitHub Pages, Vercel

## Installation

```bash
npm install -g adoc
```

## Quick Start

```bash
# Initialize a new project
adoc init my-docs
cd my-docs

# Configure Feishu credentials in adoc.config.json
# Then import from Feishu wiki
adoc import feishu <space-id>

# Build and preview
adoc build
adoc preview

# Deploy to GitHub Pages
adoc deploy github-pages
```

## CLI Commands

```bash
# Project
adoc init [name]              # Initialize project

# Document CRUD
adoc create <title>           # Create document
adoc update <id>              # Update document
adoc get <id>                 # Get document
adoc list                     # List documents
adoc delete <id>              # Delete document
adoc search <query>           # Search documents

# Import
adoc import feishu <space-id> # Import from Feishu

# Build & Deploy
adoc build                    # Build static site
adoc preview                  # Local preview
adoc deploy [target]          # Deploy (github-pages, vercel)
```

## For AI Agents (MCP)

ADoc provides an MCP Server for Claude, Cursor, and other AI tools:

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "adoc": {
      "command": "adoc-mcp",
      "env": {
        "ADOC_PROJECT": "/path/to/your-docs"
      }
    }
  }
}
```

Available MCP tools:
- `adoc_list` - List documents
- `adoc_get` - Get document content
- `adoc_create` - Create document
- `adoc_update` - Update document
- `adoc_delete` - Delete document
- `adoc_search` - Search documents
- `adoc_import_feishu` - Import from Feishu
- `adoc_build` - Build site
- `adoc_deploy` - Deploy site

## Configuration

```json
// adoc.config.json
{
  "name": "my-docs",
  "title": "My Documentation",
  "description": "...",
  "import": {
    "feishu": {
      "appId": "cli_xxx",
      "appSecret": "xxx"
    }
  },
  "deploy": {
    "target": "github-pages",
    "repo": "https://github.com/user/repo.git",
    "base": "/repo/"
  }
}
```

## License

MIT

## Links

- [GitHub](https://github.com/deanyes/adoc)
- [Design Doc](https://github.com/deanyes/adoc/blob/main/docs/DESIGN.md)
