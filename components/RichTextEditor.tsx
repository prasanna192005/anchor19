import React, { useRef, useEffect, useState } from 'react';
import { 
  Bold, Italic, Underline, List, ListOrdered, Link,
  Heading1, Heading2, Quote, CheckSquare, Code, Minus, MessageSquare, Clock
} from 'lucide-react';
import { cn, compressImage } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const insertBlock = (exec: any, html: string, focusSelector: string = '', selectAll: boolean = false) => {
  const id = `block-${Date.now()}`;
  const modifiedHtml = html.replace(/^<([a-z]+)/i, `<$1 id="${id}"`);
  exec('insertHTML', modifiedHtml + '<div><br></div>');
  
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) {
      el.removeAttribute('id');
      const target = focusSelector ? el.querySelector(focusSelector) : el;
      if (target) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(target);
        if (!selectAll) {
          range.collapse(true);
        }
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  }, 50);
};

const SLASH_COMMANDS = [
  { id: 'h1', title: 'Heading 1', icon: Heading1, action: (exec: any) => exec('formatBlock', 'H1') },
  { id: 'h2', title: 'Heading 2', icon: Heading2, action: (exec: any) => exec('formatBlock', 'H2') },
  { id: 'quote', title: 'Quote', icon: Quote, action: (exec: any) => exec('formatBlock', 'BLOCKQUOTE') },
  { id: 'bullet', title: 'Bullet List', icon: List, action: (exec: any) => exec('insertUnorderedList') },
  { id: 'number', title: 'Numbered List', icon: ListOrdered, action: (exec: any) => exec('insertOrderedList') },
  { id: 'check', title: 'Checklist', icon: CheckSquare, action: (exec: any) => insertBlock(exec, '<div class="checklist-item flex items-center gap-3 my-1"><input type="checkbox" class="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-primary cursor-pointer focus:ring-primary" /><span class="outline-none flex-1">Task...</span></div>', 'span', true) },
  { id: 'code', title: 'Code Block', icon: Code, action: (exec: any) => insertBlock(exec, '<pre class="code-block bg-zinc-950 border border-zinc-800 rounded-xl p-4 my-4 font-mono text-sm overflow-x-auto text-zinc-300"><code>// Code</code></pre>', 'code', true) },
  { id: 'callout', title: 'Callout', icon: MessageSquare, action: (exec: any) => insertBlock(exec, '<div class="callout-block p-4 my-4 bg-primary/10 border-l-4 border-primary rounded-r-xl text-zinc-300"><span class="font-bold text-primary">Callout:</span>&nbsp;<span>Text...</span></div>', 'span:last-child', true) },
  { id: 'divider', title: 'Divider', icon: Minus, action: (exec: any) => exec('insertHTML', '<hr class="border-zinc-800 my-6" /><div><br></div>') },
  { id: 'time', title: 'Timestamp', icon: Clock, action: (exec: any) => { const time = new Date().toLocaleString(); exec('insertHTML', `<span class="px-2 py-1 bg-zinc-800 text-zinc-400 font-mono text-xs rounded-md shadow-sm">${time}</span>&nbsp;`); } },
];

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0 });
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCommands = SLASH_COMMANDS.filter(cmd => 
    cmd.title.toLowerCase().includes(query.toLowerCase()) || 
    cmd.id.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      if (!editorRef.current.contains(document.activeElement)) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const execCommand = (command: string, val: string = '') => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setQuery('');
    setSelectedIndex(0);
  };

  const executeSlashCommand = (action: (exec: any) => void) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;
    
    if (textNode.nodeType === Node.TEXT_NODE) {
      const text = textNode.textContent || '';
      const offset = range.startOffset;
      const textBeforeCaret = text.substring(0, offset);
      const slashIndex = textBeforeCaret.lastIndexOf('/');
      
      if (slashIndex !== -1) {
        const deleteRange = document.createRange();
        deleteRange.setStart(textNode, slashIndex);
        deleteRange.setEnd(textNode, offset);
        deleteRange.deleteContents();
      }
    }
    
    action(execCommand);
    closeMenu();
  };

  const captureCoords = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0).cloneRange();
    range.collapse(false);
    const rect = range.getBoundingClientRect();
    if (rect.x === 0 && rect.y === 0) return null;
    
    return { 
      top: rect.bottom + 4, 
      left: rect.left 
    };
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isMenuOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands.length > 0) {
          executeSlashCommand(filteredCommands[selectedIndex].action);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu();
      }
      return;
    } 

    if (e.key === '/') {
      setTimeout(() => {
        const coords = captureCoords();
        if (coords) {
          setMenuCoords(coords);
          setIsMenuOpen(true);
          setQuery('');
          setSelectedIndex(0);
        }
      }, 10);
    } else if (e.key === 'Enter' || e.key === 'Escape') {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const node = selection.anchorNode;
      if (!node) return;
      const element = node.nodeType === Node.ELEMENT_NODE ? node as HTMLElement : node.parentElement;
      if (!element) return;
      
      const pre = element.closest('.code-block');
      const callout = element.closest('.callout-block');
      const checklist = element.closest('.checklist-item');
      const targetBlock = pre || callout;
      
      // Escape mechanism: Escape, Ctrl+Enter, or Shift+Enter inside a complex block
      if (targetBlock && (e.key === 'Escape' || (e.key === 'Enter' && (e.shiftKey || e.ctrlKey || e.metaKey)))) {
        e.preventDefault();
        
        let next = targetBlock.nextSibling;
        if (!next || (next.nodeType === Node.ELEMENT_NODE && (next as HTMLElement).tagName !== 'DIV' && (next as HTMLElement).tagName !== 'P')) {
          const div = document.createElement('div');
          div.innerHTML = '<br>';
          targetBlock.parentNode?.insertBefore(div, targetBlock.nextSibling);
          next = div;
        }
        
        const range = document.createRange();
        range.setStart(next!, 0);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        handleInput();
        return;
      }

      // Inside Code Block: standard Enter creates a newline, not a new block
      if (pre && e.key === 'Enter') {
        e.preventDefault();
        document.execCommand('insertText', false, '\n');
        return;
      }

      // Inside Checklist: Enter exits to a new normal line below
      if (checklist && e.key === 'Enter') {
        e.preventDefault();
        const div = document.createElement('div');
        div.innerHTML = '<br>';
        checklist.parentNode?.insertBefore(div, checklist.nextSibling);
        
        const range = document.createRange();
        range.setStart(div, 0);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        handleInput();
        return;
      }
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (!isMenuOpen) return;
    
    if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(e.key)) return;

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const textNode = range.startContainer;
      
      if (textNode.nodeType === Node.TEXT_NODE) {
        const text = textNode.textContent || '';
        const offset = range.startOffset;
        const textBeforeCaret = text.substring(0, offset);
        const slashIndex = textBeforeCaret.lastIndexOf('/');
        
        if (slashIndex !== -1) {
          const newQuery = textBeforeCaret.substring(slashIndex + 1);
          if (newQuery.includes(' ')) {
            closeMenu();
          } else {
            setQuery(newQuery);
            setSelectedIndex(0);
          }
        } else {
          closeMenu();
        }
      } else {
        closeMenu();
      }
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
          } catch (err) {
            console.error("Failed to process image", err);
          }
        }
        return;
      }
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isMenuOpen) closeMenu();
    if (e.target instanceof HTMLImageElement) {
      if (e.shiftKey) {
        e.target.remove();
        handleInput();
        return;
      }
      if (!e.target.style.width || e.target.style.width === '100%') {
        e.target.style.width = '50%';
      } else if (e.target.style.width === '50%') {
        e.target.style.width = '25%';
      } else {
        e.target.style.width = '100%';
      }
      e.target.style.cursor = 'pointer';
      e.target.title = 'Click to resize. Shift+Click to delete.';
      handleInput();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full flex flex-col bg-zinc-950/50 border border-zinc-800 rounded-2xl overflow-hidden focus-within:border-primary/50 transition-all">
      
      {/* Slash Menu */}
      {isMenuOpen && filteredCommands.length > 0 && (
        <div 
          className="fixed z-[9999] w-64 bg-zinc-900 border border-zinc-800 shadow-2xl rounded-xl overflow-hidden py-2"
          style={{ top: menuCoords.top, left: menuCoords.left }}
        >
          <div className="px-3 pb-2 mb-2 border-b border-zinc-800/50 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            Basic Blocks
          </div>
          <div className="max-h-[300px] overflow-y-auto custom-scrollbar px-2 space-y-1">
            {filteredCommands.map((cmd, index) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={() => executeSlashCommand(cmd.action)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                    selectedIndex === index ? "bg-primary/10 text-primary" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  )}
                >
                  <Icon size={16} />
                  <span className="font-medium text-sm">{cmd.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-zinc-800 bg-zinc-900/50">
        <button type="button" onClick={() => execCommand('bold')} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors" title="Bold"><Bold size={16} /></button>
        <button type="button" onClick={() => execCommand('italic')} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors" title="Italic"><Italic size={16} /></button>
        <button type="button" onClick={() => execCommand('underline')} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors" title="Underline"><Underline size={16} /></button>
        <div className="w-px h-6 bg-zinc-800 mx-1" />
        <button type="button" onClick={() => execCommand('insertUnorderedList')} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors" title="Bullet List"><List size={16} /></button>
        <button type="button" onClick={() => execCommand('insertOrderedList')} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors" title="Numbered List"><ListOrdered size={16} /></button>
        <div className="w-px h-6 bg-zinc-800 mx-1" />
        <button type="button" onClick={() => { const url = prompt('Enter link URL:'); if (url) execCommand('createLink', url); }} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors" title="Insert Link"><Link size={16} /></button>
      </div>
      
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        onPaste={handlePaste}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        className="px-8 py-8 min-h-[300px] outline-none font-medium text-lg leading-relaxed text-white empty:before:content-[attr(data-placeholder)] empty:before:text-zinc-700 cursor-text markdown-content prose prose-invert prose-blue max-w-none relative z-10"
        data-placeholder={placeholder}
      />
    </div>
  );
}
