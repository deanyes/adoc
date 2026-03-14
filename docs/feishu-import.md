# 飞书导入指南

## 配置飞书应用

1. 创建飞书应用：https://open.feishu.cn/
2. 获取 App ID 和 App Secret
3. 添加知识空间只读权限

## 配置 ADoc

编辑 `adoc.config.json`：

```json
{
  "feishu": {
    "appId": "your-app-id",
    "appSecret": "your-app-secret"
  }
}
```

## 导入文档

```bash
# 获取知识空间 ID（从 URL 中）
# 例如：https://xxx.feishu.cn/wiki/space/7434170131409928194
# space-id = 7434170131409928194

adoc import feishu 7434170131409928194
```

## 特性

- ✅ 递归获取所有子文档
- ✅ 自动下载图片到本地
- ✅ 保持文档层级结构
- ✅ 生成 VitePress sidebar
- ✅ 带速率限制，避免被封
