import fs from 'fs';
import path from 'path';
import { FeishuClient } from '../importers/feishu.js';
import { loadConfig } from '../utils/config.js';

export async function importFeishu(args: string[]) {
  const url = args[0];
  if (!url) {
    console.error('Usage: adoc import feishu <feishu-wiki-url-or-space-id>');
    process.exit(1);
  }
  
  const config = loadConfig();
  const { appId, appSecret } = config.import?.feishu || {};
  
  if (!appId || !appSecret) {
    console.error('Feishu credentials not configured in adoc.config.json');
    process.exit(1);
  }
  
  const client = new FeishuClient(appId, appSecret);
  await client.init();
  
  // 解析 URL 获取 space_id
  const spaceId = parseFeishuUrl(url);
  console.log(`Importing from Feishu space: ${spaceId}`);
  
  // 获取所有节点
  const nodes = await client.getSpaceNodes(spaceId);
  console.log(`Found ${nodes.length} documents`);
  
  // 确保目录存在
  const docsDir = path.resolve('docs');
  const imagesDir = path.join(docsDir, 'public/images');
  fs.mkdirSync(imagesDir, { recursive: true });
  
  // 导入每个文档
  for (const node of nodes) {
    console.log(`Importing: ${node.title}`);
    
    const doc = await client.getDocument(node.obj_token);
    const markdown = await client.toMarkdown(doc, {
      downloadImages: true,
      imagesDir
    });
    
    const filePath = path.join(docsDir, `${node.node_token}.md`);
    fs.writeFileSync(filePath, markdown);
    
    // 避免频率限制
    await sleep(500);
  }
  
  console.log(`✅ Imported ${nodes.length} documents`);
}

function parseFeishuUrl(url: string): string {
  // 支持完整 URL 或直接 space_id
  const match = url.match(/space\/(\d+)/);
  return match ? match[1] : url;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
