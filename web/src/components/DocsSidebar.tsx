import type { FileNode } from '../github';

const groupLabels: Record<string, string> = {
  pages: '文档',
  changelog: '版本更新',
  faq: '常见问题',
  getseed: '录音卡',
  'getting-started': '快速开始',
  'knowledge-base': '知识库',
  recording: '记录方式',
  shortcuts: '快捷操作',
  testimonials: '社区精选',
  'use-cases': '用户案例',
};

function pathToSlug(path: string): string {
  return path.replace(/^pages\//, '').replace(/\.(md|mdx|markdown)$/i, '');
}

function prettyName(name: string): string {
  return name
    .replace(/\.(md|mdx|markdown)$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function collectGroups(
  nodes: FileNode[],
  parentName?: string
): { group: string; items: { name: string; path: string; slug: string }[] }[] {
  const result: { group: string; items: { name: string; path: string; slug: string }[] }[] = [];

  const files = nodes.filter(
    (n) => n.type === 'file' && /\.(md|mdx|markdown)$/i.test(n.name)
  );
  if (files.length > 0) {
    result.push({
      group: parentName || '',
      items: files.map((f) => ({
        name: prettyName(f.name),
        path: f.path,
        slug: pathToSlug(f.path),
      })),
    });
  }

  const dirs = nodes.filter((n) => n.type === 'directory' && n.children);
  for (const dir of dirs) {
    const sub = collectGroups(dir.children!, dir.name);
    result.push(...sub);
  }

  return result;
}

interface DocsSidebarProps {
  projectName?: string;
  files: FileNode[];
  currentSlug?: string;
  onNavigate: (slug: string) => void;
}

export default function DocsSidebar({ projectName, files, currentSlug, onNavigate }: DocsSidebarProps) {
  const groups = collectGroups(files);

  return (
    <>
      <div className="tome-sidebar-header">
        <span className="tome-sidebar-brand">{projectName || 'ADoc'}</span>
      </div>
      <nav className="tome-sidebar-nav">
        {groups.map((g) => (
          <div key={g.group} className="tome-nav-group">
            {g.group && (
              <div className="tome-nav-group-label">
                {groupLabels[g.group] || g.group}
              </div>
            )}
            {g.items.map((item) => (
              <a
                key={item.path}
                className={`tome-nav-item ${item.slug === currentSlug ? 'active' : ''}`}
                href={`#${item.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.slug);
                }}
              >
                {item.name}
              </a>
            ))}
          </div>
        ))}
      </nav>
    </>
  );
}
