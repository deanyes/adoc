import fs from 'fs';
import path from 'path';

export async function init(args: string[]) {
  const projectName = args[0] || 'my-docs';
  const projectDir = path.resolve(projectName);
  
  console.log(`Creating ADoc project: ${projectName}`);
  
  // 创建目录结构
  fs.mkdirSync(path.join(projectDir, 'docs'), { recursive: true });
  fs.mkdirSync(path.join(projectDir, 'docs/public/images'), { recursive: true });
  
  // 创建配置文件
  const config = {
    name: projectName,
    title: 'My Documentation',
    description: 'Documentation powered by ADoc',
    theme: 'vitepress',
    import: {
      feishu: {
        appId: '',
        appSecret: ''
      }
    },
    deploy: {
      target: 'github-pages',
      repo: ''
    }
  };
  
  fs.writeFileSync(
    path.join(projectDir, 'adoc.config.json'),
    JSON.stringify(config, null, 2)
  );
  
  // 创建示例首页
  const indexMd = `---
title: Welcome
description: Documentation powered by ADoc
---

# Welcome

This documentation is powered by [ADoc](https://github.com/ADocHQ/adoc).

## Getting Started

Edit \`docs/\` to add your content.
`;
  
  fs.writeFileSync(path.join(projectDir, 'docs/index.md'), indexMd);
  
  console.log(`✅ Project created at ${projectDir}`);
  console.log(`
Next steps:
  cd ${projectName}
  adoc import feishu <your-feishu-space-url>
  adoc build
  adoc deploy github-pages
`);
}
