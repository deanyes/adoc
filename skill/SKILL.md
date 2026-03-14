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
which adoc || ~/.openclaw/skills/adoc/install.sh
```

## 核心命令

| 命令 | 说明 |
|------|------|
| `adoc init <name>` | 初始化项目 |
| `adoc create <title>` | 创建文档 |
| `adoc update <id>` | 更新文档 |
| `adoc get <id>` | 获取内容 |
| `adoc list` | 列出文档 |
| `adoc list --tree` | 树形显示 |
| `adoc search <query>` | 搜索 |
| `adoc index` | 重建索引 |
| `adoc import feishu <id>` | 从飞书导入 |
| `adoc build` | 构建 |
| `adoc deploy` | 部署 |

## 常用模式

### 创建文档
```bash
adoc create "文档标题" --content "# 标题\n\n内容"
```

### 管道输入
```bash
echo "内容" | adoc create "标题" --stdin
echo "新内容" | adoc update doc-id --stdin
```

### 完整流程
```bash
adoc init my-docs && cd my-docs
adoc create "快速开始"
adoc build
adoc deploy
```

## 典型场景

### 场景：更新产品文档

```bash
# 1. 查看现有文档
adoc list --tree

# 2. 获取要更新的文档
adoc get feature-guide

# 3. 更新内容
adoc update feature-guide --content "新内容"

# 4. 构建部署
adoc build && adoc deploy
```

### 场景：从飞书导入

```bash
# 1. 配置飞书凭证（adoc.config.json）
# 2. 导入
adoc import feishu <space-id>

# 3. 部署
adoc build && adoc deploy github-pages
```

## 注意事项

- 首次使用需要安装，安装后全局可用
- 飞书导入需要先创建飞书应用并配置凭证
- 部署到 GitHub Pages 需要配置仓库地址
