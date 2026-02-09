
import React, { useEffect, useState } from 'react';
import { BlockType } from '../../types';
import { 
    Type, Heading1, Heading2, Heading3, List, CheckSquare, Code, Quote, GripHorizontal, 
    Image as ImageIcon, Table, Trello, Calendar, BarChart, Github, Megaphone, Video, Link, Bug
} from 'lucide-react';

interface SlashMenuProps {
  position: { top: number; left: number };
  onSelect: (type: BlockType) => void;
  onClose: () => void;
  query: string;
}

const ITEMS: { type: BlockType; label: string; icon: React.ReactNode; desc: string }[] = [
  { type: 'text', label: 'Text', icon: <Type size={16} />, desc: 'Just start writing with plain text.' },
  { type: 'h1', label: 'Heading 1', icon: <Heading1 size={16} />, desc: 'Big section heading.' },
  { type: 'h2', label: 'Heading 2', icon: <Heading2 size={16} />, desc: 'Medium section heading.' },
  { type: 'h3', label: 'Heading 3', icon: <Heading3 size={16} />, desc: 'Small section heading.' },
  { type: 'bullet-list', label: 'Bulleted list', icon: <List size={16} />, desc: 'Create a simple bulleted list.' },
  { type: 'todo', label: 'To-do list', icon: <CheckSquare size={16} />, desc: 'Track tasks with a to-do list.' },
  { type: 'callout', label: 'Callout', icon: <Megaphone size={16} />, desc: 'Make writing stand out.' },
  { type: 'date', label: 'Date or Reminder', icon: <Calendar size={16} />, desc: 'Set a date or reminder.' },
  { type: 'table', label: 'Table', icon: <Table size={16} />, desc: 'Add a simple database table.' },
  { type: 'board', label: 'Board', icon: <Trello size={16} />, desc: 'Kanban board for project management.' },
  { type: 'calendar', label: 'Calendar', icon: <Calendar size={16} />, desc: 'Monthly view for events.' },
  { type: 'chart', label: 'Chart', icon: <BarChart size={16} />, desc: 'Visualize data.' },
  { type: 'code', label: 'Code', icon: <Code size={16} />, desc: 'Capture a code snippet.' },
  { type: 'quote', label: 'Quote', icon: <Quote size={16} />, desc: 'Capture a quote.' },
  { type: 'github', label: 'GitHub', icon: <Github size={16} />, desc: 'Embed a GitHub issue or PR.' },
  { type: 'jira', label: 'Jira', icon: <Bug size={16} />, desc: 'Embed a Jira ticket.' },
  { type: 'video', label: 'Video', icon: <Video size={16} />, desc: 'Embed a video from YouTube/Vimeo.' },
  { type: 'embed', label: 'Embed', icon: <Link size={16} />, desc: 'Embed any link.' },
  { type: 'divider', label: 'Divider', icon: <GripHorizontal size={16} />, desc: 'Visually divide blocks.' },
  { type: 'image', label: 'Image', icon: <ImageIcon size={16} />, desc: 'Embed with a link.' },
];

const SlashMenu: React.FC<SlashMenuProps> = ({ position, onSelect, onClose, query }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredItems = ITEMS.filter(item => 
      item.label.toLowerCase().includes(query.toLowerCase()) || 
      item.desc.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (filteredItems.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onSelect(filteredItems[selectedIndex].type);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filteredItems, onSelect, onClose]);

  if (filteredItems.length === 0) {
      return (
        <div 
            className="fixed z-50 w-72 bg-white dark:bg-notion-dark-sidebar rounded-md shadow-xl border border-notion-border dark:border-notion-dark-border overflow-hidden p-3 text-sm text-notion-dim"
            style={{ top: position.top + 24, left: position.left }}
        >
            No results
        </div>
      );
  }

  return (
    <div 
      className="fixed z-50 w-72 bg-white dark:bg-notion-dark-sidebar rounded-md shadow-xl border border-notion-border dark:border-notion-dark-border overflow-hidden flex flex-col max-h-80 overflow-y-auto"
      style={{ top: position.top + 24, left: position.left }}
    >
      <div className="p-2 text-xs font-semibold text-notion-dim uppercase">Basic blocks</div>
      {filteredItems.map((item, idx) => (
        <div 
          key={item.type}
          className={`flex items-center p-2 cursor-pointer ${idx === selectedIndex ? 'bg-notion-hover dark:bg-notion-dark-hover' : ''}`}
          onClick={() => onSelect(item.type)}
          onMouseEnter={() => setSelectedIndex(idx)}
        >
            <div className="w-10 h-10 border border-notion-border dark:border-notion-dark-border rounded bg-white dark:bg-black flex items-center justify-center mr-3 text-notion-text dark:text-notion-dark-text shadow-sm flex-shrink-0">
                {item.icon}
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-medium text-notion-text dark:text-notion-dark-text">{item.label}</span>
                <span className="text-xs text-notion-dim">{item.desc}</span>
            </div>
        </div>
      ))}
    </div>
  );
};

export default SlashMenu;
