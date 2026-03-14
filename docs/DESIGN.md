# ADoc 产品设计方案

## 一、产品定位

**ADoc** = Agent-first Documentation

让 AI Agent 来创建、维护、发布文档的工具。

### 解决的问题

| 现状 | ADoc |
|------|------|
| 人写文档 | Agent 写 |
| 手动排版贴图 | 自动处理 |
| 多平台重复维护 | 一次创建，多端同步 |
| 文档只给人看 | 人 + Agent 双读者 |

### 目标用户

1. **有文档需求的产品/团队** — 使用文档、帮助中心、教程
2. **AI 应用开发者** — 希望自己的 Agent 能维护文档
3. **内容创作者** — 课程、教程、知识库

---

## 二、核心功能

```
┌─────────────────────────────────────────────────────────────┐
│                         ADoc                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐  │
│  │  导入   │ →  │  处理   │ →  │  构建   │ →  │  发布   │  │
│  │ Import  │    │ Process │    │  Build  │    │ Deploy  │  │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘  │
│       ↑              ↑              ↑              ↑        │
│   飞书/Notion    AI优化结构     VitePress     GitHub Pages  │
│   Markdown      添加元数据      静态站点       Vercel       │
│   URL/文件      图片处理        主题定制       自定义域名    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.1 导入 (Import)

从多种数据源导入文档：

| 数据源 | 优先级 | 状态 |
|--------|--------|------|
| 飞书文档 | P0 | 开发中 |
| Markdown 文件 | P0 | 待开发 |
| Notion | P1 | 规划中 |
| URL（网页抓取）| P1 | 规划中 |
| 语雀 | P2 | 规划中 |

### 2.2 处理 (Process)

AI 自动优化文档：

- **结构标准化** — 统一标题层级、章节顺序
- **元数据生成** — frontmatter（标题、描述、关键词、分类）
- **图片处理** — 下载、压缩、CDN 上传
- **AI 友好化** — 添加语义标记，便于 Agent 检索理解

### 2.3 构建 (Build)

生成静态站点：

- **VitePress** — 默认主题，简洁美观
- **自定义主题** — 支持品牌定制
- **多格式输出** — HTML、PDF、Markdown

### 2.4 发布 (Deploy)

一键部署到多平台：

| 平台 | 优先级 |
|------|--------|
| GitHub Pages | P0 |
| Vercel | P0 |
| Netlify | P1 |
| 自定义服务器 | P1 |
| Get笔记知识库 | P2 |

---

## 三、技术架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户 / Agent                              │
└───────────────────────────┬─────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   MCP Server  │   │     CLI       │   │   HTTP API    │
│  (Claude等)   │   │  (终端/脚本)   │   │  (Dify/Coze)  │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       ADoc Core                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Importers  │  │  Processors │  │  Builders   │             │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤             │
│  │ - Feishu    │  │ - Markdown  │  │ - VitePress │             │
│  │ - Notion    │  │ - Frontmatter│ │ - Docusaurus│             │
│  │ - Markdown  │  │ - Images    │  │ - PDF       │             │
│  │ - URL       │  │ - AI Enhance│  │             │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐                              │
│  │  Deployers  │  │   Storage   │                              │
│  ├─────────────┤  ├─────────────┤                              │
│  │ - GitHub    │  │ - Local     │                              │
│  │ - Vercel    │  │ - S3/OSS    │                              │
│  │ - Netlify   │  │ - CDN       │                              │
│  │ - GetNote   │  │             │                              │
│  └─────────────┘  └─────────────┘                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.1 目录结构

```
adoc/
├── packages/
│   ├── core/                 # 核心逻辑
│   │   ├── src/
│   │   │   ├── importers/    # 导入器
│   │   │   │   ├── feishu.ts
│   │   │   │   ├── notion.ts
│   │   │   │   └── markdown.ts
│   │   │   ├── processors/   # 处理器
│   │   │   │   ├── frontmatter.ts
│   │   │   │   ├── images.ts
│   │   │   │   └── ai-enhance.ts
│   │   │   ├── builders/     # 构建器
│   │   │   │   ├── vitepress.ts
│   │   │   │   └── pdf.ts
│   │   │   ├── deployers/    # 部署器
│   │   │   │   ├── github-pages.ts
│   │   │   │   └── vercel.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── cli/                  # 命令行工具
│   │   ├── src/
│   │   │   ├── commands/
│   │   │   │   ├── init.ts
│   │   │   │   ├── import.ts
│   │   │   │   ├── build.ts
│   │   │   │   └── deploy.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── mcp-server/           # MCP Server
│       ├── src/
│       │   └── index.ts
│       └── package.json
│
├── templates/                # 站点模板
│   └── vitepress/
│       ├── config.mts
│       └── theme/
│
├── examples/                 # 示例项目
│   └── getbiji-docs/
│
└── docs/                     # ADoc 自己的文档
    └── DESIGN.md
```

### 3.2 数据模型

```typescript
// adoc.config.json
interface ADocConfig {
  name: string;                    // 项目名
  title: string;                   // 站点标题
  description: string;             // 站点描述
  
  // 导入配置
  import: {
    feishu?: {
      appId: string;
      appSecret: string;
      spaceId?: string;            // 默认知识空间
    };
    notion?: {
      token: string;
      databaseId?: string;
    };
  };
  
  // 构建配置
  build: {
    theme: 'vitepress' | 'docusaurus';
    outDir: string;
    base?: string;                 // 部署路径前缀
  };
  
  // 部署配置
  deploy: {
    target: 'github-pages' | 'vercel' | 'netlify' | 'custom';
    repo?: string;                 // GitHub 仓库
    domain?: string;               // 自定义域名
  };
  
  // AI 增强
  ai?: {
    provider: 'openai' | 'anthropic';
    apiKey: string;
    autoEnhance: boolean;          // 自动优化文档
  };
}

// 文档数据结构
interface ADocDocument {
  id: string;                      // 唯一标识
  title: string;
  content: string;                 // Markdown 内容
  
  // 元数据
  meta: {
    description?: string;
    keywords?: string[];
    category?: string;
    scenarios?: string[];          // 使用场景
    platform?: string[];           // 适用平台
    lastUpdated?: string;
  };
  
  // 来源信息
  source?: {
    type: 'feishu' | 'notion' | 'markdown' | 'url';
    id: string;                    // 原始文档ID
    url?: string;                  // 原始URL
    syncedAt: string;              // 最后同步时间
  };
  
  // 资源
  assets: {
    images: string[];              // 图片路径列表
  };
  
  // 导航
  nav: {
    parent?: string;               // 父级文档ID
    order?: number;                // 排序
    slug: string;                  // URL slug
  };
}
```

---

## 四、接口设计

### 4.1 CLI 命令

```bash
# 初始化项目
adoc init [project-name]

# 导入文档
adoc import feishu <space-id-or-url>    # 从飞书导入
adoc import notion <database-id>         # 从 Notion 导入
adoc import markdown <path>              # 从本地导入
adoc import url <url>                    # 从网页导入

# 文档管理
adoc list                                # 列出所有文档
adoc add <title>                         # 创建新文档
adoc edit <doc-id>                       # 编辑文档
adoc delete <doc-id>                     # 删除文档
adoc sync                                # 同步所有导入源

# 构建
adoc build                               # 构建静态站点
adoc preview                             # 本地预览

# 部署
adoc deploy [target]                     # 部署到指定平台
adoc deploy github-pages
adoc deploy vercel

# 配置
adoc config set <key> <value>            # 设置配置
adoc config get <key>                    # 获取配置
```

### 4.2 MCP Server Tools

```typescript
// 文档管理
adoc_list()                              // 列出所有文档
adoc_get(id: string)                     // 获取文档内容
adoc_create(title: string, content: string)
adoc_update(id: string, content: string)
adoc_delete(id: string)

// 导入
adoc_import_feishu(url: string)
adoc_import_notion(url: string)
adoc_import_markdown(content: string)

// 搜索（Agent 友好）
adoc_search(query: string)               // 语义搜索
adoc_get_context(topic: string)          // 获取主题上下文

// 构建部署
adoc_build()
adoc_deploy(target?: string)
adoc_preview()                           // 获取预览URL
```

### 4.3 HTTP API (可选)

```
POST   /api/docs                         # 创建文档
GET    /api/docs                         # 列出文档
GET    /api/docs/:id                     # 获取文档
PUT    /api/docs/:id                     # 更新文档
DELETE /api/docs/:id                     # 删除文档

POST   /api/import/feishu                # 从飞书导入
POST   /api/import/notion                # 从 Notion 导入

POST   /api/build                        # 构建
POST   /api/deploy                       # 部署

GET    /api/search?q=<query>             # 搜索
```

---

## 五、AI 友好设计

### 5.1 文档元数据 (Frontmatter)

```yaml
---
# 基础信息
title: 会议录音
description: 支持多人发言识别，自动生成会议纪要

# 分类
category: 工作提效
scenarios:
  - 商务会议
  - 团队周会
  - 客户访谈

# 搜索关键词
keywords:
  - 会议
  - 录音
  - 转写
  - 发言人识别
  - 会议纪要

# 平台与限制
platform: [iOS, Android]
membership:
  free: 1小时/次
  pro: 3小时/次

# 关联
related:
  - voice-recording
  - voiceprint
  
# 同步信息
source:
  type: feishu
  id: xxx
  synced: 2026-03-14
---
```

### 5.2 Agent 检索接口

当其他 Agent 需要查询文档时：

```typescript
// 语义搜索
adoc_search("如何录制会议")
// 返回：相关文档列表 + 匹配片段

// 获取主题上下文
adoc_get_context("会议录音")
// 返回：完整文档 + 相关文档摘要 + 使用建议
```

### 5.3 结构化输出

ADoc 生成的文档自带结构化信息，方便 Agent 解析：

```markdown
<!-- adoc:section type="feature" -->
## 核心功能
...
<!-- /adoc:section -->

<!-- adoc:section type="steps" -->
## 使用步骤
1. ...
2. ...
<!-- /adoc:section -->

<!-- adoc:section type="tips" -->
## 小技巧
...
<!-- /adoc:section -->
```

---

## 六、开发计划

### Phase 1: MVP (2周)

- [x] CLI 骨架
- [ ] 飞书导入（完善）
- [ ] VitePress 构建
- [ ] GitHub Pages 部署
- [ ] **验证场景：Get笔记文档**

### Phase 2: Agent 接入 (1周)

- [ ] MCP Server
- [ ] 文档搜索 API
- [ ] 发布 npm

### Phase 3: 扩展 (持续)

- [ ] Notion 导入
- [ ] Vercel 部署
- [ ] AI 自动优化
- [ ] 多语言支持
- [ ] Get笔记知识库同步

---

## 七、竞品对比

| 特性 | ADoc | VitePress | Docusaurus | GitBook |
|------|------|-----------|------------|---------|
| Agent 优先 | ✅ | ❌ | ❌ | ❌ |
| MCP 支持 | ✅ | ❌ | ❌ | ❌ |
| 飞书导入 | ✅ | ❌ | ❌ | ❌ |
| 一键部署 | ✅ | 需配置 | 需配置 | ✅ |
| 开源免费 | ✅ | ✅ | ✅ | 部分 |
| AI 友好 | ✅ | ❌ | ❌ | ❌ |

**ADoc 的差异化**：不是又一个静态站点生成器，而是 **Agent 用来管理文档的工具**。

---

## 八、命名与品牌

- **名称**: ADoc (Agent Documentation)
- **口号**: Let AI agents create and maintain docs
- **中文**: Agent 文档 / 智能文档
- **域名建议**: adoc.dev / adochq.com
- **GitHub**: github.com/adochq/adoc 或 github.com/deanyes/adoc

---

*Version: 0.1.0*
*Last Updated: 2026-03-14*

---

## 九、文档维护能力（核心）

### 9.1 文档 CRUD

Agent 最基础的能力就是能增删改查文档：

```bash
# 创建文档
adoc create "会议录音功能介绍" --category "工作提效"

# 更新文档（按ID或标题）
adoc update meeting --content "新内容..."
adoc update meeting --file ./meeting.md

# 追加内容
adoc append meeting --content "## 新章节\n..."

# 删除文档
adoc delete meeting

# 获取文档
adoc get meeting              # 获取内容
adoc get meeting --meta       # 获取元数据

# 列出文档
adoc list                     # 全部
adoc list --category "工作提效"
```

### 9.2 MCP Tools（文档操作）

```typescript
// 创建
adoc_create({
  title: "会议录音功能介绍",
  content: "# 会议录音\n\n支持多人发言识别...",
  meta: {
    category: "工作提效",
    scenarios: ["商务会议", "团队周会"]
  }
})

// 更新
adoc_update({
  id: "meeting",           // 或 title
  content: "新内容...",
  // 或增量更新
  patch: {
    append: "## 新章节\n...",
    meta: { keywords: ["新关键词"] }
  }
})

// 获取
adoc_get({ id: "meeting" })

// 列出
adoc_list({ category: "工作提效" })

// 删除
adoc_delete({ id: "meeting" })

// 搜索
adoc_search({ query: "如何录制会议" })
```

### 9.3 文档存储结构

```
project/
├── adoc.config.json          # 项目配置
├── adoc.lock.json            # 文档索引（自动生成）
├── docs/
│   ├── index.md
│   ├── guide/
│   │   ├── meeting.md        # slug: meeting
│   │   └── voice.md          # slug: voice
│   └── public/
│       └── images/
└── .adoc/
    ├── cache/                # 缓存
    └── history/              # 变更历史（可选）
```

**adoc.lock.json**（文档索引）：
```json
{
  "version": 1,
  "documents": {
    "meeting": {
      "path": "docs/guide/meeting.md",
      "title": "会议录音",
      "category": "工作提效",
      "hash": "abc123",
      "source": {
        "type": "feishu",
        "id": "xxx",
        "syncedAt": "2026-03-14T10:00:00Z"
      }
    }
  }
}
```

---

## 十、授权设计

### 10.1 授权模式

| 模式 | 场景 | 授权方式 |
|------|------|----------|
| 本地模式 | Agent 直接操作本地项目 | 无需授权 |
| API 模式 | 远程调用 ADoc 服务 | API Key |
| MCP 模式 | Claude/Cursor 等调用 | 继承用户授权 |

### 10.2 本地模式（默认）

Agent 在有项目访问权限的环境下直接操作：

```bash
# Agent 通过 exec 执行
adoc create "新文档" --content "..."
adoc build
adoc deploy
```

**无需额外授权**，因为 Agent 已经有文件系统权限。

### 10.3 API Key 模式

当 ADoc 作为服务运行时：

```bash
# 生成 API Key
adoc auth create-key --name "my-agent" --scope "read,write"

# 输出
# API Key: adoc_sk_xxxxxxxxxxxxx
# Scope: read, write
# Created: 2026-03-14
```

**API Key 权限范围**：
- `read` - 读取文档
- `write` - 创建/更新文档
- `delete` - 删除文档
- `deploy` - 部署权限
- `admin` - 完全权限

```bash
# 使用 API Key
export ADOC_API_KEY=adoc_sk_xxxxx
adoc create "新文档" --content "..."

# 或通过 HTTP API
curl -X POST https://api.adoc.dev/docs \
  -H "Authorization: Bearer adoc_sk_xxxxx" \
  -d '{"title": "新文档", "content": "..."}'
```

### 10.4 MCP 模式

MCP Server 继承用户的 Claude/Cursor 环境授权：

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "adoc": {
      "command": "adoc",
      "args": ["mcp-server"],
      "env": {
        "ADOC_PROJECT": "/path/to/my-docs"
      }
    }
  }
}
```

MCP 模式下，Agent 只能操作指定的项目目录。

### 10.5 第三方服务授权

导入飞书/Notion 等需要配置对应凭证：

```json
// adoc.config.json
{
  "import": {
    "feishu": {
      "appId": "cli_xxx",
      "appSecret": "xxx"
    },
    "notion": {
      "token": "secret_xxx"
    }
  },
  "deploy": {
    "github": {
      "token": "ghp_xxx"
    }
  }
}
```

**凭证存储**：
- 本地：存在 `adoc.config.json`（建议 gitignore）
- 环境变量：`ADOC_FEISHU_APP_ID`, `ADOC_FEISHU_APP_SECRET`
- 系统密钥链：`adoc auth store feishu --app-id xxx --app-secret xxx`

---

## 十一、典型工作流

### 场景：Telegram Bot 维护 Get笔记文档

```
1. 老板: "更新一下会议录音的文档，加上新的多人识别功能"

2. Bot (我) 收到消息

3. Bot 调用 ADoc:
   adoc update meeting --append "
   ## 多人发言识别
   
   新版本支持自动识别不同发言人...
   "

4. Bot 调用 ADoc 部署:
   adoc build
   adoc deploy github-pages

5. Bot 回复: "已更新会议录音文档，已部署到线上 ✅"
```

### 场景：Claude 用户查询产品功能

```
1. 用户: "Get笔记怎么录制会议？"

2. Claude 调用 ADoc MCP:
   adoc_search({ query: "录制会议" })

3. ADoc 返回:
   {
     "results": [{
       "id": "meeting",
       "title": "会议录音",
       "snippet": "支持多人发言识别，自动生成会议纪要...",
       "relevance": 0.95
     }]
   }

4. Claude 根据文档内容回答用户
```

---

## 十二、完整 CLI 命令（更新）

```bash
# === 项目管理 ===
adoc init [name]              # 初始化项目
adoc status                   # 查看项目状态

# === 文档 CRUD ===
adoc create <title>           # 创建文档
  --content <text>            # 内容
  --file <path>               # 从文件读取
  --category <cat>            # 分类
  --slug <slug>               # URL slug

adoc update <id|title>        # 更新文档
  --content <text>            # 替换内容
  --append <text>             # 追加内容
  --file <path>               # 从文件读取
  --meta <json>               # 更新元数据

adoc get <id|title>           # 获取文档
  --meta                      # 只获取元数据
  --format <md|json>          # 输出格式

adoc delete <id|title>        # 删除文档
  --force                     # 跳过确认

adoc list                     # 列出文档
  --category <cat>            # 按分类筛选
  --format <table|json>       # 输出格式

adoc search <query>           # 搜索文档

# === 导入 ===
adoc import feishu <url>      # 从飞书导入
adoc import notion <url>      # 从 Notion 导入
adoc import markdown <path>   # 从本地导入
adoc sync                     # 同步所有导入源

# === 构建部署 ===
adoc build                    # 构建站点
adoc preview                  # 本地预览
adoc deploy [target]          # 部署

# === 授权 ===
adoc auth login               # 登录（API 模式）
adoc auth create-key          # 创建 API Key
adoc auth revoke-key <key>    # 撤销 Key
adoc auth store <service>     # 存储服务凭证

# === MCP ===
adoc mcp-server               # 启动 MCP Server
```

