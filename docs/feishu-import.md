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

## 图片权限问题

图片下载失败是最常见的问题。导入文档内容成功但图片全部失败时，通常是因为飞书应用没有知识库的访问权限。

### 问题原因

飞书知识库中的图片受独立的权限控制。即使应用已配置 `drive:drive:readonly` 权限，**如果应用不是知识库的成员，仍然无法下载其中的图片**。

出现此问题时，ADoc 会输出如下提示：

```
⚠️  图片下载失败（权限不足）

解决方法：将飞书应用添加为知识库成员

操作步骤：
  1. 打开飞书知识库页面
  2. 点击右上角「设置」→「成员管理」
  3. 点击「添加成员」
  4. 选择「应用」标签
  5. 搜索并选择你的飞书应用（App ID: cli_xxx）
  6. 设置权限为「可阅读」
  7. 重新运行 adoc import feishu <space-id>
```

### 操作步骤（详细）

#### 第 1 步：打开知识库设置

进入飞书知识库页面，点击右上角的 **「...」→「设置」**。

<!-- 截图位置：知识库页面右上角设置入口 -->

#### 第 2 步：进入成员管理

在设置面板中，选择 **「成员管理」** 标签页。

<!-- 截图位置：设置面板的成员管理标签页 -->

#### 第 3 步：添加应用为成员

1. 点击 **「添加成员」** 按钮
2. 在弹出的对话框中，切换到 **「应用」** 标签
3. 搜索你的飞书应用名称（可在 `adoc.config.json` 中找到对应的 `appId`）
4. 选择该应用，权限设为 **「可阅读」**
5. 点击确认

<!-- 截图位置：添加成员对话框，应用标签页 -->

#### 第 4 步：重新导入

```bash
adoc import feishu <space-id>
```

图片应该可以正常下载了。

### 常见问题

#### Q: 已添加应用为成员，图片仍然下载失败？

检查以下几点：

1. **应用权限是否完整** — 确认应用已配置以下权限并已发布：

   | 权限 | 用途 |
   |------|------|
   | `wiki:wiki:readonly` | 获取知识空间节点 |
   | `docx:document:readonly` | 读取文档内容 |
   | `drive:drive:readonly` | 下载文档中的图片 |

2. **应用是否已发布** — 添加权限后需要创建新版本并发布
3. **知识库成员权限是否生效** — 确认应用在成员列表中显示为「可阅读」

#### Q: 图片下载失败会影响文档构建吗？

不会。ADoc 会自动移除下载失败的图片引用，文档可以正常构建和预览，只是缺少对应的图片。

#### Q: 错误码 99991672 是什么意思？

这是飞书 API 返回的权限不足错误码，表示应用没有访问对应资源的权限。按上述步骤将应用添加为知识库成员即可解决。

## 其他常见问题

### Q: 导入报错 "permission denied"

检查：
1. 应用权限是否添加完整（见上方权限清单）
2. 应用是否已发布
3. 是否有知识空间访问权限

### Q: 文件名带奇怪前缀（如 `-认识练练.md`）

已在 v0.2.1 修复。更新 ADoc 后重新导入即可。
