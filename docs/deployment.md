# 部署指南

## 推荐方案

| 平台 | 国内访问 | 国外访问 | 成本 | 推荐 |
|------|----------|----------|------|------|
| **Cloudflare Pages** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 免费 | ✅ 首选 |
| GitHub Pages | ⭐⭐ | ⭐⭐⭐⭐⭐ | 免费 | 备选 |
| Vercel | ⭐ | ⭐⭐⭐⭐⭐ | 免费 | 不推荐国内 |

**建议：** 优先使用 Cloudflare Pages，国内外都能访问。

---

## Cloudflare Pages（推荐）

### 首次部署

```bash
# 需要先安装 wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 部署
adoc deploy cloudflare my-docs
```

### 配置文件

```json
{
  "deploy": {
    "cloudflareProject": "my-docs"
  }
}
```

配置后可以直接运行：

```bash
adoc deploy cloudflare
```

### 访问地址

部署成功后，访问：`https://my-docs.pages.dev`

如需自定义域名，在 Cloudflare 控制台配置。

---

## GitHub Pages

### 部署命令

```bash
adoc deploy github-pages
```

### 配置文件

```json
{
  "deploy": {
    "target": "github-pages",
    "repo": "https://github.com/yourname/your-docs.git",
    "base": "/your-docs/"
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
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Vercel

```bash
adoc deploy vercel
```

**注意：** Vercel 国内访问不稳定，不推荐面向国内用户的项目使用。

---

## 国内用户特别说明

如果目标用户主要在国内，Cloudflare Pages 是当前最佳免费方案。

如需更稳定的国内访问，可以考虑：
- 阿里云 OSS + CDN
- 腾讯云 COS + CDN

这些方案需要付费（几块钱/月），配置相对复杂，ADoc 暂未提供自动化支持。
