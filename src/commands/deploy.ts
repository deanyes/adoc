import { execSync } from 'child_process';
import path from 'path';
import { loadConfig } from '../utils/config.js';

export async function deploy(args: string[]) {
  const target = args[0] || 'github-pages';
  const config = loadConfig();
  
  console.log(`Deploying to ${target}...`);
  
  switch (target) {
    case 'github-pages':
      await deployGitHubPages(config, args);
      break;
    case 'vercel':
      await deployVercel(config);
      break;
    default:
      console.error(`Unknown deploy target: ${target}`);
      console.log('Supported targets: github-pages, vercel');
      process.exit(1);
  }
}

async function deployGitHubPages(config: any, args: string[]) {
  const distDir = path.resolve('docs/.vitepress/dist');
  const repo = args[1] || config.deploy?.repo;
  
  if (!repo) {
    console.error('GitHub repo not specified. Usage: adoc deploy github-pages <repo-url>');
    process.exit(1);
  }
  
  console.log(`Deploying to GitHub Pages: ${repo}`);
  
  // 初始化 git 并推送
  execSync(`
    cd ${distDir}
    git init
    git add -A
    git commit -m "Deploy via ADoc"
    git push -f ${repo} main:gh-pages
  `, { stdio: 'inherit' });
  
  console.log('✅ Deployed to GitHub Pages');
}

async function deployVercel(config: any) {
  const distDir = path.resolve('docs/.vitepress/dist');
  
  console.log('Deploying to Vercel...');
  execSync(`cd ${distDir} && npx vercel --prod`, { stdio: 'inherit' });
  
  console.log('✅ Deployed to Vercel');
}
