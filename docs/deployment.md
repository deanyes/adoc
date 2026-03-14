# 部署指南

## GitHub Pages

### 手动部署

```bash
adoc deploy github-pages
```

需要在 `adoc.config.json` 配置：

```json
{
  "deploy": {
    "type": "github-pages",
    "repo": "https://github.com/yourname/your-docs.git"
  }
}
```

### GitHub Actions 自动部署

创建 `.github/workflows/docs.yml`：

```yaml
name: Deploy Docs

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install -g adoc-agent
      - run: adoc build
      - run: adoc deploy github-pages
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
```

## 其他平台（计划中）

- Vercel
- Netlify
- Cloudflare Pages
