
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'ADoc',
  description: 'Agent-first 文档工具 — Agent 写文档，一键发布，漂亮好用',
  base: '/adoc/',

  ignoreDeadLinks: true,

  head: [

    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&display=swap', rel: 'stylesheet' }],
    ['link', { rel: 'icon', href: '/adoc/favicon.ico' }]
  ],

  themeConfig: {
    nav: [
      { text: '首页', link: '/' }
    ],

    sidebar: 'auto',

    search: {
      provider: 'local'
    },

    outline: {
      level: [2, 3],
      label: '目录'
    }
  }
})
