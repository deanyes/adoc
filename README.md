# ADoc

**Agent 优先的文档工具** —— 一条命令创建漂亮的文档站

## 🤖 Agent 使用（推荐）

```bash
npx github:deanyes/create-adoc my-docs --name "我的文档" --deploy
```

**就这一条命令**，自动完成：
- ✅ 创建 GitHub 仓库
- ✅ 使用 Tome 模板（漂亮样式）
- ✅ 构建并部署到 GitHub Pages
- ✅ 返回文档地址

**输出示例：**
```
✅ 文档创建完成！

📖 文档地址: https://xxx.github.io/my-docs/
📁 仓库地址: https://github.com/xxx/my-docs
```

## 📦 安装 Skill（可选）

让 Agent 自动识别文档创建需求：

```bash
mkdir -p ~/.openclaw/skills/adoc
curl -o ~/.openclaw/skills/adoc/SKILL.md \
  https://raw.githubusercontent.com/deanyes/adoc/main/skill/SKILL.md
```

然后直接说："给 xxx 建文档"

## 👤 人类使用

### 方式 1：命令行

```bash
npx github:deanyes/create-adoc my-docs --name "我的文档" --deploy
```

### 方式 2：在线编辑器

访问 https://deanyes.github.io/adoc/

## 📚 相关资源

| 资源 | 地址 |
|------|------|
| CLI 工具 | https://github.com/deanyes/create-adoc |
| 文档模板 | https://github.com/deanyes/adoc-template |
| 在线编辑器 | https://deanyes.github.io/adoc/ |
| Skill | [skill/SKILL.md](skill/SKILL.md) |

## License

MIT © 2026 dean YANG
