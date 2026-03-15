# ADoc

**Agent 写文档，一键发布，漂亮好用**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

📖 [文档](https://deanyes.github.io/adoc/) | 🤖 [Agent 友好设计](https://deanyes.github.io/adoc/agent-friendly.html)

---

## 为什么选 ADoc？

| | Notion / 飞书 | VitePress | **ADoc** |
|--|--------------|-----------|----------|
| Agent 支持 | 弱 | 无 | **原生** |
| 部署难度 | 要配置 | 要开发 | **一键** |
| 上手门槛 | 中 | 高 | **零** |

**一句话：** Agent 能用命令行完成所有操作，不需要模拟点击或处理复杂认证。

---

## 快速开始

```bash
# 安装
git clone https://github.com/deanyes/adoc.git
cd adoc && npm install && npm run build && npm link

# 创建项目
adoc init my-docs && cd my-docs

# 写文档
adoc create "快速开始" --content "# 快速开始\n\n这是第一篇文档..."

# 预览
adoc preview

# 发布
adoc deploy github-pages
```

---

## Agent 友好设计

### 命令语义清晰
```bash
adoc create "标题" --content "内容"
adoc update <id> --content "新内容"
adoc delete <id>
```

### 支持管道输入
```bash
echo "长内容..." | adoc create "文档" --stdin
cat file.md | adoc update doc-id --stdin --append
```

### 机器可读输出
```bash
adoc list --json
adoc get my-doc --json
```

### MCP 协议接入
```bash
adoc mcp  # 启动 MCP Server
```

### 无交互式操作
所有操作都可以通过参数完成，没有等待输入的提示。

---

## CLI 命令

```bash
# 文档操作
adoc create <title>           # 创建文档
adoc update <id>              # 更新文档
adoc get <id>                 # 获取内容
adoc list [--tree] [--json]   # 列出文档
adoc delete <id>              # 删除文档
adoc search <query>           # 搜索

# 导入同步
adoc import feishu <space-id> # 从飞书导入
adoc sync                     # 同步更新

# 构建部署
adoc build                    # 构建静态站点
adoc preview                  # 本地预览
adoc deploy [github-pages|vercel]  # 部署
```

---

## 使用场景

### 让 Agent 写使用手册

```bash
# Agent 生成文档
adoc create "产品介绍" --content "$(generate_intro)"
adoc create "安装指南" --parent guide --content "..."
adoc create "常见问题" --content "..."

# 预览确认
adoc preview

# 发布上线
adoc deploy github-pages
```

### 从飞书迁移文档

```bash
# 配置飞书凭证（adoc.config.json）
adoc import feishu 7434170131409928194
adoc deploy github-pages
```

### MCP 集成

Claude Desktop 配置：
```json
{
  "mcpServers": {
    "adoc": { "command": "adoc-mcp" }
  }
}
```

然后对 Claude 说："帮我创建一篇 API 文档"

---

## 技术栈

- **渲染**：VitePress（美观、SEO 友好）
- **存储**：Markdown 文件 + JSON 索引
- **部署**：GitHub Pages / Vercel
- **接入**：CLI / MCP / HTTP API*

*开发中

---

## 路线图

- [x] CLI 核心功能
- [x] 飞书导入
- [x] VitePress 构建
- [x] GitHub Pages 部署
- [x] MCP Server
- [x] OpenClaw Skill
- [ ] HTTP API Server
- [ ] Docker 部署
- [ ] npm 发布

---

## License

MIT © 2026 dean YANG
