import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Link } from 'lucide-react';
import { cn, compressImage } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      // Only update innerHTML if it differs from current content to avoid cursor jumping
      if (!editorRef.current.contains(document.activeElement)) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          try {
            const compressedBase64 = await compressImage(file);
            document.execCommand('insertImage', false, compressedBase64);
            // By default images don't have style width set. The click handler below manages it.
          } catch (err) {
            console.error("Failed to process image", err);
          }
        }
        return; // Handled the image paste
      }
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLImageElement) {
      if (e.shiftKey) {
        e.target.remove();
        handleInput();
        return;
      }
      // Toggle width to allow simple resizing
      if (!e.target.style.width || e.target.style.width === '100%') {
        e.target.style.width = '50%';
      } else if (e.target.style.width === '50%') {
        e.target.style.width = '25%';
      } else {
        e.target.style.width = '100%';
      }
      e.target.style.cursor = 'pointer';
      e.target.title = 'Click to resize. Shift+Click to delete.';
      handleInput(); // Trigger save
    }
  };

  return (
    <div className="w-full flex flex-col bg-zinc-950/50 border border-zinc-800 rounded-2xl overflow-hidden focus-within:border-primary/50 transition-all">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-zinc-800 bg-zinc-900/50">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          title="Underline"
        >
          <Underline size={16} />
        </button>
        <div className="w-px h-6 bg-zinc-800 mx-1" />
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>
        <div className="w-px h-6 bg-zinc-800 mx-1" />
        <button
          type="button"
          onClick={() => {
            const url = prompt('Enter link URL:');
            if (url) execCommand('createLink', url);
          }}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          title="Insert Link"
        >
          <Link size={16} />
        </button>
      </div>
      
      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        onPaste={handlePaste}
        onClick={handleClick}
        className="px-8 py-8 min-h-[300px] outline-none font-medium text-lg leading-relaxed text-white empty:before:content-[attr(data-placeholder)] empty:before:text-zinc-700 cursor-text markdown-content prose prose-invert prose-blue max-w-none"
        data-placeholder={placeholder}
      />
    </div>
  );
}
