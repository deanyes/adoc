import fs from 'fs';
import path from 'path';
import { loadConfig } from '../utils/config.js';

interface LockFile {
  version: number;
  documents: Record<string, any>;
  lastSync?: string;
}

export async function status(args: string[]) {
  const configPath = path.resolve('adoc.config.json');
  const lockPath = path.resolve('adoc.lock.json');
  const docsDir = path.resolve('docs');
  
  console.log('\n📊 ADoc Project Status\n');
  
  // 检查配置
  if (!fs.existsSync(configPath)) {
    console.log('❌ Not an ADoc project (adoc.config.json not found)');
    console.log('   Run `adoc init` to create a new project.\n');
    return;
  }
  
  const config = loadConfig();
  console.log(`Project: ${config.name || '(unnamed)'}`);
  console.log(`Title:   ${config.title || '(no title)'}`);
  console.log('');
  
  // 检查文档
  if (fs.existsSync(lockPath)) {
    const lock: LockFile = JSON.parse(fs.readFileSync(lockPath, 'utf-8'));
    const docCount = Object.keys(lock.documents).length;
    
    console.log(`Documents: ${docCount}`);
    
    if (lock.lastSync) {
      const syncDate = new Date(lock.lastSync);
      const now = new Date();
      const diffHours = Math.floor((now.getTime() - syncDate.getTime()) / (1000 * 60 * 60));
      console.log(`Last sync: ${diffHours < 24 ? `${diffHours} hours ago` : syncDate.toLocaleDateString()}`);
    }
  } else {
    console.log('Documents: 0 (not imported yet)');
  }
  
  // 检查图片
  const imagesDir = path.join(docsDir, 'public', 'images');
  if (fs.existsSync(imagesDir)) {
    const images = fs.readdirSync(imagesDir).filter(f => f.endsWith('.png'));
    console.log(`Images:    ${images.length}`);
  }
  
  // 检查构建
  const distDir = path.join(docsDir, '.vitepress', 'dist');
  if (fs.existsSync(distDir)) {
    const stat = fs.statSync(distDir);
    const buildDate = stat.mtime;
    console.log(`Built:     ${buildDate.toLocaleString()}`);
  } else {
    console.log('Built:     Not yet (run `adoc build`)');
  }
  
  console.log('');
  
  // 配置状态
  console.log('Configuration:');
  console.log(`  Feishu: ${config.import?.feishu?.appId ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`  Deploy: ${config.deploy?.target || 'Not configured'}`);
  
  if (config.deploy?.repo) {
    console.log(`  Repo:   ${config.deploy.repo.replace(/ghp_[^@]+@/, '***@')}`);
  }
  
  console.log('');
}
