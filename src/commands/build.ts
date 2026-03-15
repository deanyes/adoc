import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { loadConfig } from '../utils/config.js';
import { getGoogleFontsHead, writeThemeFiles, generateIndexContent } from '../utils/theme.js';

export async function build(args: string[]) {
  const config = loadConfig();
  const projectRoot = path.resolve('.');
  const docsDir = path.resolve('docs');
  
  console.log('\n🔨 Building documentation site...\n');
  
  // 检查 docs 目录
  if (!fs.existsSync(docsDir)) {
    console.error('Error: docs/ directory not found');
    console.error('Run `adoc import feishu <space-id>` first');
    process.exit(1);
  }
  
  // 检查 VitePress 配置
  const vitepressDir = path.join(docsDir, '.vitepress');
  if (!fs.existsSync(path.join(vitepressDir, 'config.mts'))) {
    console.log('Generating VitePress config...');
    generateDefaultConfig(docsDir, config);
  }
  
  // 确保有 index.md
  const indexPath = path.join(docsDir, 'index.md');
  if (!fs.existsSync(indexPath)) {
    console.log('Creating index.md...');
    createDefaultIndex(indexPath, config);
  }
  
  // 安装 VitePress
  const packageJson = path.join(projectRoot, 'package.json');
  if (!fs.existsSync(packageJson)) {
    console.log('Initializing npm project...');
    execSync('npm init -y', { cwd: projectRoot, stdio: 'pipe' });
  }
  
  if (!fs.existsSync(path.join(projectRoot, 'node_modules/vitepress'))) {
    console.log('Installing VitePress...');
    execSync('npm install -D vitepress', { cwd: projectRoot, stdio: 'inherit' });
  }
  
  // 构建
  console.log('\nBuilding...');
  execSync('npx vitepress build docs', { cwd: projectRoot, stdio: 'inherit' });
  
  const distDir = path.join(vitepressDir, 'dist');
  console.log(`\n✅ Build complete!`);
  console.log(`   Output: ${distDir}`);
  console.log(`\nNext steps:`);
  console.log(`   adoc preview    # Preview locally`);
  console.log(`   adoc deploy     # Deploy to hosting`);
}

function generateDefaultConfig(docsDir: string, config: any): void {
  const vitepressDir = path.join(docsDir, '.vitepress');
  fs.mkdirSync(vitepressDir, { recursive: true });

  const base = config.deploy?.base || '/';

  // 使用配置的 sidebar 或默认 auto
  const sidebar = config.sidebar
    ? JSON.stringify(config.sidebar, null, 6)
    : "'auto'";

  const configContent = `
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '${config.title || 'Documentation'}',
  description: '${config.description || ''}',
  base: '${base}',

  ignoreDeadLinks: true,

  head: [
${getGoogleFontsHead(base)}
  ],

  themeConfig: {
    nav: [
      { text: '首页', link: '/' }
    ],

    sidebar: ${sidebar},

    search: {
      provider: 'local'
    },

    outline: {
      level: [2, 3],
      label: '目录'
    }
  }
})
`;

  fs.writeFileSync(path.join(vitepressDir, 'config.mts'), configContent);

  // Write theme files (custom.css + theme/index.ts)
  writeThemeFiles(docsDir);
}

function createDefaultIndex(indexPath: string, config: any): void {
  const content = generateIndexContent(config, []);
  fs.writeFileSync(indexPath, content);
}
