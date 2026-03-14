import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { loadConfig } from '../utils/config.js';

export async function build(args: string[]) {
  const config = loadConfig();
  const docsDir = path.resolve('docs');
  
  console.log('Building documentation site...');
  
  // 检查 VitePress 配置
  const vitepressDir = path.join(docsDir, '.vitepress');
  if (!fs.existsSync(vitepressDir)) {
    console.log('Initializing VitePress...');
    fs.mkdirSync(vitepressDir, { recursive: true });
    
    // 生成 VitePress 配置
    const vitepressConfig = generateVitePressConfig(config);
    fs.writeFileSync(path.join(vitepressDir, 'config.mts'), vitepressConfig);
  }
  
  // 安装依赖并构建
  const projectRoot = path.resolve('.');
  if (!fs.existsSync(path.join(projectRoot, 'node_modules/vitepress'))) {
    console.log('Installing VitePress...');
    execSync('npm install -D vitepress', { cwd: projectRoot, stdio: 'inherit' });
  }
  
  console.log('Building...');
  execSync('npx vitepress build docs', { cwd: projectRoot, stdio: 'inherit' });
  
  console.log('✅ Build complete: docs/.vitepress/dist');
}

function generateVitePressConfig(config: any): string {
  return `
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '${config.title || 'Documentation'}',
  description: '${config.description || ''}',
  
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' }
    ],
    
    sidebar: 'auto',
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com' }
    ],
    
    search: {
      provider: 'local'
    }
  }
})
`;
}
