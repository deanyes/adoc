interface ToolbarProps {
  onAction: (action: string) => void;
  suggestMode?: boolean;
}

const TOOLBAR_GROUPS: { label: string; items: { action: string; label: string; title: string; className?: string }[] }[] = [
  {
    label: '格式',
    items: [
      { action: 'h1', label: 'H1', title: '标题 1' },
      { action: 'h2', label: 'H2', title: '标题 2' },
      { action: 'h3', label: 'H3', title: '标题 3' },
      { action: 'paragraph', label: 'P', title: '正文' },
    ],
  },
  {
    label: '样式',
    items: [
      { action: 'bold', label: 'B', title: '加粗', className: 'font-bold' },
      { action: 'italic', label: 'I', title: '斜体', className: 'italic' },
      { action: 'strikethrough', label: 'S', title: '删除线', className: 'line-through' },
      { action: 'code', label: '<>', title: '行内代码', className: 'font-mono text-[11px]' },
    ],
  },
  {
    label: '插入',
    items: [
      { action: 'bullet-list', label: '•', title: '无序列表' },
      { action: 'ordered-list', label: '1.', title: '有序列表' },
      { action: 'blockquote', label: '"', title: '引用' },
      { action: 'hr', label: '—', title: '分隔线' },
    ],
  },
  {
    label: '富文本',
    items: [
      { action: 'link', label: '🔗', title: '链接' },
      { action: 'image', label: '🖼', title: '图片' },
      { action: 'table', label: '⊞', title: '表格' },
    ],
  },
];

export default function Toolbar({ onAction, suggestMode }: ToolbarProps) {
  return (
    <div className="toolbar flex items-center gap-0.5 px-4 py-2 border-b border-gray-100 bg-white flex-shrink-0">
      {TOOLBAR_GROUPS.map((group, gi) => (
        <div key={gi} className="flex items-center gap-0.5">
          {gi > 0 && <div className="w-px h-5 bg-gray-150 mx-2" style={{ backgroundColor: '#E5E7EB' }} />}
          {group.items.map((item) => (
            <button
              key={item.action}
              onClick={() => onAction(item.action)}
              title={item.title}
              className={`toolbar-btn ${item.className || ''}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      ))}
      {suggestMode && (
        <>
          <div className="w-px h-5 mx-2" style={{ backgroundColor: '#E5E7EB' }} />
          <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md font-medium">
            建议模式
          </span>
        </>
      )}
    </div>
  );
}
