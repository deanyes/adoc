# ADoc Skill

Agent-first 文档管理工具。让 AI Agent 创建、维护、发布文档。

## 触发条件

当用户提到以下内容时触发：
- 维护文档、更新文档、写文档
- 发布帮助中心、文档站点
- 从飞书导入文档
- 部署文档到 GitHub Pages

## 安装检查

首次使用前，检查 ADoc 是否已安装：

```bash
which adoc || (
  echo "正在安装 ADoc..."
  git clone --depth 1 https://github.com/deanyes/adoc.git ~/.adoc
  cd ~/.adoc && npm install && npm run build && npm link
)
```

## 核心工作流

### 1. 初始化文档项目

```bash
adoc init <project-name>
cd <project-name>
```

### 2. 从飞书导入（如有）

编辑 `adoc.config.json` 配置飞书凭证：
```json
{
  "import": {
    "feishu": {
      "appId": "cli_xxx",
      "appSecret": "xxx"
    }
  }
}
```

然后导入：
```bash
adoc import feishu <space-id>
```

### 3. 创建/更新文档

```bash
adoc create "文档标题"
adoc update <id>
adoc list
adoc search "关键词"
```

### 4. 构建预览

```bash
adoc build
adoc preview  # 本地预览
```

### 5. 部署

```bash
adoc deploy github-pages
```

## 常用命令速查

| 命令 | 说明 |
|------|------|
| `adoc init` | 初始化项目 |
| `adoc create <title>` | 创建文档 |
| `adoc update <id>` | 更新文档 |
| `adoc list` | 列出文档 |
| `adoc search <query>` | 搜索 |
| `adoc import feishu <id>` | 从飞书导入 |
| `adoc build` | 构建静态站点 |
| `adoc deploy` | 部署 |
| `adoc status` | 查看状态 |

## 典型场景

### 场景：用户说"帮我更新产品文档，新增了 X 功能"

1. `adoc list` 查看现有文档
2. `adoc get <相关文档id>` 获取内容
3. 修改内容，`adoc update <id>` 保存
4. `adoc build` 构建
5. `adoc deploy` 部署
6. 告诉用户"文档已更新，预览：<URL>"

### 场景：用户说"把飞书知识库同步到官网"

1. 确认飞书凭证已配置
2. `adoc import feishu <space-id>`
3. `adoc build`
4. `adoc deploy github-pages`
5. 返回部署 URL

## 注意事项

- 首次使用需要安装，安装后全局可用
- 飞书导入需要先创建飞书应用并配置凭证
- 部署到 GitHub Pages 需要配置仓库地址
