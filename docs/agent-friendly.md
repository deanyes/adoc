# Agent 友好设计

ADoc 从第一天就为 AI Agent 设计，让 Agent 能像人一样轻松操作文档。

## 核心设计原则

### 1. 命令语义清晰

```bash
adoc create "标题" --content "内容"
adoc update <id> --content "新内容"
adoc delete <id>
```

**动词 + 名词 + 参数**，无歧义，Agent 一看就懂。

### 2. 支持管道输入

```bash
# Agent 生成内容后直接传入
echo "这是 Agent 生成的长文档..." | adoc create "文档标题" --stdin

# 追加内容
echo "新增章节" | adoc update doc-id --stdin --append
```

不需要临时文件，内容直接流入。

### 3. 机器可读输出

```bash
# JSON 格式，方便解析
adoc list --json
adoc get my-doc --json
```

Agent 可以解析返回结果，进行下一步操作。

### 4. MCP 协议接入

```bash
adoc mcp  # 启动 MCP Server
```

支持 [Model Context Protocol](https://modelcontextprotocol.io/)，任何兼容 MCP 的 Agent 直接调用，无需额外适配。

### 5. 无交互式操作

所有操作都可以通过参数完成：

```bash
# ✅ 好的设计 - 一条命令完成
adoc create "API文档" --content "# API\n\n接口说明..." --category guide

# ❌ 不好的设计 - 需要交互
> 请输入文档标题：
> 请选择分类：
```

Agent 不需要"对话"，直接执行。

### 6. 幂等性设计

```bash
# 多次执行结果一致
adoc update doc-id --content "最终内容"
```

网络中断？重试就行，不会产生重复或错误状态。

## 对比传统文档工具

| 操作 | Notion / 飞书 | ADoc |
|------|--------------|------|
| 创建文档 | 打开网页 → 点新建 → 输入标题 | `adoc create "标题"` |
| 写入内容 | 富文本编辑器操作 | `--content` 或 `--stdin` |
| 批量更新 | 手动一个个改 | `for doc in ...; do adoc update` |
| 程序接入 | 复杂 OAuth + API | CLI / MCP 直接调 |
| 返回格式 | HTML 页面 | JSON / 纯文本 |

## Agent 工作流示例

```bash
# Agent 自动生成产品文档
adoc create "产品介绍" --content "$(generate_intro)"
adoc create "快速开始" --content "$(generate_quickstart)" --parent guide
adoc create "API参考" --content "$(generate_api_docs)" --parent reference

# 预览确认
adoc preview

# 发布上线
adoc deploy github-pages
```

从生成到发布，全程无需人工介入。

## 总结

**一句话：Agent 能用命令行完成所有操作，不需要模拟点击或处理复杂认证。**

这就是 ADoc 的核心价值 —— 让 AI Agent 成为文档的一等公民。
