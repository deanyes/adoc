# Changelog

## [0.2.0] - 2026-03-15

### Added
- `adoc index` - 重建文档索引
- `adoc help` - 帮助命令别名
- `adoc list --tree` - 树形目录显示
- `--stdin` 参数支持管道输入（create/update）
- `[未索引]` 标记显示未在索引中的文档
- OpenClaw Skill 支持

### Fixed
- MCP Server 命令注入漏洞（改用直接函数调用）
- sync/import key 不一致问题
- JSON 解析错误处理
- `list` 现在递归扫描所有子目录

### Changed
- 改进文档结构和用户体验

## [0.1.0] - 2026-03-14

### Added
- 初始版本
- CLI 工具：init, create, update, get, list, delete, search
- 飞书知识库导入
- VitePress 构建
- GitHub Pages 部署
- MCP Server 支持
