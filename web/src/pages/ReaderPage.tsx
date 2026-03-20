import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import DocsSidebar from '../components/DocsSidebar';
import {
  isAuthenticated,
  getRepoConfig,
  fetchFileTree,
  readFile,
  FileNode,
  RepoConfig,
} from '../github';
import '../styles/tome.css';
import 'highlight.js/styles/github.css';

// --- Frontmatter ---
interface Frontmatter {
  title?: string;
  description?: string;
  [key: string]: string | undefined;
}

function parseFrontmatter(content: string): { frontmatter: Frontmatter | null; body: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { frontmatter: null, body: content };
  const fields: Frontmatter = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (key) fields[key] = val;
    }
  }
  return { frontmatter: fields, body: match[2] };
}

// --- TOC ---
interface TocItem {
  id: string;
  text: string;
  level: number;
}

function extractToc(markdown: string): TocItem[] {
  const items: TocItem[] = [];
  for (const line of markdown.split('\n')) {
    const m = line.match(/^(#{2,4})\s+(.+)/);
    if (m) {
      const text = m[2].trim();
      const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '');
      items.push({ id, text, level: m[1].length });
    }
  }
  return items;
}

// --- Slug utilities ---
function pathToSlug(path: string): string {
  return path.replace(/^pages\//, '').replace(/\.(md|mdx|markdown)$/i, '');
}

function collectAllPages(nodes: FileNode[], result: { slug: string; path: string; name: string }[] = []) {
  for (const node of nodes) {
    if (node.type === 'file' && /\.(md|mdx|markdown)$/i.test(node.name)) {
      result.push({
        slug: pathToSlug(node.path),
        path: node.path,
        name: node.name.replace(/\.(md|mdx|markdown)$/i, '').replace(/[-_]/g, ' '),
      });
    }
    if (node.type === 'directory' && node.children) {
      collectAllPages(node.children, result);
    }
  }
  return result;
}

export default function ReaderPage() {
  const { '*': slugPath } = useParams();
  const navigate = useNavigate();
  const [repoConfig, setRepoConfigState] = useState<RepoConfig | null>(null);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [body, setBody] = useState('');
  const [frontmatter, setFrontmatter] = useState<Frontmatter | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentSlug = slugPath || '';

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }
    const config = getRepoConfig();
    setRepoConfigState(config);
    if (config) {
      fetchFileTree(config).then(setFiles);
    }
  }, []);

  const allPages = useMemo(() => collectAllPages(files), [files]);
  const currentIndex = allPages.findIndex((p) => p.slug === currentSlug);

  // Load content when slug or files change
  useEffect(() => {
    if (files.length === 0) return;
    let cancelled = false;

    (async () => {
      setLoading(true);

      if (!currentSlug) {
        const first = allPages[0];
        if (first) {
          navigate(`/docs/${first.slug}`, { replace: true });
          return;
        }
      }

      const page = allPages.find((p) => p.slug === currentSlug);
      if (!page) {
        setBody('# 页面未找到\n\n请从侧边栏选择一个文档。');
        setFrontmatter(null);
        setLoading(false);
        return;
      }

      try {
        const { content } = await readFile(page.path);
        if (cancelled) return;
        const { frontmatter: fm, body: b } = parseFrontmatter(content);
        setFrontmatter(fm);
        setBody(b);
      } catch {
        setBody('# 加载失败\n\n无法读取该文档。');
        setFrontmatter(null);
      }
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [currentSlug, files, allPages, navigate]);

  const toc = useMemo(() => extractToc(body), [body]);
  const prevPage = currentIndex > 0 ? allPages[currentIndex - 1] : null;
  const nextPage = currentIndex >= 0 && currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null;

  const navigateToSlug = (slug: string) => {
    navigate(`/docs/${slug}`);
  };

  return (
    <div className="tome-reader">
      {sidebarOpen && (
        <div className="tome-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`tome-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <DocsSidebar
          projectName={repoConfig ? `${repoConfig.owner}/${repoConfig.repo}` : ''}
          files={files}
          currentSlug={currentSlug}
          onNavigate={navigateToSlug}
        />
      </aside>

      <div className="tome-main">
        <header className="tome-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="tome-mobile-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
            <nav className="tome-breadcrumb">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>ADoc</a>
              <span className="tome-breadcrumb-sep">/</span>
              <span>{repoConfig ? `${repoConfig.owner}/${repoConfig.repo}` : ''}</span>
              {currentSlug && (
                <>
                  <span className="tome-breadcrumb-sep">/</span>
                  <span>{currentSlug.split('/').pop()}</span>
                </>
              )}
            </nav>
          </div>
          <div className="tome-header-actions">
            <a
              className="tome-edit-btn"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/edit');
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              编辑此页
            </a>
          </div>
        </header>

        <div className="tome-content-wrapper">
          <article className="tome-content-main">
            {loading ? (
              <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--tome-tx-muted)' }}>
                加载中...
              </div>
            ) : (
              <>
                {frontmatter?.title && (
                  <h1 className="tome-page-title">{frontmatter.title}</h1>
                )}
                {frontmatter?.description && (
                  <p className="tome-page-description">{frontmatter.description}</p>
                )}

                <div className="tome-content">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      h2: ({ children, ...props }) => {
                        const text = String(children || '');
                        const hid = text.toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '');
                        return <h2 id={hid} {...props}>{children}</h2>;
                      },
                      h3: ({ children, ...props }) => {
                        const text = String(children || '');
                        const hid = text.toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '');
                        return <h3 id={hid} {...props}>{children}</h3>;
                      },
                      h4: ({ children, ...props }) => {
                        const text = String(children || '');
                        const hid = text.toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '');
                        return <h4 id={hid} {...props}>{children}</h4>;
                      },
                    }}
                  >
                    {body}
                  </ReactMarkdown>
                </div>

                {(prevPage || nextPage) && (
                  <nav className="tome-footer-nav">
                    {prevPage ? (
                      <a
                        className="tome-footer-nav-btn"
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          navigateToSlug(prevPage.slug);
                        }}
                      >
                        <span>← 上一页</span>
                        <span>{prevPage.name}</span>
                      </a>
                    ) : (
                      <div style={{ flex: 1 }} />
                    )}
                    {nextPage ? (
                      <a
                        className="tome-footer-nav-btn next"
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          navigateToSlug(nextPage.slug);
                        }}
                      >
                        <span>下一页 →</span>
                        <span>{nextPage.name}</span>
                      </a>
                    ) : (
                      <div style={{ flex: 1 }} />
                    )}
                  </nav>
                )}
              </>
            )}
          </article>

          {toc.length > 0 && (
            <aside className="tome-toc">
              <div className="tome-toc-title">目录</div>
              {toc.map((item) => (
                <a
                  key={item.id}
                  className="tome-toc-link"
                  data-level={item.level}
                  href={`#${item.id}`}
                >
                  {item.text}
                </a>
              ))}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
