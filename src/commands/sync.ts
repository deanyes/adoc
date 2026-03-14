import fs from 'fs';
import path from 'path';
import { FeishuClient, sleep } from '../importers/feishu.js';
import { loadConfig } from '../utils/config.js';

interface LockFile {
  version: number;
  documents: Record<string, {
    path: string;
    title: string;
    hash: string;
    updatedAt: string;
    feishuToken?: string;
  }>;
  lastSync?: string;
}

export async function sync(args: string[]) {
  const config = loadConfig();
  const lockPath = path.resolve('adoc.lock.json');
  
  if (!fs.existsSync(lockPath)) {
    console.error('No adoc.lock.json found. Run `adoc import feishu <space-id>` first.');
    process.exit(1);
  }
  
  const lock: LockFile = JSON.parse(fs.readFileSync(lockPath, 'utf-8'));
  
  const appId = config.import?.feishu?.appId;
  const appSecret = config.import?.feishu?.appSecret;
  const spaceId = config.import?.feishu?.spaceId;
  
  if (!appId || !appSecret || !spaceId) {
    console.error('Feishu credentials or spaceId not configured');
    process.exit(1);
  }
  
  console.log('\n🔄 Syncing with Feishu...\n');
  
  const client = new FeishuClient({ appId, appSecret });
  await client.init();
  
  // 获取所有节点
  const allNodes = await client.getAllNodes(spaceId);
  console.log(`Found ${allNodes.length} documents in Feishu\n`);
  
  // 检查变化
  const existingDocs = new Set(Object.keys(lock.documents));
  const feishuDocs = new Set(allNodes.map(n => n.node_token));
  
  // 新增文档
  const newDocs = allNodes.filter(n => !existingDocs.has(n.node_token));
  // 删除的文档
  const deletedDocs = [...existingDocs].filter(id => !feishuDocs.has(id));
  
  console.log(`New documents: ${newDocs.length}`);
  console.log(`Deleted documents: ${deletedDocs.length}`);
  
  if (newDocs.length === 0 && deletedDocs.length === 0) {
    console.log('\n✅ Everything is up to date!');
    
    lock.lastSync = new Date().toISOString();
    fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2));
    return;
  }
  
  // 处理新文档
  if (newDocs.length > 0) {
    console.log('\nImporting new documents...');
    // 这里简化处理，建议重新运行完整导入
    console.log('Run `adoc import feishu` to import new documents.');
  }
  
  // 处理删除的文档
  if (deletedDocs.length > 0 && args.includes('--delete')) {
    console.log('\nRemoving deleted documents...');
    for (const id of deletedDocs) {
      const doc = lock.documents[id];
      if (doc) {
        const filePath = path.resolve(doc.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`  Deleted: ${doc.path}`);
        }
        delete lock.documents[id];
      }
    }
  }
  
  lock.lastSync = new Date().toISOString();
  fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2));
  
  console.log('\n✅ Sync complete!');
  if (newDocs.length > 0) {
    console.log('\nTip: Run `adoc import feishu` to import new documents.');
  }
}
