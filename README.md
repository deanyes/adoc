# ADoc

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Agent-first documentation tool.** Let AI agents create, maintain, and publish documentation.

## Install

```bash
# From GitHub (recommended)
npm install -g github:deanyes/adoc

# Or clone and link
git clone https://github.com/deanyes/adoc.git
cd adoc && npm install && npm link
```

## Quick Start

```bash
adoc init my-docs && cd my-docs
adoc import feishu <space-id>
adoc build && adoc preview
adoc deploy github-pages
```

## Commands

| Command | Description |
|---------|-------------|
| `adoc init` | Initialize project |
| `adoc create <title>` | Create document |
| `adoc list` | List documents |
| `adoc import feishu <id>` | Import from Feishu |
| `adoc build` | Build static site |
| `adoc deploy` | Deploy to GitHub Pages |

## MCP Integration

```json
{
  "mcpServers": {
    "adoc": {
      "command": "adoc-mcp"
    }
  }
}
```

## Docs

- [快速开始](./docs/getting-started.md)
- [CLI 参考](./docs/cli-reference.md)
- [飞书导入](./docs/feishu-import.md)
- [MCP 集成](./docs/mcp-integration.md)
- [部署指南](./docs/deployment.md)

## License

MIT © 2026 dean YANG
