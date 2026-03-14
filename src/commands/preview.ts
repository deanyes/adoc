import { execSync, spawn } from 'child_process';
import path from 'path';
import { loadConfig } from '../utils/config.js';

export async function preview(args: string[]) {
  const config = loadConfig();
  const projectRoot = path.resolve('.');
  const port = args.find(a => a.startsWith('--port='))?.split('=')[1] || '4173';
  
  console.log('Building preview...');
  
  // 先构建
  execSync('npx vitepress build docs', { cwd: projectRoot, stdio: 'inherit' });
  
  console.log(`\nStarting preview server on port ${port}...`);
  console.log(`\n📖 Preview: http://localhost:${port}\n`);
  
  // 启动预览服务器
  const server = spawn('npx', ['vitepress', 'preview', 'docs', '--port', port], {
    cwd: projectRoot,
    stdio: 'inherit'
  });
  
  // 如果是非交互模式，返回URL
  if (args.includes('--url-only')) {
    console.log(`http://localhost:${port}`);
    setTimeout(() => process.exit(0), 1000);
  }
}
