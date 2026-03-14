import fs from 'fs';
import path from 'path';

const DOCS_DIR = 'docs';
const LOCK_FILE = 'adoc.lock.json';

interface DocIndex {
  version: number;
  documents: Record<string, {
    path: string;
    title: string;
    category?: string;
    hash: string;
    updatedAt: string;
  }>;
}

function loadIndex(): DocIndex {
  const lockPath = path.resolve(LOCK_FILE);
  if (fs.existsSync(lockPath)) {
    return JSON.parse(fs.readFileSync(lockPath, 'utf-8'));
  }
  return { version: 1, documents: {} };
}

function saveIndex(index: DocIndex) {
  fs.writeFileSync(path.resolve(LOCK_FILE), JSON.stringify(index, null, 2));
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[\s]+/g, '-')
    .replace(/[^\w\-\u4e00-\u9fa5]/g, '')
    .slice(0, 50);
}

function hash(content: string): string {
  let h = 0;
  for (let i = 0; i < content.length; i++) {
    h = ((h << 5) - h) + content.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(16);
}

// === CREATE ===
export async function create(args: string[]) {
  const title = args[0];
  if (!title) {
    console.error('Usage: adoc create <title> [--content <text>] [--category <cat>]');
    process.exit(1);
  }
  
  const contentIdx = args.indexOf('--content');
  const categoryIdx = args.indexOf('--category');
  const fileIdx = args.indexOf('--file');
  
  let content = '';
  if (contentIdx > -1) {
    content = args[contentIdx + 1] || '';
  } else if (fileIdx > -1) {
    content = fs.readFileSync(args[fileIdx + 1], 'utf-8');
  } else {
    content = `# ${title}\n\nTODO: Add content here.`;
  }
  
  const category = categoryIdx > -1 ? args[categoryIdx + 1] : undefined;
  const slug = slugify(title);
  const filePath = path.join(DOCS_DIR, `${slug}.md`);
  
  // 添加 frontmatter
  const frontmatter = [
    '---',
    `title: ${title}`,
    category ? `category: ${category}` : null,
    `created: ${new Date().toISOString()}`,
    '---',
    ''
  ].filter(Boolean).join('\n');
  
  const fullContent = frontmatter + content;
  
  fs.mkdirSync(path.dirname(path.resolve(filePath)), { recursive: true });
  fs.writeFileSync(path.resolve(filePath), fullContent);
  
  // 更新索引
  const index = loadIndex();
  index.documents[slug] = {
    path: filePath,
    title,
    category,
    hash: hash(fullContent),
    updatedAt: new Date().toISOString()
  };
  saveIndex(index);
  
  console.log(`✅ Created: ${filePath}`);
  console.log(`   ID: ${slug}`);
}

// === UPDATE ===
export async function update(args: string[]) {
  const id = args[0];
  if (!id) {
    console.error('Usage: adoc update <id> [--content <text>] [--append <text>]');
    process.exit(1);
  }
  
  const index = loadIndex();
  const doc = index.documents[id];
  
  if (!doc) {
    // 尝试按文件名查找
    const filePath = path.resolve(DOCS_DIR, `${id}.md`);
    if (!fs.existsSync(filePath)) {
      console.error(`Document not found: ${id}`);
      process.exit(1);
    }
  }
  
  const filePath = doc?.path || path.join(DOCS_DIR, `${id}.md`);
  let content = fs.readFileSync(path.resolve(filePath), 'utf-8');
  
  const contentIdx = args.indexOf('--content');
  const appendIdx = args.indexOf('--append');
  const fileIdx = args.indexOf('--file');
  
  if (contentIdx > -1) {
    // 替换内容（保留 frontmatter）
    const fmEnd = content.indexOf('---', 4);
    const frontmatter = fmEnd > -1 ? content.slice(0, fmEnd + 3) : '';
    content = frontmatter + '\n\n' + args[contentIdx + 1];
  } else if (appendIdx > -1) {
    // 追加内容
    content = content + '\n\n' + args[appendIdx + 1];
  } else if (fileIdx > -1) {
    const newContent = fs.readFileSync(args[fileIdx + 1], 'utf-8');
    const fmEnd = content.indexOf('---', 4);
    const frontmatter = fmEnd > -1 ? content.slice(0, fmEnd + 3) : '';
    content = frontmatter + '\n\n' + newContent;
  }
  
  fs.writeFileSync(path.resolve(filePath), content);
  
  // 更新索引
  if (doc) {
    doc.hash = hash(content);
    doc.updatedAt = new Date().toISOString();
    saveIndex(index);
  }
  
  console.log(`✅ Updated: ${filePath}`);
}

// === GET ===
export async function get(args: string[]) {
  const id = args[0];
  if (!id) {
    console.error('Usage: adoc get <id> [--meta]');
    process.exit(1);
  }
  
  const index = loadIndex();
  const doc = index.documents[id];
  const filePath = doc?.path || path.join(DOCS_DIR, `${id}.md`);
  
  if (!fs.existsSync(path.resolve(filePath))) {
    console.error(`Document not found: ${id}`);
    process.exit(1);
  }
  
  const content = fs.readFileSync(path.resolve(filePath), 'utf-8');
  
  if (args.includes('--meta')) {
    console.log(JSON.stringify(doc || { path: filePath }, null, 2));
  } else {
    console.log(content);
  }
}

// === LIST ===
export async function list(args: string[]) {
  const index = loadIndex();
  const categoryFilter = args.indexOf('--category') > -1 
    ? args[args.indexOf('--category') + 1] 
    : null;
  
  const docs = Object.entries(index.documents)
    .filter(([_, doc]) => !categoryFilter || doc.category === categoryFilter);
  
  if (args.includes('--json')) {
    console.log(JSON.stringify(docs, null, 2));
  } else {
    console.log(`\nDocuments (${docs.length}):\n`);
    for (const [id, doc] of docs) {
      console.log(`  ${id}`);
      console.log(`    Title: ${doc.title}`);
      if (doc.category) console.log(`    Category: ${doc.category}`);
      console.log(`    Path: ${doc.path}`);
      console.log('');
    }
  }
}

// === DELETE ===
export async function deleteDoc(args: string[]) {
  const id = args[0];
  if (!id) {
    console.error('Usage: adoc delete <id>');
    process.exit(1);
  }
  
  const index = loadIndex();
  const doc = index.documents[id];
  const filePath = doc?.path || path.join(DOCS_DIR, `${id}.md`);
  
  if (fs.existsSync(path.resolve(filePath))) {
    fs.unlinkSync(path.resolve(filePath));
  }
  
  if (doc) {
    delete index.documents[id];
    saveIndex(index);
  }
  
  console.log(`✅ Deleted: ${id}`);
}

// === SEARCH ===
export async function search(args: string[]) {
  const query = args.join(' ').toLowerCase();
  if (!query) {
    console.error('Usage: adoc search <query>');
    process.exit(1);
  }
  
  const index = loadIndex();
  const results: Array<{ id: string; title: string; snippet: string }> = [];
  
  for (const [id, doc] of Object.entries(index.documents)) {
    const filePath = path.resolve(doc.path);
    if (!fs.existsSync(filePath)) continue;
    
    const content = fs.readFileSync(filePath, 'utf-8').toLowerCase();
    
    if (content.includes(query) || doc.title.toLowerCase().includes(query)) {
      // 提取匹配片段
      const idx = content.indexOf(query);
      const start = Math.max(0, idx - 50);
      const end = Math.min(content.length, idx + query.length + 50);
      const snippet = content.slice(start, end).replace(/\n/g, ' ');
      
      results.push({ id, title: doc.title, snippet: `...${snippet}...` });
    }
  }
  
  console.log(`\nSearch results for "${query}" (${results.length}):\n`);
  for (const r of results) {
    console.log(`  ${r.id}: ${r.title}`);
    console.log(`    ${r.snippet}`);
    console.log('');
  }
}
