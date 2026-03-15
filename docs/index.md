---
layout: doc
title: ADoc
---

<style>
.hero-section {
  text-align: center;
  padding: 80px 0 60px;
  max-width: 600px;
  margin: 0 auto;
}

.hero-section h1 {
  font-size: 2.5rem;
  font-weight: 600;
  margin: 0 0 16px;
  letter-spacing: -0.02em;
}

.hero-section .tagline {
  font-size: 1.1rem;
  color: var(--vp-c-text-2);
  margin: 0 0 32px;
  line-height: 1.6;
}

.hero-section .actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.hero-section .action-btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.15s ease;
}

.hero-section .action-btn.primary {
  background: var(--vp-c-brand-1);
  color: white;
}

.hero-section .action-btn.primary:hover {
  background: var(--vp-c-brand-2);
}

.hero-section .action-btn.secondary {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

.hero-section .action-btn.secondary:hover {
  background: var(--vp-c-bg-alt);
}

.features-section {
  max-width: 680px;
  margin: 0 auto;
  padding: 40px 0 60px;
  border-top: 1px solid var(--vp-c-divider);
}

.features-section h2 {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--vp-c-text-3);
  margin: 0 0 24px;
}

.features-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.features-section li {
  padding: 12px 0;
  border-bottom: 1px solid var(--vp-c-divider);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.features-section li:last-child {
  border-bottom: none;
}

.features-section .feature-name {
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.features-section .feature-desc {
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.code-section {
  max-width: 680px;
  margin: 0 auto;
  padding: 40px 0;
}

.code-section h2 {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--vp-c-text-3);
  margin: 0 0 16px;
}
</style>

<div class="hero-section">
  <h1>ADoc</h1>
  <p class="tagline">文档工具，为 Agent 设计。<br>写文档、构建、发布，一条命令完成。</p>
  <div class="actions">
    <a href="/adoc/getting-started" class="action-btn primary">开始使用</a>
    <a href="https://github.com/deanyes/adoc" class="action-btn secondary">GitHub</a>
  </div>
</div>

<div class="features-section">
  <h2>特性</h2>
  <ul>
    <li>
      <span class="feature-name">Agent 原生</span>
      <span class="feature-desc">CLI / MCP / API</span>
    </li>
    <li>
      <span class="feature-name">飞书导入</span>
      <span class="feature-desc">一键迁移知识库</span>
    </li>
    <li>
      <span class="feature-name">零配置部署</span>
      <span class="feature-desc">GitHub Pages / Cloudflare</span>
    </li>
    <li>
      <span class="feature-name">开箱即用</span>
      <span class="feature-desc">默认主题，无需设计</span>
    </li>
  </ul>
</div>

<div class="code-section">
  <h2>快速开始</h2>

```bash
# 安装
git clone https://github.com/deanyes/adoc && cd adoc
npm install && npm run build && npm link

# 使用
adoc init my-docs && cd my-docs
adoc create "快速开始" --content "# Hello"
adoc build && adoc deploy
```

</div>
