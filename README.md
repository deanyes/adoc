# ADoc

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Agent-first documentation tool.** Let AI agents create, maintain, and publish documentation.

## Install

### One-line Install (Recommended)

```bash
curl -fsSL https://raw.githubusercontent.com/deanyes/adoc/main/install.sh | bash
```

### Manual Install

```bash
git clone https://github.com/deanyes/adoc.git
cd adoc
npm install && npm run build && npm link
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

For Claude Desktop / Cursor:

```json
{
  "mcpServers": {
    "adoc": { "command": "adoc-mcp" }
  }
}
```

## Documentation

- [快速开始](./docs/getting-started.md)
- [CLI 参考](./docs/cli-reference.md)
- [飞书导入](./docs/feishu-import.md)
- [MCP 集成](./docs/mcp-integration.md)

## License

MIT © 2026 dean YANG
