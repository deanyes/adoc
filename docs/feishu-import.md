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
      "appId": "cli_a90345f867f8dbd8",
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

## 常见问题

### Q: 导入报错 "permission denied"

检查：
1. 应用权限是否添加完整
2. 应用是否已发布
3. 是否有知识空间访问权限

### Q: 图片下载失败

可能原因：
1. 图片已删除
2. 网络问题

解决：重新运行 `adoc import feishu`，会跳过已有文档。

### Q: 文档层级不对

确保知识空间结构正确，ADoc 会保持原有层级。
