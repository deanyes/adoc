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
    try {
      return JSON.parse(fs.readFileSync(lockPath, 'utf-8'));
    } catch {
      console.error('Failed to parse adoc.lock.json. The file may be corrupted.');
    }
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
    console.error('Usage: adoc create <title> [--content <text>] [--stdin] [--category <cat>]');
    process.exit(1);
  }
  
  const contentIdx = args.indexOf('--content');
  const categoryIdx = args.indexOf('--category');
  const fileIdx = args.indexOf('--file');
  const stdinFlag = args.includes('--stdin');

  let content = '';
  if (stdinFlag) {
    content = fs.readFileSync(0, 'utf-8');
  } else if (contentIdx > -1) {
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
    console.error('Usage: adoc update <id> [--content <text>] [--append <text>] [--stdin]');
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
  const stdinFlag = args.includes('--stdin');

  if (stdinFlag) {
    const stdinContent = fs.readFileSync(0, 'utf-8');
    if (appendIdx > -1) {
      content = content + '\n\n' + stdinContent;
    } else {
      const fmEnd = content.indexOf('---', 4);
      const frontmatter = fmEnd > -1 ? content.slice(0, fmEnd + 3) : '';
      content = frontmatter + '\n\n' + stdinContent;
    }
  } else if (contentIdx > -1) {
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

function scanMdFiles(dir: string, includeVitepress: boolean): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (!includeVitepress && entry.name === '.vitepress') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...scanMdFiles(fullPath, includeVitepress));
    } else if (entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

function buildTree(files: Array<{ relativePath: string; label: string }>): string {
  interface TreeNode {
    children: Record<string, TreeNode>;
    label?: string;
  }

  const root: TreeNode = { children: {} };

  for (const file of files) {
    const parts = file.relativePath.split(path.sep);
    let node = root;
    for (const part of parts) {
      if (!node.children[part]) {
        node.children[part] = { children: {} };
      }
      node = node.children[part];
    }
    node.label = file.label;
  }

  const lines: string[] = [];

  function render(node: TreeNode, prefix: string, isLast: boolean, name?: string) {
    if (name !== undefined) {
      const connector = isLast ? '└── ' : '├── ';
      const displayName = node.label ? `${name} ${node.label}` : name;
      lines.push(prefix + connector + displayName);
    }

    const childKeys = Object.keys(node.children);
    childKeys.forEach((key, i) => {
      const childIsLast = i === childKeys.length - 1;
      const childPrefix = name === undefined ? '' : prefix + (isLast ? '    ' : '│   ');
      render(node.children[key], childPrefix, childIsLast, key);
    });
  }

  render(root, '', true);
  return lines.join('\n');
}

export async function list(args: string[]) {
  const index = loadIndex();
  const categoryFilter = args.indexOf('--category') > -1
    ? args[args.indexOf('--category') + 1]
    : null;
  const includeAll = args.includes('--all');
  const treeMode = args.includes('--tree');
  const jsonMode = args.includes('--json');

  const docsDir = path.resolve(DOCS_DIR);
  const allFiles = scanMdFiles(docsDir, includeAll);

  // Build a set of absolute paths from the index for quick lookup
  const indexedPaths = new Map<string, { id: string; title: string; category?: string }>();
  for (const [id, doc] of Object.entries(index.documents)) {
    indexedPaths.set(path.resolve(doc.path), { id, title: doc.title, category: doc.category });
  }

  // Merge: all scanned files + any indexed files whose paths no longer exist on disk
  const fileSet = new Set(allFiles);
  const missingIndexed: string[] = [];
  indexedPaths.forEach((_, absPath) => {
    if (!fileSet.has(absPath)) {
      missingIndexed.push(absPath);
    }
  });

  type DocEntry = {
    relativePath: string;
    absolutePath: string;
    id?: string;
    title?: string;
    category?: string;
    indexed: boolean;
    exists: boolean;
  };

  const entries: DocEntry[] = [];

  for (const absPath of allFiles) {
    const rel = path.relative(docsDir, absPath);
    const info = indexedPaths.get(absPath);
    entries.push({
      relativePath: rel,
      absolutePath: absPath,
      id: info?.id,
      title: info?.title,
      category: info?.category,
      indexed: !!info,
      exists: true,
    });
  }

  for (const absPath of missingIndexed) {
    const info = indexedPaths.get(absPath)!;
    const rel = path.relative(docsDir, absPath);
    entries.push({
      relativePath: rel,
      absolutePath: absPath,
      id: info.id,
      title: info.title,
      category: info.category,
      indexed: true,
      exists: false,
    });
  }

  // Apply category filter
  const filtered = categoryFilter
    ? entries.filter(e => e.category === categoryFilter)
    : entries;

  // Sort by relative path
  filtered.sort((a, b) => a.relativePath.localeCompare(b.relativePath));

  if (jsonMode) {
    console.log(JSON.stringify(filtered, null, 2));
    return;
  }

  if (treeMode) {
    console.log(`\nDocuments (${filtered.length}):\n`);
    console.log(DOCS_DIR + '/');
    const treeFiles = filtered.map(e => {
      const tags: string[] = [];
      if (!e.indexed) tags.push('[未索引]');
      if (!e.exists) tags.push('[文件缺失]');
      return {
        relativePath: e.relativePath,
        label: tags.length ? tags.join(' ') : '',
      };
    });
    console.log(buildTree(treeFiles));
    console.log('');
    return;
  }

  // Default flat list
  console.log(`\nDocuments (${filtered.length}):\n`);
  for (const entry of filtered) {
    const tags: string[] = [];
    if (!entry.indexed) tags.push('[未索引]');
    if (!entry.exists) tags.push('[文件缺失]');
    const tagStr = tags.length ? ' ' + tags.join(' ') : '';

    const displayId = entry.id || path.basename(entry.relativePath, '.md');
    console.log(`  ${displayId}${tagStr}`);
    if (entry.title) console.log(`    Title: ${entry.title}`);
    if (entry.category) console.log(`    Category: ${entry.category}`);
    console.log(`    Path: ${path.join(DOCS_DIR, entry.relativePath)}`);
    console.log('');
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

// === INDEX ===
function parseFrontmatterTitle(content: string): string | undefined {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return undefined;
  const titleMatch = match[1].match(/^title:\s*(.+)$/m);
  return titleMatch ? titleMatch[1].trim() : undefined;
}

export async function index(_args: string[]) {
  const docsDir = path.resolve(DOCS_DIR);
  const allFiles = scanMdFiles(docsDir, false);
  const oldIndex = loadIndex();
  const newIndex: DocIndex = { version: oldIndex.version, documents: {} };

  let added = 0;
  let updated = 0;

  for (const absPath of allFiles) {
    const rel = path.relative(docsDir, absPath);
    const id = rel.replace(/\.md$/, '').replace(/\\/g, '/');
    const content = fs.readFileSync(absPath, 'utf-8');
    const title = parseFrontmatterTitle(content) || path.basename(rel, '.md');
    const h = hash(content);
    const relPath = path.join(DOCS_DIR, rel);

    const existing = oldIndex.documents[id];
    if (!existing) {
      added++;
    } else if (existing.hash !== h) {
      updated++;
    }

    newIndex.documents[id] = {
      path: relPath,
      title,
      hash: h,
      updatedAt: existing?.hash === h ? (existing.updatedAt || new Date().toISOString()) : new Date().toISOString(),
    };
  }

  // Count deleted: keys in old index not in new index
  const deleted = Object.keys(oldIndex.documents).filter(id => !(id in newIndex.documents)).length;

  saveIndex(newIndex);

  console.log(`✅ Index updated: +${added} added, ~${updated} updated, -${deleted} deleted`);
  console.log(`   Total: ${Object.keys(newIndex.documents).length} documents`);
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
