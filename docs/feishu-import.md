# 飞书导入指南

## 准备工作

### 1. 创建飞书应用

1. 访问 https://open.feishu.cn/app
2. 创建企业自建应用
3. 获取 App ID 和 App Secret

### 2. 配置权限

在应用权限页面添加：

| 权限 | 说明 |
|------|------|
| `wiki:wiki:readonly` | 读取知识空间 |
| `docx:document:readonly` | 读取文档内容 |
| `drive:drive:readonly` | 下载图片 |

### 3. 发布应用

创建版本并发布，让应用生效。

## 配置 ADoc

编辑 `adoc.config.json`：

```json
{
  "name": "my-docs",
  "title": "我的文档",
  "import": {
    "feishu": {
      "appId": "cli_your_app_id",
      "appSecret": "your-app-secret"
    }
  }
}
```

## 导入文档

### 获取知识空间 ID

从 URL 获取：
```
https://xxx.feishu.cn/wiki/space/7434170131409928194
                              └── 这是 space-id
```

### 执行导入

```bash
adoc import feishu 7434170131409928194
```

输出：
```
📚 Importing from Feishu space: 7434170131409928194

✅ Feishu auth successful
Fetching all documents (including children)...
Found 66 documents total

📄 欢迎页面
   📷 Downloading image...
📄 快速开始
   📷 Downloading image...
   📷 Downloading image...
...

✅ Import complete!
   Documents: 66
   Images: 397
```

## 特性说明

### 递归获取

自动获取所有子文档，保持层级结构：

```
知识空间
├── 开始
│   ├── 下载安装
│   └── 快速入门
├── 功能
│   ├── 语音记录
│   └── 拍照记录
└── 更多
```

### 图片处理

- 自动下载所有图片到 `docs/images/`
- 替换文档中的远程链接为本地路径
- 带速率限制，避免被封

### Markdown 转换

支持的飞书块类型：
- 段落、标题（1-9级）
- 有序/无序列表
- 代码块（带语言标识）
- 引用块
- 图片
- 表格
- 待办事项

## 高级配置

### 内容保护

导入时默认保护 `.vitepress/theme/` 目录，防止自定义样式被覆盖。可通过 `protect` 配置项自定义：

```json
{
  "protect": [
    ".vitepress/theme/",
    ".vitepress/config.mts",
    "custom-page.md"
  ]
}
```

受保护的文件在 `import` 和 `sync` 时都会被跳过。

### 自定义侧边栏

默认情况下侧边栏根据文档层级自动生成。可通过 `sidebar` 配置项手动控制顺序、分组和折叠状态：

```json
{
  "sidebar": [
    {
      "text": "快速开始",
      "collapsed": false,
      "items": [
        { "text": "简介", "link": "/intro" },
        { "text": "安装", "link": "/install" }
      ]
    },
    {
      "text": "进阶",
      "collapsed": true,
      "items": [
        { "text": "自定义主题", "link": "/custom-theme" }
      ]
    }
  ]
}
```

如果未配置 `sidebar`，将保持自动生成逻辑。

## 常见问题

### Q: 导入报错 "permission denied"

检查：
1. 应用权限是否添加完整（见下方权限清单）
2. 应用是否已发布
3. 是否有知识空间访问权限

**必需的权限清单：**

| 权限 | 用途 | 缺失影响 |
|------|------|----------|
| `wiki:wiki:readonly` | 获取知识空间节点 | 无法获取文档列表 |
| `docx:document:readonly` | 读取文档内容 | 无法获取正文 |
| `drive:drive:readonly` | 下载文档中的图片 | 图片全部丢失 |

**添加权限后需要重新发布应用！**

### Q: 图片下载失败（错误码 99991672）

这是最常见的问题，原因是 **缺少 `drive:drive:readonly` 权限**。

解决步骤：
1. 登录 [飞书开放平台](https://open.feishu.cn/app)
2. 进入你的应用 → 权限管理
3. 添加 `drive:drive:readonly`（云文档-读取文档）
4. **创建新版本并发布**
5. 重新运行 `adoc import feishu <space-id>`

**注意：** 如果图片下载失败，ADoc 会自动移除 markdown 中的图片引用，不会影响构建。

### Q: 文件名带奇怪前缀（如 `-认识练练.md`）

已在 v0.2.1 修复。更新 ADoc 后重新导入即可。
