import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MilkdownEditor, { MilkdownEditorHandle } from '../components/MilkdownEditor';
import {
  isAuthenticated,
  getRepoConfig,
  fetchFileTree,
  readFile,
  saveFile,
  createFile,
  deleteFile,
  FileNode,
  RepoConfig,
} from '../github';

// --- Frontmatter utilities ---
interface Frontmatter {
  raw: string;
  fields: Record<string, string>;
}

function parseFrontmatter(content: string): { frontmatter: Frontmatter | null; body: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { frontmatter: null, body: content };
  const raw = match[1];
  const body = match[2];
  const fields: Record<string, string> = {};
  for (const line of raw.split('\n')) {
    const idx = line.indexOf(':');
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (key) fields[key] = val;
    }
  }
  return { frontmatter: { raw, fields }, body };
}

function rebuildContent(frontmatter: Frontmatter | null, body: string): string {
  if (!frontmatter) return body;
  return `---\n${frontmatter.raw}\n---\n${body}`;
}

// --- Frontmatter Card ---
function FrontmatterCard({ frontmatter }: { frontmatter: Frontmatter }) {
  const [expanded, setExpanded] = useState(false);
  const title = frontmatter.fields['title'] || '';
  const entries = Object.entries(frontmatter.fields).filter(([k]) => k !== 'title');

  return (
    <div className="frontmatter-card mx-8 mt-6 mb-2">
      {title && (
        <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">{title}</h1>
      )}
      {entries.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <svg
              className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span>文档属性</span>
            <span className="text-gray-300">({entries.length})</span>
          </button>
          {expanded && (
            <div className="border-t border-gray-100 px-3 py-2 bg-gray-50/50">
              <table className="text-xs w-full">
                <tbody>
                  {entries.map(([key, val]) => (
                    <tr key={key}>
                      <td className="py-1 pr-3 text-gray-400 font-medium whitespace-nowrap align-top">{key}</td>
                      <td className="py-1 text-gray-600 break-all">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- File Tree ---
function FileTree({
  nodes,
  selectedPath,
  onSelect,
}: {
  nodes: FileNode[];
  selectedPath: string | null;
  onSelect: (path: string) => void;
}) {
  return (
    <ul className="text-[13px]">
      {nodes.map((node) => (
        <FileTreeItem key={node.path} node={node} selectedPath={selectedPath} onSelect={onSelect} />
      ))}
    </ul>
  );
}

const folderNameMap: Record<string, string> = {
  "pages": "📄 文档",
  "changelog": "📋 版本更新",
  "faq": "❓ 常见问题",
  "getseed": "🎙️ 录音卡",
  "getting-started": "🚀 快速开始",
  "knowledge-base": "📚 知识库",
  "recording": "🎤 记录方式",
  "shortcuts": "⚡ 快捷操作",
  "testimonials": "⭐ 社区精选",
  "use-cases": "💡 用户案例",
  "public": "📁 资源文件",
  "images": "🖼️ 图片",
  "scripts": "📜 脚本",
  "styles": "🎨 样式",
};

function FileIcon({ name }: { name: string }) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'md' || ext === 'mdx' || ext === 'markdown') {
    return (
      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function FolderIcon({ expanded }: { expanded: boolean }) {
  if (expanded) {
    return (
      <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  );
}

function FileTreeItem({
  node,
  selectedPath,
  onSelect,
  depth = 0,
}: {
  node: FileNode;
  selectedPath: string | null;
  onSelect: (path: string) => void;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const isDir = node.type === 'directory';
  const isSelected = node.path === selectedPath;

  return (
    <li>
      <div
        className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md mx-1.5 transition-colors ${
          isSelected
            ? 'bg-blue-50 text-blue-700 font-medium'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => {
          if (isDir) setExpanded(!expanded);
          else onSelect(node.path);
        }}
      >
        {isDir ? (
          <>
            <FolderIcon expanded={expanded} />
            <span className="truncate">{folderNameMap[node.name] || node.name}</span>
            <svg
              className={`w-3 h-3 text-gray-300 ml-auto flex-shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </>
        ) : (
          <>
            <FileIcon name={node.name} />
            <span className="truncate">{node.name}</span>
          </>
        )}
      </div>
      {isDir && expanded && node.children && (
        <FileTree nodes={node.children} selectedPath={selectedPath} onSelect={onSelect} />
      )}
    </li>
  );
}

function isMarkdownFile(filename: string): boolean {
  return /\.(md|mdx|markdown)$/i.test(filename);
}

export default function ProjectPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [frontmatter, setFrontmatter] = useState<Frontmatter | null>(null);
  const [fileSha, setFileSha] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [repoConfig, setRepoConfigState] = useState<RepoConfig | null>(null);
  const [showNewFile, setShowNewFile] = useState(false);
  const [newFilePath, setNewFilePath] = useState('');
  const editorRef = useRef<MilkdownEditorHandle>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }
    const config = getRepoConfig();
    setRepoConfigState(config);
    if (config) loadFiles(config);
  }, []);

  const loadFiles = async (config?: RepoConfig) => {
    try {
      const tree = await fetchFileTree(config);
      setFiles(tree);
    } catch (err: any) {
      setStatus('加载文件失败: ' + err.message);
    }
  };

  const handleFileSelect = async (path: string) => {
    // Auto-save current file if modified
    if (selectedFile && content !== originalContent && fileSha) {
      try {
        const fullContent = rebuildContent(frontmatter, content);
        const result = await saveFile(selectedFile, fullContent, fileSha);
        setFileSha(result.sha);
      } catch (err: any) {
        console.error('Auto-save failed:', err);
      }
    }

    setSelectedFile(path);
    setStatus('加载中...');
    try {
      const { content: fileContent, sha } = await readFile(path);
      setFileSha(sha);
      if (isMarkdownFile(path)) {
        const { frontmatter: fm, body } = parseFrontmatter(fileContent);
        setFrontmatter(fm);
        setContent(body);
        setOriginalContent(body);
      } else {
        setFrontmatter(null);
        setContent(fileContent);
        setOriginalContent(fileContent);
      }
      setStatus('');
    } catch (err: any) {
      setStatus('加载失败: ' + err.message);
    }
  };

  const handleSave = async () => {
    if (!selectedFile || !fileSha) return;
    setSaving(true);
    setStatus('保存中...');
    try {
      const fullContent = rebuildContent(frontmatter, content);
      const result = await saveFile(selectedFile, fullContent, fileSha);
      setFileSha(result.sha);
      setOriginalContent(content);
      setStatus('已保存');
    } catch (err: any) {
      setStatus('保存失败: ' + err.message);
    }
    setSaving(false);
    setTimeout(() => setStatus(''), 2000);
  };

  const handleCreateFile = async () => {
    const path = newFilePath.trim();
    if (!path) return;
    try {
      const initialContent = isMarkdownFile(path)
        ? `---\ntitle: "${path.split('/').pop()?.replace(/\.\w+$/, '') || 'New'}"\n---\n\n`
        : '';
      await createFile(path, initialContent);
      setShowNewFile(false);
      setNewFilePath('');
      await loadFiles();
      setStatus('文件已创建');
      setTimeout(() => setStatus(''), 2000);
    } catch (err: any) {
      setStatus('创建失败: ' + err.message);
    }
  };

  const handleDeleteFile = async () => {
    if (!selectedFile || !fileSha) return;
    if (!confirm(`确定删除 ${selectedFile}？此操作将提交到 GitHub。`)) return;
    try {
      await deleteFile(selectedFile, fileSha);
      setSelectedFile(null);
      setContent('');
      setOriginalContent('');
      setFileSha('');
      await loadFiles();
      setStatus('文件已删除');
      setTimeout(() => setStatus(''), 2000);
    } catch (err: any) {
      setStatus('删除失败: ' + err.message);
    }
  };

  // Keyboard shortcut: Cmd+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFile, content, originalContent, fileSha]);

  const isModified = content !== originalContent;
  const isMarkdown = selectedFile ? isMarkdownFile(selectedFile) : false;

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Top bar */}
      <header className="h-12 border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-gray-700 text-sm transition-colors"
          >
            <svg className="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <span className="text-sm font-semibold text-gray-900">
            {repoConfig ? `${repoConfig.owner}/${repoConfig.repo}` : ''}
          </span>
          {selectedFile && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <span>/</span>
              <span>{selectedFile}</span>
              {isModified && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {status && (
            <span className="text-xs text-gray-400 px-2">{status}</span>
          )}

          <div className="w-px h-5 bg-gray-200 mx-1" />

          <button
            onClick={() => setShowNewFile(true)}
            className="header-btn border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            title="新建文件"
          >
            + 新建
          </button>

          {selectedFile && (
            <button
              onClick={handleDeleteFile}
              className="header-btn border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600"
              title="删除文件"
            >
              删除
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={!selectedFile || !isModified || saving}
            className="header-btn border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            {saving ? '保存中...' : '保存'}
          </button>
          <button
            onClick={() => navigate('/docs')}
            className="header-btn border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
          >
            阅读
          </button>
        </div>
      </header>

      {/* New file modal */}
      {showNewFile && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">新建文件</h2>
            <input
              autoFocus
              value={newFilePath}
              onChange={(e) => setNewFilePath(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFile()}
              placeholder="pages/new-page.md"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <p className="text-xs text-gray-400 mt-2">输入文件路径，如 pages/getting-started.md</p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => { setShowNewFile(false); setNewFilePath(''); }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                取消
              </button>
              <button
                onClick={handleCreateFile}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* File tree sidebar */}
        <aside className="w-60 border-r border-gray-100 overflow-y-auto flex-shrink-0 py-2" style={{ backgroundColor: '#F7F8FA' }}>
          {files.length === 0 ? (
            <p className="text-xs text-gray-400 p-4">加载中...</p>
          ) : (
            <FileTree nodes={files} selectedPath={selectedFile} onSelect={handleFileSelect} />
          )}
        </aside>

        {/* Editor */}
        <div className="flex-1 flex flex-col">
          {selectedFile ? (
            isMarkdown ? (
              <>
                {frontmatter && <FrontmatterCard frontmatter={frontmatter} />}
                <MilkdownEditor
                  ref={editorRef}
                  value={content}
                  onChange={setContent}
                />
              </>
            ) : (
              <div className="h-full flex flex-col">
                <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50 text-xs text-gray-400">
                  {selectedFile} (纯文本)
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="flex-1 w-full p-6 font-mono text-sm resize-none outline-none leading-relaxed text-gray-700"
                  spellCheck={false}
                />
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <p className="text-sm text-gray-300">选择左侧文件开始编辑</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
