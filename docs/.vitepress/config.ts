import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'ADoc',
  description: 'Agent-first documentation tool',
  base: '/adoc/',
  
  themeConfig: {
    nav: [
      { text: '指南', link: '/getting-started' },
      { text: 'CLI', link: '/cli-reference' },
      { text: 'GitHub', link: 'https://github.com/deanyes/adoc' }
    ],
    
    sidebar: [
      {
        text: '开始使用',
        items: [
          { text: '快速开始', link: '/getting-started' },
          { text: '命令参考', link: '/cli-reference' },
          { text: 'Agent 友好设计', link: '/agent-friendly' }
        ]
      },
      {
        text: '进阶',
        items: [
          { text: 'MCP 集成', link: '/mcp-integration' },
          { text: '飞书导入', link: '/feishu-import' },
          { text: '部署指南', link: '/deployment' }
        ]
      }
    ],
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/deanyes/adoc' }
    ]
  }
})
