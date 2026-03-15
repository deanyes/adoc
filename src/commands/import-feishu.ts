import fs from 'fs';
import path from 'path';
import { FeishuClient, WikiNode, sleep } from '../importers/feishu.js';
import { loadConfig, isProtected } from '../utils/config.js';
import { getGoogleFontsHead, writeThemeFiles, generateIndexContent } from '../utils/theme.js';

interface DocInfo {
  id: string;
  slug: string;
  title: string;
  path: string;
  category?: string;
  parentSlug?: string;
  images: string[];
  order: number;
}

export async function importFeishu(args: string[]) {
  const spaceIdArg = args[0];
  const config = loadConfig();
  
  const appId = config.import?.feishu?.appId;
  const appSecret = config.import?.feishu?.appSecret;
  const spaceId = spaceIdArg || config.import?.feishu?.spaceId;
  
  if (!appId || !appSecret) {
    console.error('Error: Feishu credentials not configured');
    process.exit(1);
  }
  
  if (!spaceId) {
    console.error('Usage: adoc import feishu <space-id>');
    process.exit(1);
  }
  
  console.log(`\n📚 Importing from Feishu space: ${spaceId}\n`);
  
  const client = new FeishuClient({ appId, appSecret });
  await client.init();
  
  // 递归获取所有节点
  console.log('Fetching all documents (including children)...');
  const allNodes = await client.getAllNodes(spaceId);
  console.log(`Found ${allNodes.length} documents total\n`);
  
  // 准备目录
  const docsDir = path.resolve('docs');
  const imagesDir = path.join(docsDir, 'public', 'images');
  fs.mkdirSync(imagesDir, { recursive: true });
  
  // 构建节点映射
  const nodeMap = new Map<string, WikiNode>();
  for (const node of allNodes) {
    nodeMap.set(node.node_token, node);
  }
  
  // 导入所有文档
  const docInfos: DocInfo[] = [];
  let order = 0;
  let totalFailedImages = 0;
  
  // 递归处理节点
  async function processNode(node: WikiNode, parentSlug?: string): Promise<void> {
    if (node.obj_type !== 'docx') {
      console.log(`  Skipping non-docx: ${node.title}`);
      return;
    }
    
    console.log(`📄 ${node.title}`);
    order++;
    
    // 生成 slug 和路径
    const slug = slugify(node.title);
    const subDir = parentSlug || '';
    const docPath = subDir ? `${subDir}/${slug}.md` : `${slug}.md`;
    const fullPath = path.join(docsDir, docPath);
    
    // 检查是否受保护
    if (isProtected(fullPath, config)) {
      console.log(`   🔒 Protected, skipping: ${docPath}`);
      return;
    }

    fs.mkdirSync(path.dirname(fullPath), { recursive: true });

    // 获取文档内容
    let content = '';
    const images: string[] = [];
    const failedImages: string[] = [];
    
    try {
      content = await client.getDocumentContent(node.obj_token);
      const imageTokens = client.getLastImageTokens();
      const imageUrls = client.getLastImageUrls();

      // 下载图片
      for (const token of imageTokens) {
        const imagePath = path.join(imagesDir, `${token}.png`);

        if (!fs.existsSync(imagePath)) {
          console.log(`   📷 Downloading image...`);
          const tempUrl = imageUrls[token];
          const success = await client.downloadImage(token, imagePath, tempUrl);
          
          if (success) {
            images.push(token);
          } else {
            console.log(`   ⚠️  图片下载失败（权限不足）`);
            failedImages.push(token);
            totalFailedImages++;
          }
          
          await sleep(1000);
        } else {
          images.push(token);
        }
      }
      
      // 移除下载失败的图片引用
      for (const token of failedImages) {
        content = content.replace(new RegExp(`!\\[.*?\\]\\(/images/${token}\\.png\\)\\n?`, 'g'), '');
      }
    } catch (err: any) {
      console.log(`   ⚠️  Error: ${err.message}`);
      content = `# ${node.title}\n\n*Content could not be imported.*`;
    }
    
    // 提取 description（正文第一段）并从正文中移除
    let description = '';
    let bodyContent = content;
    const trimmed = content.trimStart();
    if (trimmed) {
      // 找到第一个非空段落作为 description
      const paragraphs = trimmed.split(/\n\n+/);
      const firstPara = paragraphs[0]?.trim();
      if (firstPara && !firstPara.startsWith('#')) {
        description = firstPara;
        bodyContent = paragraphs.slice(1).join('\n\n').trimStart();
      }
    }

    // 生成 frontmatter
    const frontmatter = [
      '---',
      `title: "${node.title}"`,
      description ? `description: "${description.replace(/"/g, '\\"')}"` : null,
      parentSlug ? `category: "${parentSlug}"` : null,
      `order: ${order}`,
      `lastUpdated: ${new Date().toISOString()}`,
      '---'
    ].filter(Boolean).join('\n');

    const fullContent = frontmatter + '\n\n' + `# ${node.title}` + '\n\n' + bodyContent;
    fs.writeFileSync(fullPath, fullContent);
    
    const docInfo: DocInfo = {
      id: node.node_token,
      slug,
      title: node.title,
      path: docPath,
      category: parentSlug,
      parentSlug,
      images,
      order
    };
    docInfos.push(docInfo);
    
    // 处理子节点
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        await processNode(child, slug);
      }
    }
    
    await sleep(500);
  }
  
  // 处理根节点
  const rootNodes = allNodes.filter(n => !n.parent_node_token);
  for (const node of rootNodes) {
    await processNode(node);
  }
  
  // 生成 VitePress 配置（跳过受保护的文件）
  generateVitePressConfig(docsDir, docInfos, config);
  
  // 更新索引
  updateIndex(docInfos);
  
  const totalImages = docInfos.reduce((sum, d) => sum + d.images.length, 0);

  console.log(`\n✅ Import complete!`);
  console.log(`   Documents: ${docInfos.length}`);
  console.log(`   Images: ${totalImages}`);
  if (totalFailedImages > 0) {
    console.log(`   Failed: ${totalFailedImages} image(s)`);
  }

  // 检查是否有图片下载失败
  if (totalFailedImages > 0) {
    console.log(`\n⚠️  图片下载失败（权限不足）`);
    console.log(`\n解决方法：将飞书应用添加为知识库成员\n`);
    console.log(`操作步骤：`);
    console.log(`  1. 打开飞书知识库页面`);
    console.log(`  2. 点击右上角「设置」→「成员管理」`);
    console.log(`  3. 点击「添加成员」`);
    console.log(`  4. 选择「应用」标签`);
    console.log(`  5. 搜索并选择你的飞书应用（App ID: ${appId}）`);
    console.log(`  6. 设置权限为「可阅读」`);
    console.log(`  7. 重新运行 adoc import feishu ${spaceId}\n`);
    console.log(`详细文档：https://deanyes.github.io/adoc/feishu-import.html`);
    console.log(`\n注意：下载失败的图片已从文档中移除，不影响构建。`);
  }
  
  console.log(`\nNext steps:`);
  console.log(`   adoc build`);
  console.log(`   adoc preview`);
}

function slugify(title: string): string {
  return title
    .trim()
    .replace(/^[\s\-_\.·]+/, '')  // 去掉开头的特殊字符（包括中文点）
    .replace(/[\s]+/g, '-')
    .replace(/[^\w\-\u4e00-\u9fa5]/g, '')
    .replace(/^-+/, '')  // 确保没有开头的破折号
    .slice(0, 50) || 'untitled';
}

function generateVitePressConfig(docsDir: string, docs: DocInfo[], config: any): void {
  const vitepressDir = path.join(docsDir, '.vitepress');
  const configFilePath = path.join(vitepressDir, 'config.mts');

  // 检查 config.mts 是否受保护
  if (isProtected(configFilePath, config)) {
    console.log('   🔒 VitePress config is protected, skipping');
    return;
  }

  fs.mkdirSync(vitepressDir, { recursive: true });

  const base = config.deploy?.base || '/';

  // 使用用户配置的 sidebar，否则自动生成
  const finalSidebar = config.sidebar ?? buildAutoSidebar(docs);

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

    sidebar: ${JSON.stringify(finalSidebar, null, 6)},

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

  fs.writeFileSync(configFilePath, configContent);

  // Write theme files (custom.css + theme/index.ts)
  writeThemeFiles(docsDir);

  // Generate index.md with topic cards from docs
  const indexPath = path.join(docsDir, 'index.md');
  if (!isProtected(indexPath, config)) {
    const topLevelDocs = docs.filter(d => !d.parentSlug);
    const cards = topLevelDocs.map(d => ({
      title: d.title,
      description: '',
      link: '/' + d.path.replace('.md', '')
    }));
    const indexContent = generateIndexContent(config, cards);
    fs.writeFileSync(indexPath, indexContent);
  }

  console.log('   Generated VitePress config');
}

function buildAutoSidebar(docs: DocInfo[]): any[] {
  const finalSidebar: any[] = [];

  for (const doc of docs) {
    if (doc.parentSlug) continue;

    const children = docs.filter(d => d.parentSlug === doc.slug);

    if (children.length > 0) {
      finalSidebar.push({
        text: doc.title,
        collapsed: false,
        items: [
          { text: '概览', link: '/' + doc.path.replace('.md', '') },
          ...children.map(c => ({
            text: c.title,
            link: '/' + c.path.replace('.md', '')
          }))
        ]
      });
    } else {
      finalSidebar.push({
        text: doc.title,
        link: '/' + doc.path.replace('.md', '')
      });
    }
  }

  return finalSidebar;
}

function updateIndex(docInfos: DocInfo[]): void {
  const index = {
    version: 1,
    documents: {} as Record<string, any>
  };
  
  for (const doc of docInfos) {
    index.documents[doc.slug] = {
      path: `docs/${doc.path}`,
      title: doc.title,
      category: doc.category,
      images: doc.images,
      order: doc.order,
      hash: Date.now().toString(16),
      updatedAt: new Date().toISOString()
    };
  }
  
  fs.writeFileSync(path.resolve('adoc.lock.json'), JSON.stringify(index, null, 2));
}
