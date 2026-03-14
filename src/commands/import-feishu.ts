import fs from 'fs';
import path from 'path';
import { FeishuClient, WikiNode, sleep } from '../importers/feishu.js';
import { loadConfig } from '../utils/config.js';

interface DocInfo {
  id: string;
  title: string;
  path: string;
  category?: string;
  images: string[];
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
  const sidebarGroups: Record<string, any[]> = {};
  
  for (const node of allNodes) {
    if (node.obj_type !== 'docx') {
      console.log(`  Skipping non-docx: ${node.title}`);
      continue;
    }
    
    console.log(`📄 ${node.title}`);
    
    // 确定目录路径
    const pathParts = getNodePath(node, nodeMap);
    const category = pathParts.length > 1 ? pathParts[0] : '';
    
    // 生成 slug
    const slug = slugify(node.title);
    const subDir = category ? slugify(category) : '';
    const docPath = subDir ? `${subDir}/${slug}.md` : `${slug}.md`;
    const fullPath = path.join(docsDir, docPath);
    
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    
    // 获取文档内容
    let content = '';
    const images: string[] = [];
    
    try {
      content = await client.getDocumentContent(node.obj_token);
      const imageTokens = client.getLastImageTokens();
      
      // 下载图片
      for (const token of imageTokens) {
        const imagePath = path.join(imagesDir, `${token}.png`);
        
        if (!fs.existsSync(imagePath)) {
          console.log(`   📷 Downloading image...`);
          const success = await client.downloadImage(token, imagePath);
          
          if (success) {
            images.push(token);
          } else {
            console.log(`   ⚠️  Image download failed`);
          }
          
          await sleep(1000);
        } else {
          images.push(token);
        }
      }
    } catch (err: any) {
      console.log(`   ⚠️  Error: ${err.message}`);
      content = `# ${node.title}\n\n*Content could not be imported.*`;
    }
    
    // 生成 frontmatter
    const frontmatter = [
      '---',
      `title: "${node.title}"`,
      category ? `category: "${category}"` : null,
      `lastUpdated: ${new Date().toISOString()}`,
      '---'
    ].filter(Boolean).join('\n');
    
    const fullContent = frontmatter + '\n\n' + content;
    fs.writeFileSync(fullPath, fullContent);
    
    docInfos.push({
      id: slug,
      title: node.title,
      path: docPath,
      category,
      images
    });
    
    // 构建 sidebar
    const groupKey = category || '开始';
    if (!sidebarGroups[groupKey]) {
      sidebarGroups[groupKey] = [];
    }
    sidebarGroups[groupKey].push({
      text: node.title,
      link: '/' + docPath.replace('.md', '')
    });
    
    await sleep(500);
  }
  
  // 生成 VitePress 配置
  generateVitePressConfig(docsDir, sidebarGroups, config);
  
  // 更新索引
  updateIndex(docInfos);
  
  const totalImages = docInfos.reduce((sum, d) => sum + d.images.length, 0);
  
  console.log(`\n✅ Import complete!`);
  console.log(`   Documents: ${docInfos.length}`);
  console.log(`   Images: ${totalImages}`);
  console.log(`\nNext steps:`);
  console.log(`   adoc build`);
  console.log(`   adoc preview`);
}

function getNodePath(node: WikiNode, nodeMap: Map<string, WikiNode>): string[] {
  const path: string[] = [node.title];
  let current = node;
  
  while (current.parent_node_token) {
    const parent = nodeMap.get(current.parent_node_token);
    if (parent) {
      path.unshift(parent.title);
      current = parent;
    } else {
      break;
    }
  }
  
  return path;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[\s]+/g, '-')
    .replace(/[^\w\-\u4e00-\u9fa5]/g, '')
    .slice(0, 50) || 'untitled';
}

function generateVitePressConfig(docsDir: string, groups: Record<string, any[]>, config: any): void {
  const vitepressDir = path.join(docsDir, '.vitepress');
  fs.mkdirSync(vitepressDir, { recursive: true });
  
  const base = config.deploy?.base || '/';
  
  const sidebar = Object.entries(groups).map(([text, items]) => ({
    text,
    collapsed: false,
    items
  }));
  
  const configContent = `
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '${config.title || 'Documentation'}',
  description: '${config.description || ''}',
  base: '${base}',
  
  ignoreDeadLinks: true,
  
  head: [
    ['link', { rel: 'icon', href: '${base}favicon.ico' }]
  ],
  
  themeConfig: {
    nav: [
      { text: '首页', link: '/' }
    ],
    
    sidebar: ${JSON.stringify(sidebar, null, 6)},
    
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
  console.log('   Generated VitePress config');
}

function updateIndex(docInfos: DocInfo[]): void {
  const index = {
    version: 1,
    documents: {} as Record<string, any>
  };
  
  for (const doc of docInfos) {
    index.documents[doc.id] = {
      path: `docs/${doc.path}`,
      title: doc.title,
      category: doc.category,
      images: doc.images,
      hash: Date.now().toString(16),
      updatedAt: new Date().toISOString()
    };
  }
  
  fs.writeFileSync(path.resolve('adoc.lock.json'), JSON.stringify(index, null, 2));
}
