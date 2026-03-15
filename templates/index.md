---
layout: doc
title: {{TITLE}}
---

<style>
.help-hero {
  text-align: center;
  padding: 80px 20px 60px;
  margin: -24px -24px 48px;
}

.help-hero h1 {
  font-size: 2rem;
  font-weight: 500;
  margin: 0 0 32px;
  color: var(--vp-c-text-1);
}

.search-box {
  max-width: 480px;
  margin: 0 auto 24px;
  position: relative;
}

.search-box input {
  width: 100%;
  padding: 16px 20px 16px 48px;
  font-size: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-box input:focus {
  border-color: var(--vp-c-brand);
  box-shadow: 0 0 0 3px rgba(0,0,0,0.05);
}

.search-box svg {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: var(--vp-c-text-3);
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 48px 0 24px;
  color: var(--vp-c-text-3);
}

.topics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

@media (max-width: 768px) {
  .topics-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 480px) {
  .topics-grid { grid-template-columns: 1fr; }
}

.topic-card {
  padding: 20px;
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: all 0.15s ease;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
}

.topic-card:hover {
  border-color: var(--vp-c-text-3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.topic-card h3 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px;
  color: var(--vp-c-text-1);
}

.topic-card p {
  font-size: 13px;
  margin: 0;
  color: var(--vp-c-text-3);
  line-height: 1.5;
}
</style>

<div class="help-hero">
  <h1>{{HERO_TEXT}}</h1>

  <div class="search-box">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
    <input type="text" placeholder="搜索文档..." />
  </div>
</div>

<div class="section-title">主题</div>

<div class="topics-grid">
{{TOPIC_CARDS}}
</div>
