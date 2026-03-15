import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isProtected, type ADocConfig } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatesDir = path.resolve(__dirname, '../../templates');

/**
 * Google Fonts head config for VitePress (Inter + Noto Sans SC)
 */
export function getGoogleFontsHead(base: string): string {
  return `
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&display=swap', rel: 'stylesheet' }],
    ['link', { rel: 'icon', href: '${base}favicon.ico' }]`;
}

/**
 * Write custom.css and theme/index.ts into .vitepress/theme/
 * Respects protect config — skips files that already exist and are protected.
 */
export function writeThemeFiles(docsDir: string, config?: ADocConfig): void {
  const themeDir = path.join(docsDir, '.vitepress', 'theme');
  fs.mkdirSync(themeDir, { recursive: true });

  // Copy custom.css from templates (skip if protected and exists)
  const cssSource = path.join(templatesDir, 'custom.css');
  const cssDest = path.join(themeDir, 'custom.css');
  if (fs.existsSync(cssDest) && config && isProtected(cssDest, config)) {
    console.log('   🔒 custom.css is protected, skipping');
  } else if (fs.existsSync(cssSource)) {
    fs.copyFileSync(cssSource, cssDest);
  }

  // Write theme/index.ts (skip if protected and exists)
  const themeIndexPath = path.join(themeDir, 'index.ts');
  if (fs.existsSync(themeIndexPath) && config && isProtected(themeIndexPath, config)) {
    console.log('   🔒 theme/index.ts is protected, skipping');
  } else {
    const themeIndex = `import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default DefaultTheme
`;
    fs.writeFileSync(themeIndexPath, themeIndex);
  }
}

interface TopicCard {
  title: string;
  description: string;
  link: string;
}

/**
 * Generate the default index.md with hero + topic cards
 */
export function generateIndexContent(config: any, cards: TopicCard[]): string {
  const title = config.title || 'Documentation';
  const heroText = config.description || '欢迎使用文档';

  let cardsHtml = '';
  if (cards.length > 0) {
    cardsHtml = cards.map(c => `  <a href="${c.link}" class="topic-card">
    <h3>${c.title}</h3>
    <p>${c.description}</p>
  </a>`).join('\n\n');
  }

  // Read template
  const templatePath = path.join(templatesDir, 'index.md');
  let template: string;
  if (fs.existsSync(templatePath)) {
    template = fs.readFileSync(templatePath, 'utf-8');
  } else {
    // Fallback minimal template
    template = `---
layout: doc
title: {{TITLE}}
---

# {{HERO_TEXT}}
`;
  }

  return template
    .replace(/\{\{TITLE\}\}/g, title)
    .replace(/\{\{HERO_TEXT\}\}/g, heroText)
    .replace(/\{\{TOPIC_CARDS\}\}/g, cardsHtml);
}
