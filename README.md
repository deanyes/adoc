# ADoc

> Agent-first documentation tool. Let AI agents create and maintain docs.

## Why ADoc?

Traditional docs workflow:
```
Human writes → Human formats → Human uploads images → Human publishes
```

ADoc workflow:
```
Human provides info → Agent handles everything → Docs published
```

## Features

- 🤖 **Agent-friendly** - MCP Server + CLI for any AI agent
- 📥 **Multi-source import** - Feishu, Notion, Markdown...
- 🎨 **Auto formatting** - AI-optimized structure and metadata
- 🚀 **One-click deploy** - GitHub Pages, Vercel, custom

## Quick Start

```bash
# Install
npm install -g adoc

# Import from Feishu
adoc import feishu <space_id>

# Build static site
adoc build

# Deploy
adoc deploy github-pages
```

## For AI Agents

ADoc exposes MCP tools:
- `adoc.import.feishu(url)` - Import from Feishu
- `adoc.build()` - Build static site
- `adoc.deploy(target)` - Deploy to hosting

## License

MIT
