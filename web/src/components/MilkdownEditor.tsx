import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Editor, rootCtx, defaultValueCtx, editorViewCtx, serializerCtx } from '@milkdown/core';
import { commonmark, toggleStrongCommand, toggleEmphasisCommand, wrapInHeadingCommand, wrapInBulletListCommand, wrapInOrderedListCommand, insertHrCommand, toggleInlineCodeCommand, wrapInBlockquoteCommand, insertImageCommand, turnIntoTextCommand } from '@milkdown/preset-commonmark';
import { gfm, toggleStrikethroughCommand, insertTableCommand } from '@milkdown/preset-gfm';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { history } from '@milkdown/plugin-history';
import { clipboard } from '@milkdown/plugin-clipboard';
import { callCommand } from '@milkdown/utils';
import Toolbar from './Toolbar';

export interface MilkdownEditorHandle {
  getMarkdown: () => string;
  setMarkdown: (md: string) => void;
}

interface MilkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  suggestMode?: boolean;
}

const MilkdownEditor = forwardRef<MilkdownEditorHandle, MilkdownEditorProps>(
  ({ value, onChange, readOnly = false, suggestMode = false }, ref) => {
    const editorRef = useRef<Editor | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const onChangeRef = useRef(onChange);
    const isSettingValue = useRef(false);
    const currentValueRef = useRef(value);

    onChangeRef.current = onChange;
    currentValueRef.current = value;

    const execCommand = useCallback((command: any, payload?: any) => {
      if (!editorRef.current) return;
      editorRef.current.action(callCommand(command, payload));
    }, []);

    useImperativeHandle(ref, () => ({
      getMarkdown: () => {
        if (!editorRef.current) return '';
        let md = '';
        editorRef.current.action((ctx) => {
          const view = ctx.get(editorViewCtx);
          const serializer = ctx.get(serializerCtx);
          md = serializer(view.state.doc);
        });
        return md;
      },
      setMarkdown: (md: string) => {
        // Destroy and recreate to load new content
        if (editorRef.current) {
          isSettingValue.current = true;
          editorRef.current.destroy();
          editorRef.current = null;
          initEditor(md);
        }
      },
    }), []);

    const initEditor = useCallback(async (initialValue: string) => {
      if (!containerRef.current) return;
      // Clear container
      containerRef.current.innerHTML = '';

      const builder = Editor.make()
        .config((ctx) => {
          ctx.set(rootCtx, containerRef.current!);
          ctx.set(defaultValueCtx, initialValue);
          ctx.get(listenerCtx).markdownUpdated((_ctx, markdown, prevMarkdown) => {
            if (isSettingValue.current) {
              isSettingValue.current = false;
              return;
            }
            if (markdown !== prevMarkdown) {
              onChangeRef.current(markdown);
            }
          });
        })
        .use(commonmark)
        .use(gfm)
        .use(listener)
        .use(history)
        .use(clipboard);

      const editor = await builder.create();
      editorRef.current = editor;
    }, []);

    useEffect(() => {
      initEditor(value);
      return () => {
        if (editorRef.current) {
          editorRef.current.destroy();
          editorRef.current = null;
        }
      };
    }, []);

    // When value changes externally (file switch), reinit
    const prevValueRef = useRef(value);
    useEffect(() => {
      if (value !== prevValueRef.current && editorRef.current) {
        prevValueRef.current = value;
        editorRef.current.destroy();
        editorRef.current = null;
        initEditor(value);
      }
    }, [value]);

    const handleToolbar = useCallback((action: string) => {
      switch (action) {
        case 'bold':
          execCommand(toggleStrongCommand.key);
          break;
        case 'italic':
          execCommand(toggleEmphasisCommand.key);
          break;
        case 'strikethrough':
          execCommand(toggleStrikethroughCommand.key);
          break;
        case 'code':
          execCommand(toggleInlineCodeCommand.key);
          break;
        case 'h1':
          execCommand(wrapInHeadingCommand.key, 1);
          break;
        case 'h2':
          execCommand(wrapInHeadingCommand.key, 2);
          break;
        case 'h3':
          execCommand(wrapInHeadingCommand.key, 3);
          break;
        case 'paragraph':
          execCommand(turnIntoTextCommand.key);
          break;
        case 'bullet-list':
          execCommand(wrapInBulletListCommand.key);
          break;
        case 'ordered-list':
          execCommand(wrapInOrderedListCommand.key);
          break;
        case 'blockquote':
          execCommand(wrapInBlockquoteCommand.key);
          break;
        case 'hr':
          execCommand(insertHrCommand.key);
          break;
        case 'table':
          execCommand(insertTableCommand.key);
          break;
        case 'image':
          const url = prompt('输入图片 URL:');
          if (url) {
            execCommand(insertImageCommand.key, { src: url, alt: '' });
          }
          break;
        case 'link': {
          if (!editorRef.current) break;
          editorRef.current.action((ctx) => {
            const view = ctx.get(editorViewCtx);
            const { from, to } = view.state.selection;
            const selectedText = view.state.doc.textBetween(from, to);
            const href = prompt('输入链接 URL:', 'https://');
            if (href) {
              const linkMark = view.state.schema.marks.link.create({ href });
              const tr = view.state.tr;
              if (selectedText) {
                tr.addMark(from, to, linkMark);
              } else {
                const linkText = prompt('输入链接文本:', href) || href;
                const textNode = view.state.schema.text(linkText, [linkMark]);
                tr.replaceSelectionWith(textNode);
              }
              view.dispatch(tr);
            }
          });
          break;
        }
      }
    }, [execCommand]);

    return (
      <div className="milkdown-editor-wrapper flex flex-col h-full">
        <Toolbar
          onAction={handleToolbar}
          suggestMode={suggestMode}
        />
        <div
          ref={containerRef}
          className={`milkdown-container flex-1 overflow-y-auto ${readOnly ? 'opacity-70 pointer-events-none' : ''} ${suggestMode ? 'suggest-mode' : ''}`}
        />
      </div>
    );
  }
);

MilkdownEditor.displayName = 'MilkdownEditor';

export default MilkdownEditor;
