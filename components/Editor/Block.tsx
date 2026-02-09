
import React, { useRef, useEffect, useState } from 'react';
import { useStore } from '../../store';
import { Block as BlockData, BlockType } from '../../types';
import { GripVertical, CheckSquare, Square, ChevronRight, MoreHorizontal, Copy, Trash2, ArrowUp, ArrowDown, Plus, Github, ExternalLink, Bug, Play, Link as LinkIcon, Calendar, User, Tag, AlertCircle, Circle, Clock } from 'lucide-react';
import clsx from 'clsx';
import DatePicker from './DatePicker';

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
  
  // Date Picker State
  const [datePickerState, setDatePickerState] = useState<{
    isOpen: boolean;
    rect: { top: number; left: number };
    cellCoords?: { row: number; col: number }; // If in table
    initialDate?: string;
    initialRemind?: string;
  }>({ isOpen: false, rect: { top: 0, left: 0 } });

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

  const handleDateSave = (date: string, remindOption: string) => {
      // Logic for adding a notification
      if (remindOption !== 'None') {
          const taskName = datePickerState.cellCoords 
            ? block.properties?.rows[datePickerState.cellCoords.row][0] // Assume first col is name
            : 'Untitled';

          dispatch({
              type: 'ADD_NOTIFICATION',
              payload: {
                  title: `Reminder in`,
                  context: taskName,
                  description: `Due date: ${date}`,
                  time: 'Just now', // Simulation
                  type: 'reminder',
                  pageId: state.currentPageId!
              }
          });
      }

      // Update block data
      if (datePickerState.cellCoords) {
          // Update table cell
          const rows = [...(block.properties?.rows || [])];
          rows[datePickerState.cellCoords.row][datePickerState.cellCoords.col] = date;
          // Ideally store reminder option too, but just date for display
           dispatch({ 
              type: 'UPDATE_BLOCK_PROP', 
              payload: { pageId: state.currentPageId!, blockId: block.id, key: 'rows', value: rows } 
          });
      } else {
          // Update standalone date block
          onUpdate(block.id, date); // content = date string
          dispatch({ 
              type: 'UPDATE_BLOCK_PROP', 
              payload: { pageId: state.currentPageId!, blockId: block.id, key: 'reminderOption', value: remindOption } 
          });
      }
  };

  // --- Complex Block Renderers ---

  const renderTable = () => {
      const headers = block.properties?.headers || ['Name', 'Tags', 'Status'];
      const cols = block.properties?.columns || headers.map((h: any) => typeof h === 'string' ? { name: h, type: 'text' } : h);
      const rows = block.properties?.rows || [];

      const renderCell = (cell: any, colType: string, rowIndex: number, colIndex: number) => {
          if (colType === 'status') {
              let color = 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
              if (cell === 'In Progress' || cell === 'In progress') color = 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
              if (cell === 'Done') color = 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
              if (cell === 'High') color = 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
              return <span className={`px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap ${color}`}>{cell}</span>;
          }
          if (colType === 'date') {
              return (
                  <span 
                    className="text-sm text-gray-500 whitespace-nowrap cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-1 rounded transition-colors"
                    onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setDatePickerState({
                            isOpen: true,
                            rect: { top: rect.bottom + window.scrollY, left: rect.left + window.scrollX },
                            cellCoords: { row: rowIndex, col: colIndex },
                            initialDate: cell,
                        });
                    }}
                  >
                      {cell || 'Empty'}
                  </span>
              )
          }
          // ... (Existing renderers for other types)
          if (colType === 'select' || colType === 'priority') {
              let color = 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
              if (cell === 'High') color = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
              if (cell === 'Medium') color = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
              if (cell === 'Low') color = 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
              return <span className={`px-2 py-0.5 rounded text-xs font-medium ${color}`}>{cell}</span>;
          }
          if (colType === 'multi-select' || colType === 'tags') {
              const tags = cell.split(',').map((t: string) => t.trim());
              return (
                  <div className="flex flex-wrap gap-1">
                      {tags.map((tag: string, i: number) => {
                           let color = 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
                           if(tag === 'School') color = 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300';
                           if(tag === 'Web3') color = 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
                           return <span key={i} className={`px-1.5 py-0.5 rounded text-xs ${color}`}>{tag}</span>
                      })}
                  </div>
              )
          }
          if (colType === 'person') {
              return (
                  <div className="flex items-center space-x-1.5">
                      <img src="https://i.pravatar.cc/150?u=mir" className="w-4 h-4 rounded-full" alt="User" />
                      <span className="text-sm truncate">{cell}</span>
                  </div>
              )
          }
          return <span className="text-sm">{cell}</span>;
      };

      const getIconForType = (type: string) => {
          switch(type) {
              case 'text': return <span className="text-[10px] bg-gray-200 px-1 rounded mr-1">Aa</span>;
              case 'status': return <Circle size={12} className="mr-1" />;
              case 'person': return <User size={12} className="mr-1" />;
              case 'date': return <Calendar size={12} className="mr-1" />;
              case 'select': 
              case 'priority': return <AlertCircle size={12} className="mr-1" />;
              case 'multi-select': 
              case 'tags': return <Tag size={12} className="mr-1" />;
              default: return null;
          }
      };

      return (
      <div className="w-full my-4 overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-md">
          <table className="min-w-full border-collapse">
              <thead>
                  <tr className="bg-gray-50 dark:bg-notion-dark-hover/50 border-b border-gray-200 dark:border-gray-700">
                      {cols.map((col: any, i: number) => (
                          <th key={i} className="p-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 last:border-r-0 whitespace-nowrap">
                              <div className="flex items-center">
                                  {getIconForType(col.type)}
                                  {col.name}
                              </div>
                          </th>
                      ))}
                      <th className="w-8"></th>
                  </tr>
              </thead>
              <tbody>
                  {rows.map((row: any[], i: number) => (
                      <tr key={i} className="group border-b border-gray-200 dark:border-gray-800 last:border-b-0 hover:bg-gray-50 dark:hover:bg-notion-dark-hover/30">
                          {row.map((cell: any, j: number) => (
                              <td key={j} className="p-2 border-r border-gray-200 dark:border-gray-800 last:border-r-0 min-w-[120px]">
                                  {renderCell(cell, cols[j]?.type || 'text', i, j)}
                              </td>
                          ))}
                          <td className="w-8 text-center opacity-0 group-hover:opacity-100 cursor-pointer text-gray-400">
                              <MoreHorizontal size={14} />
                          </td>
                      </tr>
                  ))}
                  <tr>
                      <td colSpan={cols.length + 1} className="p-2 text-xs text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-notion-dark-hover/50">
                          <div className="flex items-center">
                              <Plus size={14} className="mr-1" /> New task
                          </div>
                      </td>
                  </tr>
              </tbody>
          </table>
      </div>
      );
  };

  const renderCalendarBlock = () => (
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

  const renderStandaloneDate = () => {
      const dateText = block.content || 'Empty date';
      const reminderText = block.properties?.reminderOption && block.properties.reminderOption !== 'None' 
        ? ` • ${block.properties.reminderOption}` 
        : '';
        
      return (
          <div 
            className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded cursor-pointer my-2 transition-colors"
            onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setDatePickerState({
                    isOpen: true,
                    rect: { top: rect.bottom + window.scrollY, left: rect.left + window.scrollX },
                    initialDate: block.content || undefined,
                    initialRemind: block.properties?.reminderOption
                });
            }}
          >
              <Calendar size={16} className="mr-2 text-notion-dim" />
              <span className={clsx("text-sm", block.properties?.reminderOption !== 'None' && block.properties?.reminderOption ? 'text-blue-600 dark:text-blue-400' : '')}>
                  {dateText}{reminderText}
              </span>
          </div>
      );
  }

  // ... (Other render functions: renderBoard, renderGithub, etc. - mostly unchanged)
  
  const renderContent = () => {
     // ... (Common props setup)
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
        // ... (Existing cases)
        case 'h1': return <div {...commonProps} className={clsx(commonProps.className, "text-4xl font-bold mb-2 mt-4")} placeholder="Heading 1" />;
        case 'h2': return <div {...commonProps} className={clsx(commonProps.className, "text-3xl font-semibold mb-2 mt-3")} placeholder="Heading 2" />;
        case 'h3': return <div {...commonProps} className={clsx(commonProps.className, "text-2xl font-semibold mb-1 mt-2")} placeholder="Heading 3" />;
        case 'quote': return (<div className="flex border-l-4 border-notion-text dark:border-notion-dark-text pl-4 my-2 italic"><div {...commonProps} className={clsx(commonProps.className, "text-lg")} placeholder="Quote" /></div>);
        case 'callout': return (<div className="flex p-4 bg-gray-100 dark:bg-notion-dark-sidebar rounded-md my-2"><span className="mr-3 text-xl">💡</span><div {...commonProps} className={clsx(commonProps.className)} placeholder="Callout text..." /></div>);
        case 'code': return (<div className="bg-gray-100 dark:bg-notion-dark-sidebar p-4 rounded-md font-mono text-sm my-2 w-full relative group/code"><div className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 text-xs text-gray-400">javascript</div><div {...commonProps} className={clsx(commonProps.className, "text-notion-blue dark:text-blue-400")} placeholder="Write code..." /></div>);
        case 'todo': return (<div className="flex items-start my-1 w-full"><div className="mr-2 mt-1 cursor-pointer text-notion-blue select-none" contentEditable={false} onClick={handleCheckbox}>{block.properties?.checked ? <CheckSquare size={18} /> : <Square size={18} />}</div><div {...commonProps} className={clsx(commonProps.className, block.properties?.checked && "line-through text-gray-400")} placeholder="To-do" /></div>);
        case 'toggle': return (<div className="w-full"><div className="flex items-start my-1 w-full"><div className="mr-1 mt-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 rounded p-0.5 select-none text-notion-text dark:text-notion-dark-text" contentEditable={false} onClick={handleToggle}><ChevronRight size={18} className={clsx("transform transition-transform", block.isOpen && "rotate-90")} /></div><div {...commonProps} className={clsx(commonProps.className)} placeholder="Toggle list" /></div>{block.isOpen && block.children && block.children.length > 0 && (<div className="pl-6 ml-2 border-l border-gray-200 dark:border-gray-800">{block.children.map((childBlock) => (<div key={childBlock.id} className="py-1 text-sm text-gray-600 dark:text-gray-300"><div>{childBlock.content}</div></div>))}</div>)}</div>);
        case 'bullet-list': return (<div className="flex items-start my-1 w-full"><div className="mr-2 mt-2 w-1.5 h-1.5 bg-black dark:bg-white rounded-full flex-shrink-0" contentEditable={false} /> <div {...commonProps} className={clsx(commonProps.className)} placeholder="List item" /></div>);
        case 'image': return (<div className="my-2 w-full" contentEditable={false}><img src={block.content || 'https://picsum.photos/800/400'} className="rounded-md w-full max-w-2xl object-cover h-64" alt="Block attachment" /><div className="text-xs text-center text-gray-400 mt-1">Add caption</div></div>);
        case 'divider': return (<div className="py-2 cursor-pointer w-full" onClick={() => onFocus(index)}><hr className="border-t border-gray-300 dark:border-gray-700" /></div>);
        
        // New/Updated types
        case 'table': return renderTable();
        case 'date': return renderStandaloneDate();
        
        // Remaining
        case 'board': return (<div className="flex space-x-4 overflow-x-auto pb-4 my-4 w-full">{[1,2,3].map(i=><div key={i} className="min-w-[200px] bg-gray-50 h-32 rounded"></div>)}</div>); // Simplified placeholder if method above not copied
        case 'calendar': return renderCalendarBlock();
        case 'chart': return (<div className="my-4 p-4 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-notion-dark-sidebar flex items-end h-40 space-x-2">{[40, 70, 45, 90, 60, 80].map((h, i) => (<div key={i} className="flex-1 bg-notion-blue opacity-80 hover:opacity-100 transition-opacity rounded-t" style={{ height: `${h}%` }}></div>))}</div>);
        case 'github': return (<div className="w-full my-4 border border-gray-200 dark:border-gray-700 rounded-md p-3 flex items-start"><Github size={24} className="mr-3" /> <div><span className="text-sm font-medium">Repo</span></div></div>);
        case 'jira': return (<div className="w-full my-4 border-l-4 border-blue-500 pl-4 py-2"><span className="text-sm font-bold text-blue-500">JIRA-123</span></div>);
        case 'video': return (<div className="w-full my-4 bg-black h-48 rounded flex items-center justify-center text-white"><Play /></div>);
        case 'embed': return (<div className="w-full my-4 border p-4 rounded text-sm text-gray-500">Embedded Link</div>);
        
        default: // text
            return <div {...commonProps} className={clsx(commonProps.className, "my-1")} />;
     }
  };

  return (
    <>
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

    {/* Date Picker Modal */}
    {datePickerState.isOpen && (
        <DatePicker 
            initialDate={datePickerState.initialDate}
            initialRemindOption={datePickerState.initialRemind}
            onSave={handleDateSave}
            onClose={() => setDatePickerState({ ...datePickerState, isOpen: false })}
            position={datePickerState.rect}
        />
    )}
    </>
  );
};

export default Block;
