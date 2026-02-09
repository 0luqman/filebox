import React, { useState } from 'react';
import { useStore } from '../../store';
import Block from './Block';
import SlashMenu from './SlashMenu';
import { Block as BlockInterface, BlockType } from '../../types';
import { generateId } from '../../utils';
import { FileText, Calendar, Trello, CheckSquare, Bell, Clock, Briefcase, GraduationCap, Utensils, Activity, X } from 'lucide-react';

const InboxView: React.FC = () => {
    const { state, dispatch } = useStore();
    return (
        <div className="max-w-3xl mx-auto pt-12 px-12">
            <h1 className="text-3xl font-bold mb-6 flex items-center">
                <Bell className="mr-3" /> Inbox
            </h1>
            <div className="space-y-4">
                {state.notifications.length === 0 && <div className="text-gray-500">You're all caught up!</div>}
                {state.notifications.map(n => (
                    <div key={n.id} className={`p-4 rounded-lg border ${n.read ? 'bg-white dark:bg-notion-dark-bg border-gray-200 dark:border-gray-700' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'}`}>
                        <div className="flex justify-between items-start">
                            <div className="text-sm">
                                <p className="font-medium mb-1">{n.text}</p>
                                <span className="text-xs text-gray-500 flex items-center"><Clock size={12} className="mr-1"/> {n.time}</span>
                            </div>
                            {!n.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                        </div>
                        {n.pageId && (
                             <button 
                                onClick={() => {
                                    dispatch({ type: 'SET_PAGE', payload: n.pageId! });
                                    dispatch({ type: 'MARK_NOTIFICATIONS_READ' });
                                }}
                                className="mt-2 text-xs text-notion-blue hover:underline"
                            >
                                Open Page
                             </button>
                        )}
                    </div>
                ))}
            </div>
            {state.notifications.some(n => !n.read) && (
                <button 
                    onClick={() => dispatch({ type: 'MARK_NOTIFICATIONS_READ' })}
                    className="mt-6 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
                >
                    Mark all as read
                </button>
            )}
        </div>
    )
}

const TemplatesModal: React.FC<{ onClose: () => void, onApply: (t: string) => void }> = ({ onClose, onApply }) => {
    const templates = [
        { id: 'meeting', name: 'Meeting Notes', icon: <Calendar className="text-red-500" />, desc: 'Capture attendees, agenda, and action items.' },
        { id: 'roadmap', name: 'Product Roadmap', icon: <Trello className="text-blue-500" />, desc: 'Track features and timelines.' },
        { id: 'docs', name: 'Documentation', icon: <FileText className="text-yellow-500" />, desc: 'Write specifications and guides.' },
        { id: 'crm', name: 'Simple CRM', icon: <Briefcase className="text-green-500" />, desc: 'Track sales leads and contacts.' },
        { id: 'student', name: 'Student Dashboard', icon: <GraduationCap className="text-purple-500" />, desc: 'Manage courses and assignments.' },
        { id: 'recipe', name: 'Recipe Book', icon: <Utensils className="text-orange-500" />, desc: 'Organize your favorite meals.' },
        { id: 'habit', name: 'Habit Tracker', icon: <Activity className="text-pink-500" />, desc: 'Track daily habits and goals.' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-notion-dark-sidebar w-[700px] max-w-[90vw] h-[600px] rounded-xl shadow-2xl border border-notion-border dark:border-notion-dark-border flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                 <div className="p-4 border-b border-notion-border dark:border-notion-dark-border flex justify-between items-center">
                    <h2 className="font-bold text-lg">Templates</h2>
                    <button onClick={onClose}><X size={20} /></button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-4">
                     {templates.map(t => (
                         <div key={t.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-notion-dark-hover cursor-pointer transition-colors" onClick={() => onApply(t.id)}>
                             <div className="mb-2">{t.icon}</div>
                             <div className="font-semibold mb-1">{t.name}</div>
                             <div className="text-sm text-gray-500">{t.desc}</div>
                         </div>
                     ))}
                 </div>
            </div>
        </div>
    );
};

const BlockEditor: React.FC = () => {
  const { state, dispatch } = useStore();
  const pageContent = state.content[state.currentPageId || ''];
  
  // State for slash menu
  const [slashMenu, setSlashMenu] = useState<{ open: boolean; position: { top: number; left: number }; blockId: string | null }>({
    open: false,
    position: { top: 0, left: 0 },
    blockId: null
  });

  const [focusedBlockIndex, setFocusedBlockIndex] = useState<number>(-1);

  if (state.ui.activeView === 'inbox') {
      return <InboxView />;
  }

  if (!state.currentPageId || !pageContent) {
      return <div className="p-10 text-gray-400">Select a page...</div>;
  }

  const blocks = pageContent.blocks;
  const isEmpty = blocks.length === 1 && blocks[0].content === '' && blocks[0].type === 'text';

  const updateBlocks = (newBlocks: BlockInterface[]) => {
    dispatch({ type: 'UPDATE_BLOCKS', payload: { pageId: state.currentPageId!, blocks: newBlocks } });
  };

  const handleUpdateBlock = (id: string, content: string) => {
    const newBlocks = blocks.map(b => {
        if(b.id === id) {
            return { ...b, content };
        }
        return b;
    });
    updateBlocks(newBlocks);
  };

  const handleAddBlock = (afterIndex: number) => {
      const newBlock: BlockInterface = { id: generateId(), type: 'text', content: '' };
      const newBlocks = [...blocks];
      newBlocks.splice(afterIndex + 1, 0, newBlock);
      updateBlocks(newBlocks);
      setFocusedBlockIndex(afterIndex + 1);
  };

  const handleDeleteBlock = (id: string) => {
      if (blocks.length <= 1) return; // Keep at least one block
      const index = blocks.findIndex(b => b.id === id);
      const newBlocks = blocks.filter(b => b.id !== id);
      updateBlocks(newBlocks);
      setFocusedBlockIndex(Math.max(0, index - 1));
  };

  const handleTypeChange = (id: string, type: BlockType) => {
      const newBlocks = blocks.map(b => b.id === id ? { ...b, type } : b);
      updateBlocks(newBlocks);
      setSlashMenu({ ...slashMenu, open: false });
  };

  const handleSlashMenuSelect = (type: BlockType) => {
      if (slashMenu.blockId) {
          // If converting existing block
          const block = blocks.find(b => b.id === slashMenu.blockId);
          if (block) {
              const newBlocks = blocks.map(b => b.id === slashMenu.blockId ? { ...b, type, content: '' } : b);
              updateBlocks(newBlocks);
          }
      }
      setSlashMenu({ ...slashMenu, open: false });
      // Refocus
      const idx = blocks.findIndex(b => b.id === slashMenu.blockId);
      if(idx !== -1) setFocusedBlockIndex(idx);
  };

  const handleOpenSlashMenu = (rect: DOMRect, blockId: string) => {
      setSlashMenu({
          open: true,
          position: { top: rect.bottom + window.scrollY, left: rect.left + window.scrollX },
          blockId
      });
  };

  const applyTemplate = (templateType: string) => {
      let newBlocks: BlockInterface[] = [];
      let title = "Untitled";
      let icon = "📄";

      if (templateType === 'meeting') {
          title = "Meeting Notes"; icon = "📅";
          newBlocks = [
              { id: generateId(), type: 'h2', content: 'Attendees' },
              { id: generateId(), type: 'bullet-list', content: '@User1' },
              { id: generateId(), type: 'bullet-list', content: '@User2' },
              { id: generateId(), type: 'h2', content: 'Agenda' },
              { id: generateId(), type: 'todo', content: 'Review Q3 goals' },
              { id: generateId(), type: 'todo', content: 'Discuss blockers' },
              { id: generateId(), type: 'h2', content: 'Action Items' },
              { id: generateId(), type: 'table', content: '' }
          ];
      } else if (templateType === 'roadmap') {
          title = "Product Roadmap"; icon = "🗺️";
          newBlocks = [
              { id: generateId(), type: 'callout', content: 'This roadmap is a living document.' },
              { id: generateId(), type: 'h2', content: 'Q4 2024' },
              { id: generateId(), type: 'board', content: '', properties: {
                  columns: [
                      {name: "Up Next", items: ["Dark Mode V2", "Mobile App"]},
                      {name: "In Progress", items: ["API Refactor"]},
                      {name: "Done", items: ["Launch V1"]}
                  ]
              }},
              { id: generateId(), type: 'h2', content: 'Timeline' },
              { id: generateId(), type: 'calendar', content: '' }
          ];
      } else if (templateType === 'crm') {
          title = "Sales CRM"; icon = "🤝";
          newBlocks = [
              { id: generateId(), type: 'h2', content: 'Leads' },
              { id: generateId(), type: 'table', content: '', properties: {
                  headers: ["Client Name", "Status", "Value", "Last Contact"],
                  rows: [
                      ["Acme Corp", "Negotiation", "$50k", "Yesterday"],
                      ["Globex", "Qualified", "$120k", "2 days ago"]
                  ]
              }},
              { id: generateId(), type: 'h2', content: 'Resources' },
              { id: generateId(), type: 'embed', content: 'Sales Deck' }
          ];
      } else if (templateType === 'student') {
          title = "Student Dashboard"; icon = "🎓";
          newBlocks = [
              { id: generateId(), type: 'h1', content: 'Fall Semester' },
              { id: generateId(), type: 'h2', content: 'Course Schedule' },
              { id: generateId(), type: 'table', content: '', properties: {
                  headers: ["Course", "Time", "Location", "Professor"],
                  rows: [
                      ["CS101", "Mon 9am", "Room 304", "Dr. Smith"],
                      ["MATH202", "Wed 11am", "Room 102", "Prof. Doe"]
                  ]
              }},
              { id: generateId(), type: 'h2', content: 'Assignments' },
              { id: generateId(), type: 'calendar', content: '' }
          ];
      } else if (templateType === 'habit') {
          title = "Habit Tracker"; icon = "✅";
          newBlocks = [
              { id: generateId(), type: 'quote', content: 'We are what we repeatedly do.' },
              { id: generateId(), type: 'table', content: '', properties: {
                  headers: ["Habit", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                  rows: [
                      ["Read 30m", "✓", "✓", "", "✓", "", "", ""],
                      ["Workout", "", "✓", "✓", "", "", "✓", ""]
                  ]
              }}
          ];
      } else if (templateType === 'recipe') {
          title = "Recipe Book"; icon = "🍳";
          newBlocks = [
              { id: generateId(), type: 'h2', content: 'Favorites' },
              { id: generateId(), type: 'image', content: 'https://picsum.photos/800/400' },
              { id: generateId(), type: 'h3', content: 'Spicy Pasta' },
              { id: generateId(), type: 'toggle', content: 'Ingredients', children: [
                  { id: generateId(), type: 'bullet-list', content: 'Pasta' },
                  { id: generateId(), type: 'bullet-list', content: 'Chili Flakes' }
              ]},
              { id: generateId(), type: 'toggle', content: 'Instructions', children: [
                  { id: generateId(), type: 'numbered-list', content: 'Boil water' },
                  { id: generateId(), type: 'numbered-list', content: 'Cook pasta' }
              ]}
          ];
      } else {
          title = "Documentation"; icon = "📚";
          newBlocks = [
              { id: generateId(), type: 'h1', content: 'Overview' },
              { id: generateId(), type: 'text', content: 'Write a brief description of the project here.' },
              { id: generateId(), type: 'divider', content: '' },
              { id: generateId(), type: 'h2', content: 'API Reference' },
              { id: generateId(), type: 'code', content: 'npm install filebox-sdk' },
          ];
      }

      dispatch({ type: 'UPDATE_PAGE_TITLE', payload: { pageId: state.currentPageId!, title, icon } });
      updateBlocks(newBlocks);
      dispatch({ type: 'SET_UI_STATE', payload: { key: 'isTemplatesOpen', value: false } });
  };

  return (
    <div className="max-w-3xl mx-auto pb-40">
      {/* Cover Image Placeholder */}
      {pageContent.coverImage && (
          <div className="group relative h-48 -mt-12 mb-8 w-full overflow-hidden rounded-md select-none">
             <img src={pageContent.coverImage} className="w-full h-full object-cover" alt="Cover" />
             <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-black/50 px-2 py-1 rounded text-xs cursor-pointer">
                 Change cover
             </div>
          </div>
      )}

      {/* Page Title */}
      <div className="group flex items-center mb-6">
         <div className="mr-4 text-4xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded p-1">
             {state.pages[state.currentPageId].icon}
         </div>
         <input 
            type="text" 
            value={state.pages[state.currentPageId].title}
            onChange={(e) => dispatch({ type: 'UPDATE_PAGE_TITLE', payload: { pageId: state.currentPageId!, title: e.target.value } })}
            placeholder="Untitled"
            className="text-4xl font-bold bg-transparent border-none outline-none w-full placeholder-gray-300 dark:placeholder-gray-600"
         />
      </div>

      {/* Templates Quick Start (Only on empty pages) */}
      {isEmpty && (
          <div className="mb-8 p-4 bg-gray-50 dark:bg-notion-dark-hover rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase">Start with a template</h3>
              <div className="flex space-x-2 overflow-x-auto pb-2">
                  <button onClick={() => applyTemplate('meeting')} className="flex items-center px-3 py-2 bg-white dark:bg-notion-dark-sidebar border border-gray-200 dark:border-gray-600 rounded hover:shadow-sm text-sm whitespace-nowrap">
                      <Calendar size={14} className="mr-2 text-red-500" /> Meeting Notes
                  </button>
                  <button onClick={() => applyTemplate('roadmap')} className="flex items-center px-3 py-2 bg-white dark:bg-notion-dark-sidebar border border-gray-200 dark:border-gray-600 rounded hover:shadow-sm text-sm whitespace-nowrap">
                      <Trello size={14} className="mr-2 text-blue-500" /> Roadmap
                  </button>
                  <button onClick={() => applyTemplate('docs')} className="flex items-center px-3 py-2 bg-white dark:bg-notion-dark-sidebar border border-gray-200 dark:border-gray-600 rounded hover:shadow-sm text-sm whitespace-nowrap">
                      <FileText size={14} className="mr-2 text-yellow-500" /> Docs
                  </button>
                  <button onClick={() => dispatch({ type: 'SET_UI_STATE', payload: { key: 'isTemplatesOpen', value: true } })} className="flex items-center px-3 py-2 bg-white dark:bg-notion-dark-sidebar border border-gray-200 dark:border-gray-600 rounded hover:shadow-sm text-sm whitespace-nowrap">
                      More...
                  </button>
              </div>
          </div>
      )}

      {/* Blocks */}
      <div className="pl-2">
          {blocks.map((block, index) => (
              <Block 
                key={block.id}
                block={block}
                index={index}
                isFocused={focusedBlockIndex === index}
                onUpdate={handleUpdateBlock}
                onAddBlock={handleAddBlock}
                onDeleteBlock={handleDeleteBlock}
                onFocus={setFocusedBlockIndex}
                onMoveUp={(idx) => setFocusedBlockIndex(idx > 0 ? idx - 1 : 0)}
                onMoveDown={(idx) => setFocusedBlockIndex(idx < blocks.length - 1 ? idx + 1 : idx)}
                onTypeChange={handleTypeChange}
                onOpenSlashMenu={handleOpenSlashMenu}
              />
          ))}
      </div>

      {/* Slash Menu */}
      {slashMenu.open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setSlashMenu({ ...slashMenu, open: false })} />
            <SlashMenu 
                position={slashMenu.position} 
                onSelect={handleSlashMenuSelect} 
                onClose={() => setSlashMenu({ ...slashMenu, open: false })} 
            />
          </>
      )}

      {/* Templates Modal */}
      {state.ui.isTemplatesOpen && (
          <TemplatesModal onClose={() => dispatch({ type: 'SET_UI_STATE', payload: { key: 'isTemplatesOpen', value: false } })} onApply={applyTemplate} />
      )}
      
      <div 
        className="mt-4 text-notion-dim hover:bg-notion-hover p-2 rounded cursor-pointer flex items-center"
        onClick={() => handleAddBlock(blocks.length - 1)}
      >
          <span className="text-xl mr-2">+</span> Click to add a block
      </div>
    </div>
  );
};

export default BlockEditor;
