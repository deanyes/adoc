import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { loadConfig } from '../utils/config.js';

export async function deploy(args: string[]) {
  const target = args[0] || 'github-pages';
  const config = loadConfig();
  
  console.log(`\n🚀 Deploying to ${target}...\n`);
  
  const distDir = path.resolve('docs/.vitepress/dist');
  
  // 检查是否已构建
  if (!fs.existsSync(distDir)) {
    console.log('Building first...');
    execSync('npx vitepress build docs', { cwd: path.resolve('.'), stdio: 'inherit' });
  }
  
  switch (target) {
    case 'github-pages':
      await deployGitHubPages(distDir, config, args);
      break;
    case 'vercel':
      await deployVercel(distDir);
      break;
    case 'cloudflare':
      await deployCloudflare(distDir, config, args);
      break;
    default:
      console.error(`Unknown deploy target: ${target}`);
      console.log('Supported: github-pages, vercel, cloudflare');
      process.exit(1);
  }
}

async function deployGitHubPages(distDir: string, config: any, args: string[]): Promise<void> {
  // 获取仓库地址
  let repo = args[1] || config.deploy?.repo;
  
  if (!repo) {
    console.error('Error: GitHub repo not configured');
    console.error('Usage: adoc deploy github-pages <repo-url>');
    console.error('Or add to adoc.config.json: "deploy": { "repo": "https://..." }');
    process.exit(1);
  }
  
  console.log(`Deploying to GitHub Pages: ${repo.replace(/ghp_[^@]+@/, '***@')}`);
  
  // 初始化 git
  const gitDir = path.join(distDir, '.git');
  if (!fs.existsSync(gitDir)) {
    execSync('git init', { cwd: distDir, stdio: 'pipe' });
  }
  
  // 添加所有文件
  execSync('git add -A', { cwd: distDir, stdio: 'pipe' });
  
  // 提交
  const commitMsg = `Deploy via ADoc - ${new Date().toISOString()}`;
  try {
    execSync(`git commit -m "${commitMsg}"`, { cwd: distDir, stdio: 'pipe' });
  } catch {
    // 可能没有变更
    console.log('No changes to commit');
  }
  
  // 设置 remote
  try {
    execSync(`git remote add origin ${repo}`, { cwd: distDir, stdio: 'pipe' });
  } catch {
    execSync(`git remote set-url origin ${repo}`, { cwd: distDir, stdio: 'pipe' });
  }
  
  // 推送
  console.log('Pushing to gh-pages branch...');
  execSync('git push -f origin main:gh-pages', { cwd: distDir, stdio: 'inherit' });
  
  // 解析 URL
  const match = repo.match(/github\.com[\/:]([^\/]+)\/([^\/\.]+)/);
  if (match) {
    const [_, owner, repoName] = match;
    console.log(`\n✅ Deployed!`);
    console.log(`   URL: https://${owner}.github.io/${repoName}/`);
  } else {
    console.log(`\n✅ Deployed to GitHub Pages!`);
  }
}

async function deployVercel(distDir: string): Promise<void> {
  console.log('Deploying to Vercel...');

  try {
    execSync('npx vercel --prod', { cwd: distDir, stdio: 'inherit' });
    console.log('\n✅ Deployed to Vercel!');
  } catch (err) {
    console.error('Vercel deployment failed. Make sure you have vercel CLI configured.');
    process.exit(1);
  }
}

async function deployCloudflare(distDir: string, config: any, args: string[]): Promise<void> {
  const projectName = args[1] || config.deploy?.cloudflareProject || config.title?.toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'adoc-site';

  console.log(`Deploying to Cloudflare Pages: ${projectName}`);

  // 检查 wrangler CLI
  try {
    execSync('npx wrangler --version', { stdio: 'pipe' });
  } catch {
    console.error('Error: wrangler CLI not found.');
    console.error('Install it with: npm install -g wrangler');
    console.error('Then login with: wrangler login');
    process.exit(1);
  }

  try {
    execSync(`npx wrangler pages deploy ${distDir} --project-name ${projectName}`, {
      stdio: 'inherit'
    });
    console.log(`\n✅ Deployed to Cloudflare Pages!`);
    console.log(`   URL: https://${projectName}.pages.dev`);
    console.log(`\n💡 Cloudflare Pages 国内访问更稳定，推荐作为面向国内用户的部署平台`);
  } catch (err) {
    console.error('Cloudflare Pages deployment failed.');
    console.error('Make sure you have logged in: npx wrangler login');
    process.exit(1);
  }
}
