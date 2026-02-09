import React, { useRef, useEffect, useState } from 'react';
import { useStore } from '../../store';
import { Block as BlockData, BlockType } from '../../types';
import { GripVertical, CheckSquare, Square, ChevronRight, MoreHorizontal, Copy, Trash2, ArrowUp, ArrowDown, Plus, Github, ExternalLink, Bug, Play, Link as LinkIcon } from 'lucide-react';
import clsx from 'clsx';

interface BlockProps {
  block: BlockData;
  index: number;
  isFocused: boolean;
  onUpdate: (id: string, content: string, type?: BlockType) => void;
  onAddBlock: (afterIndex: number) => void;
  onDeleteBlock: (id: string) => void;
  onFocus: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onTypeChange: (id: string, type: BlockType) => void;
  onOpenSlashMenu: (rect: DOMRect, blockId: string) => void;
}

const Block: React.FC<BlockProps> = ({
  block,
  index,
  isFocused,
  onUpdate,
  onAddBlock,
  onDeleteBlock,
  onFocus,
  onMoveUp,
  onMoveDown,
  onTypeChange,
  onOpenSlashMenu
}) => {
  const { state, dispatch } = useStore();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Focus handling
  useEffect(() => {
    if (isFocused && contentRef.current) {
        contentRef.current.focus();
    }
  }, [isFocused]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === '/') {
        const rect = contentRef.current?.getBoundingClientRect();
        if(rect) onOpenSlashMenu(rect, block.id);
    }
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onAddBlock(index);
    }
    
    if (e.key === 'Backspace' && block.content === '' && block.type === 'text') {
      e.preventDefault();
      onDeleteBlock(block.id);
    }

    if (e.key === 'ArrowUp') {
        const selection = window.getSelection();
        if(selection?.anchorOffset === 0 || block.type === 'divider' || block.type === 'table') {
             onMoveUp(index);
        }
    }

    if (e.key === 'ArrowDown') {
         onMoveDown(index);
    }
  };

  const handleChange = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.innerText;
    onUpdate(block.id, text);
  };

  const handleToggle = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dispatch({ 
          type: 'UPDATE_BLOCK_PROP', 
          payload: { pageId: state.currentPageId!, blockId: block.id, key: 'isOpen', value: !block.isOpen } 
      });
  };

  const handleCheckbox = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dispatch({ 
          type: 'UPDATE_BLOCK_PROP', 
          payload: { pageId: state.currentPageId!, blockId: block.id, key: 'checked', value: !block.properties?.checked } 
      });
  };

  // --- Complex Block Renderers ---

  const renderTable = () => {
      const headers = block.properties?.headers || ['Name', 'Tags', 'Status'];
      const rows = block.properties?.rows || [
          ['Task 1', 'Urgent', 'To Do'],
          ['Task 2', 'Dev', 'In Progress']
      ];

      return (
      <div className="w-full my-4 overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
              <thead>
                  <tr className="bg-gray-100 dark:bg-notion-dark-hover">
                      {headers.map((h: string, i: number) => (
                          <th key={i} className="border border-gray-300 dark:border-gray-700 p-2 text-left text-sm font-semibold text-notion-dim">{h}</th>
                      ))}
                  </tr>
              </thead>
              <tbody>
                  {rows.map((row: string[], i: number) => (
                      <tr key={i}>
                          {row.map((cell: string, j: number) => (
                              <td key={j} className="border border-gray-300 dark:border-gray-700 p-2 text-sm">{cell}</td>
                          ))}
                      </tr>
                  ))}
              </tbody>
          </table>
          <div className="text-xs text-gray-400 mt-1 flex items-center cursor-pointer hover:text-gray-600"><Plus size={12} className="mr-1"/> New row</div>
      </div>
      );
  };

  const renderBoard = () => {
      const columns = block.properties?.columns || [
          { name: 'To Do', items: ['Project Kickoff'] },
          { name: 'In Progress', items: ['Design Review'] },
          { name: 'Done', items: ['Requirements'] }
      ];

      return (
      <div className="flex space-x-4 overflow-x-auto pb-4 my-4 w-full">
          {columns.map((col: any, i: number) => (
              <div key={i} className="min-w-[200px] flex-1 bg-gray-50 dark:bg-notion-dark-hover rounded p-2">
                  <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase">{col.name}</span>
                      <Plus size={14} className="text-gray-400 cursor-pointer" />
                  </div>
                  {col.items.map((item: string, j: number) => (
                      <div key={j} className="bg-white dark:bg-notion-dark-sidebar p-2 rounded shadow-sm mb-2 border border-gray-200 dark:border-gray-700 text-sm">
                          {item}
                      </div>
                  ))}
              </div>
          ))}
      </div>
      );
  };

  const renderCalendar = () => (
      <div className="w-full my-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="bg-gray-50 dark:bg-notion-dark-hover p-2 text-center font-semibold text-sm border-b border-gray-200 dark:border-gray-700">
              {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </div>
          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
              {Array.from({length: 31}).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-notion-dark-bg h-20 p-1 relative hover:bg-gray-50 dark:hover:bg-notion-dark-sidebar transition-colors">
                      <span className="text-xs text-gray-400">{i+1}</span>
                      {i === 14 && <div className="text-[10px] bg-blue-100 text-blue-800 px-1 rounded mt-1 truncate">Deadline</div>}
                  </div>
              ))}
          </div>
      </div>
  );

  const renderGithub = () => (
      <div className="w-full my-4 border border-gray-200 dark:border-gray-700 rounded-md p-3 flex items-start hover:bg-gray-50 dark:hover:bg-notion-dark-hover transition-colors cursor-pointer">
          <Github size={24} className="mr-3 text-gray-800 dark:text-white" />
          <div className="flex-1">
              <div className="flex items-center text-xs text-gray-500 mb-0.5">
                  <span>facebook/react</span>
                  <span className="mx-1">•</span>
                  <span>#12345</span>
                  <span className="mx-1">•</span>
                  <span className="text-green-600 bg-green-100 px-1.5 rounded-full">Open</span>
              </div>
              <div className="font-medium text-sm text-notion-text dark:text-notion-dark-text mb-1">
                  Improve concurrent rendering performance
              </div>
              <div className="text-xs text-gray-500">
                  Detailed implementation of the new fiber architecture updates...
              </div>
          </div>
          <ExternalLink size={14} className="text-gray-400" />
      </div>
  );

  const renderJira = () => (
      <div className="w-full my-4 border border-gray-200 dark:border-gray-700 rounded-md p-3 flex items-start hover:bg-gray-50 dark:hover:bg-notion-dark-hover transition-colors cursor-pointer border-l-4 border-l-blue-500">
          <Bug size={24} className="mr-3 text-blue-500" />
          <div className="flex-1">
              <div className="flex items-center text-xs text-gray-500 mb-0.5">
                  <span className="font-bold">PROJ-1024</span>
                  <span className="mx-1">•</span>
                  <span className="bg-yellow-100 text-yellow-800 px-1.5 rounded text-[10px] uppercase font-bold">In Progress</span>
              </div>
              <div className="font-medium text-sm text-notion-text dark:text-notion-dark-text mb-1">
                  Implement new authentication flow
              </div>
          </div>
          <div className="flex -space-x-2">
               <img className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800" src="https://i.pravatar.cc/150?u=1" alt="Assignee" />
          </div>
      </div>
  );

  const renderVideo = () => (
      <div className="w-full my-4 bg-black rounded-lg h-64 flex items-center justify-center relative group cursor-pointer">
           <div className="text-white flex flex-col items-center">
               <Play size={48} className="opacity-80 group-hover:opacity-100 transition-opacity" />
               <span className="mt-2 text-sm opacity-60">Video Placeholder</span>
           </div>
      </div>
  );

  const renderEmbed = () => (
      <div className="w-full my-4 border border-gray-200 dark:border-gray-700 rounded-md p-3 flex items-center hover:bg-gray-50 dark:hover:bg-notion-dark-hover transition-colors cursor-pointer">
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded mr-3">
              <LinkIcon size={20} className="text-gray-500" />
          </div>
          <div className="flex-1">
              <div className="font-medium text-sm text-notion-text dark:text-notion-dark-text">Figma Design System</div>
              <div className="text-xs text-gray-500 truncate">https://www.figma.com/file/xyz...</div>
          </div>
      </div>
  );

  const renderContent = () => {
     const commonProps = {
        ref: contentRef,
        contentEditable: true,
        suppressContentEditableWarning: true,
        className: "outline-none min-h-[1.5em] empty:before:content-[attr(placeholder)] empty:before:text-gray-400 cursor-text w-full",
        onKeyDown: handleKeyDown,
        onInput: handleChange,
        onFocus: () => onFocus(index),
        placeholder: block.type === 'text' ? "Type '/' for commands" : `Heading ${block.type.replace('h', '')}`
     };

     // Sync content changes
     useEffect(() => {
         if (contentRef.current && contentRef.current.innerText !== block.content) {
             contentRef.current.innerText = block.content;
         }
     }, [block.content]);

     switch (block.type) {
        case 'h1':
            return <div {...commonProps} className={clsx(commonProps.className, "text-4xl font-bold mb-2 mt-4")} placeholder="Heading 1" />;
        case 'h2':
            return <div {...commonProps} className={clsx(commonProps.className, "text-3xl font-semibold mb-2 mt-3")} placeholder="Heading 2" />;
        case 'h3':
            return <div {...commonProps} className={clsx(commonProps.className, "text-2xl font-semibold mb-1 mt-2")} placeholder="Heading 3" />;
        case 'quote':
            return (
                <div className="flex border-l-4 border-notion-text dark:border-notion-dark-text pl-4 my-2 italic">
                     <div {...commonProps} className={clsx(commonProps.className, "text-lg")} placeholder="Quote" />
                </div>
            );
        case 'callout':
            return (
                <div className="flex p-4 bg-gray-100 dark:bg-notion-dark-sidebar rounded-md my-2">
                    <span className="mr-3 text-xl">💡</span>
                    <div {...commonProps} className={clsx(commonProps.className)} placeholder="Callout text..." />
                </div>
            );
        case 'code':
            return (
                <div className="bg-gray-100 dark:bg-notion-dark-sidebar p-4 rounded-md font-mono text-sm my-2 w-full relative group/code">
                    <div className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 text-xs text-gray-400">javascript</div>
                    <div {...commonProps} className={clsx(commonProps.className, "text-notion-blue dark:text-blue-400")} placeholder="Write code..." />
                </div>
            );
        case 'todo':
            return (
                <div className="flex items-start my-1 w-full">
                    <div className="mr-2 mt-1 cursor-pointer text-notion-blue select-none" contentEditable={false} onClick={handleCheckbox}>
                        {block.properties?.checked ? <CheckSquare size={18} /> : <Square size={18} />}
                    </div>
                    <div {...commonProps} className={clsx(commonProps.className, block.properties?.checked && "line-through text-gray-400")} placeholder="To-do" />
                </div>
            );
        case 'toggle':
             return (
                 <div className="w-full">
                    <div className="flex items-start my-1 w-full">
                        <div 
                            className="mr-1 mt-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 rounded p-0.5 select-none text-notion-text dark:text-notion-dark-text" 
                            contentEditable={false}
                            onClick={handleToggle}
                        >
                            <ChevronRight size={18} className={clsx("transform transition-transform", block.isOpen && "rotate-90")} />
                        </div>
                        <div {...commonProps} className={clsx(commonProps.className)} placeholder="Toggle list" />
                    </div>
                    {block.isOpen && block.children && block.children.length > 0 && (
                        <div className="pl-6 ml-2 border-l border-gray-200 dark:border-gray-800">
                             {block.children.map((childBlock, i) => (
                                 <div key={childBlock.id} className="py-1 text-sm text-gray-600 dark:text-gray-300">
                                     <div>{childBlock.content}</div>
                                 </div>
                             ))}
                        </div>
                    )}
                 </div>
             );
        case 'bullet-list':
             return (
                 <div className="flex items-start my-1 w-full">
                     <div className="mr-2 mt-2 w-1.5 h-1.5 bg-black dark:bg-white rounded-full flex-shrink-0" contentEditable={false} />
                     <div {...commonProps} className={clsx(commonProps.className)} placeholder="List item" />
                 </div>
             );
        case 'image':
             return (
                 <div className="my-2 w-full" contentEditable={false}>
                     <img src={block.content || 'https://picsum.photos/800/400'} className="rounded-md w-full max-w-2xl object-cover h-64" alt="Block attachment" />
                     <div className="text-xs text-center text-gray-400 mt-1">Add caption</div>
                 </div>
             );
        case 'divider':
            return (
                <div className="py-2 cursor-pointer w-full" onClick={() => onFocus(index)}>
                    <hr className="border-t border-gray-300 dark:border-gray-700" />
                </div>
            );
        case 'table': return renderTable();
        case 'board': return renderBoard();
        case 'calendar': return renderCalendar();
        case 'chart': 
            return (
                <div className="my-4 p-4 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-notion-dark-sidebar flex items-end h-40 space-x-2">
                    {[40, 70, 45, 90, 60, 80].map((h, i) => (
                        <div key={i} className="flex-1 bg-notion-blue opacity-80 hover:opacity-100 transition-opacity rounded-t" style={{ height: `${h}%` }}></div>
                    ))}
                </div>
            );
        case 'github': return renderGithub();
        case 'jira': return renderJira();
        case 'video': return renderVideo();
        case 'embed': return renderEmbed();
        default: // text
            return <div {...commonProps} className={clsx(commonProps.className, "my-1")} />;
     }
  };

  return (
    <div 
        className="group flex items-start -ml-8 pl-2 pr-4 py-[1px] relative rounded hover:bg-notion-hover/30 dark:hover:bg-notion-dark-hover/20"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    >
      {/* Drag Handle / Menu Trigger */}
      <div 
        className={clsx(
            "absolute left-[-24px] top-1.5 p-0.5 rounded cursor-grab active:cursor-grabbing text-notion-dim hover:text-notion-text transition-opacity flex items-center justify-center select-none",
            (isHovered || showMenu) ? "opacity-100" : "opacity-0"
        )}
        contentEditable={false}
        onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
      >
        <GripVertical size={18} />
      </div>

      {/* Block Context Menu */}
      {showMenu && (
          <div className="absolute left-[-160px] top-6 w-40 bg-white dark:bg-notion-dark-sidebar shadow-xl rounded-md border border-gray-200 dark:border-gray-700 z-50 flex flex-col py-1" onMouseLeave={() => setShowMenu(false)}>
              <button className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { onDeleteBlock(block.id); setShowMenu(false); }}>
                  <Trash2 size={14} className="mr-2" /> Delete
              </button>
              <button className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { onMoveUp(index); setShowMenu(false); }}>
                  <ArrowUp size={14} className="mr-2" /> Move Up
              </button>
              <button className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { onMoveDown(index); setShowMenu(false); }}>
                  <ArrowDown size={14} className="mr-2" /> Move Down
              </button>
          </div>
      )}
      
      {/* Click outside to close menu */}
      {showMenu && <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />}

      <div className="flex-1 min-w-0 relative">
        {renderContent()}
      </div>
    </div>
  );
};

export default Block;
