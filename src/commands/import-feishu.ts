import fs from 'fs';
import path from 'path';
import { FeishuClient, WikiNode, sleep } from '../importers/feishu.js';
import { loadConfig, saveConfig } from '../utils/config.js';

interface DocInfo {
  id: string;
  title: string;
  path: string;
  category?: string;
  images: string[];
  parent?: string;
}

export async function importFeishu(args: string[]) {
  const spaceIdArg = args[0];
  const config = loadConfig();
  
  const appId = config.import?.feishu?.appId;
  const appSecret = config.import?.feishu?.appSecret;
  const spaceId = spaceIdArg || config.import?.feishu?.spaceId;
  
  if (!appId || !appSecret) {
    console.error('Error: Feishu credentials not configured');
    console.error('Add to adoc.config.json:');
    console.error('  "import": { "feishu": { "appId": "...", "appSecret": "..." } }');
    process.exit(1);
  }
  
  if (!spaceId) {
    console.error('Usage: adoc import feishu <space-id>');
    process.exit(1);
  }
  
  console.log(`\n📚 Importing from Feishu space: ${spaceId}\n`);
  
  // 初始化客户端
  const client = new FeishuClient({ appId, appSecret });
  await client.init();
  
  // 获取所有节点
  console.log('Fetching document list...');
  const nodes = await client.getSpaceNodes(spaceId);
  console.log(`Found ${nodes.length} documents\n`);
  
  // 准备目录
  const docsDir = path.resolve('docs');
  const imagesDir = path.join(docsDir, 'public', 'images');
  fs.mkdirSync(imagesDir, { recursive: true });
  
  // 构建目录树
  const nodeMap = new Map<string, WikiNode>();
  const rootNodes: WikiNode[] = [];
  
  for (const node of nodes) {
    nodeMap.set(node.node_token, node);
    if (!node.parent_node_token) {
      rootNodes.push(node);
    }
  }
  
  // 建立父子关系
  for (const node of nodes) {
    if (node.parent_node_token) {
      const parent = nodeMap.get(node.parent_node_token);
      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(node);
      }
    }
  }
  
  // 导入文档
  const docInfos: DocInfo[] = [];
  const sidebar: any[] = [];
  
  await importNodes(rootNodes, '', client, docsDir, imagesDir, docInfos, sidebar, nodeMap);
  
  // 生成 VitePress 配置
  generateVitePressConfig(docsDir, sidebar, config);
  
  // 更新索引
  updateIndex(docInfos);
  
  console.log(`\n✅ Import complete!`);
  console.log(`   Documents: ${docInfos.length}`);
  console.log(`   Images: ${docInfos.reduce((sum, d) => sum + d.images.length, 0)}`);
  console.log(`\nNext steps:`);
  console.log(`   adoc build`);
  console.log(`   adoc preview`);
}

async function importNodes(
  nodes: WikiNode[],
  parentPath: string,
  client: FeishuClient,
  docsDir: string,
  imagesDir: string,
  docInfos: DocInfo[],
  sidebarItems: any[],
  nodeMap: Map<string, WikiNode>
): Promise<void> {
  for (const node of nodes) {
    if (node.obj_type !== 'docx') {
      console.log(`  Skipping non-docx: ${node.title}`);
      continue;
    }
    
    console.log(`📄 ${node.title}`);
    
    // 生成 slug
    const slug = slugify(node.title);
    const subDir = parentPath ? path.join(parentPath) : '';
    const docPath = subDir ? `${subDir}/${slug}.md` : `${slug}.md`;
    const fullPath = path.join(docsDir, docPath);
    
    // 确保目录存在
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
            console.log(`   ⚠️  Image download failed: ${token}`);
          }
          
          // 延迟避免频率限制
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
    const frontmatter = generateFrontmatter(node.title, parentPath);
    const fullContent = frontmatter + '\n' + content;
    
    fs.writeFileSync(fullPath, fullContent);
    
    const docInfo: DocInfo = {
      id: slug,
      title: node.title,
      path: docPath,
      category: parentPath || undefined,
      images,
      parent: node.parent_node_token || undefined
    };
    docInfos.push(docInfo);
    
    // 构建 sidebar
    const sidebarItem: any = {
      text: node.title,
      link: '/' + docPath.replace('.md', '')
    };
    
    // 处理子节点
    if (node.children && node.children.length > 0) {
      sidebarItem.items = [];
      sidebarItem.collapsed = false;
      
      const childPath = parentPath ? `${parentPath}/${slug}` : slug;
      await importNodes(
        node.children,
        childPath,
        client,
        docsDir,
        imagesDir,
        docInfos,
        sidebarItem.items,
        nodeMap
      );
    }
    
    sidebarItems.push(sidebarItem);
    
    // 延迟避免 API 频率限制
    await sleep(500);
  }
}

function slugify(title: string): string {
  // 中文转拼音或使用简化处理
  return title
    .toLowerCase()
    .replace(/[\s]+/g, '-')
    .replace(/[^\w\-\u4e00-\u9fa5]/g, '')
    .slice(0, 50) || 'untitled';
}

function generateFrontmatter(title: string, category?: string): string {
  const lines = [
    '---',
    `title: "${title}"`,
  ];
  
  if (category) {
    lines.push(`category: "${category}"`);
  }
  
  lines.push(`lastUpdated: ${new Date().toISOString()}`);
  lines.push('---');
  
  return lines.join('\n');
}

function generateVitePressConfig(docsDir: string, sidebar: any[], config: any): void {
  const vitepressDir = path.join(docsDir, '.vitepress');
  fs.mkdirSync(vitepressDir, { recursive: true });
  
  const base = config.deploy?.base || '/';
  
  const configContent = `
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '${config.title || 'Documentation'}',
  description: '${config.description || ''}',
  base: '${base}',
  
  head: [
    ['link', { rel: 'icon', href: '${base}favicon.ico' }]
  ],
  
  themeConfig: {
    nav: [
      { text: '首页', link: '/' }
    ],
    
    sidebar: ${JSON.stringify(sidebar, null, 6)},
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com' }
    ],
    
    search: {
      provider: 'local'
    },
    
    outline: {
      level: [2, 3],
      label: '目录'
    },
    
    lastUpdated: {
      text: '最后更新'
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
