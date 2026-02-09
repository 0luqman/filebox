export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

export const getCaretCoordinates = () => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0).cloneRange();
  // Ensure we have a valid rect even if collapsed
  const rect = range.getBoundingClientRect();
  return rect;
};

// Mock initial data
import { PageMetadata, PageContent } from './types';

export const INITIAL_PAGES: Record<string, PageMetadata> = {
  'root-1': { id: 'root-1', icon: '🏠', title: 'Home', parentId: null, createdAt: Date.now(), updatedAt: Date.now(), isExpanded: true },
  'root-2': { id: 'root-2', icon: '🚀', title: 'Engineering', parentId: null, createdAt: Date.now(), updatedAt: Date.now(), isExpanded: true },
  'child-1': { id: 'child-1', icon: '📝', title: 'Product Requirements', parentId: 'root-2', createdAt: Date.now(), updatedAt: Date.now() },
  'child-2': { id: 'child-2', icon: '🎨', title: 'Design System', parentId: 'root-2', createdAt: Date.now(), updatedAt: Date.now() },
  'root-3': { id: 'root-3', icon: '📅', title: 'Meetings', parentId: null, createdAt: Date.now(), updatedAt: Date.now() },
};

export const INITIAL_CONTENT: Record<string, PageContent> = {
  'root-1': {
    id: 'root-1',
    coverImage: 'https://picsum.photos/seed/notion/1200/300',
    blocks: [
      { id: 'b1', type: 'h1', content: 'Welcome to Filebox' },
      { id: 'b2', type: 'text', content: 'This is a demo of a block-based editor built with React and Tailwind.' },
      { id: 'b3', type: 'quote', content: 'Notion is more than just notes. It’s a way of thinking.' },
      { id: 'b4', type: 'h2', content: 'Features' },
      { id: 'b5', type: 'todo', content: 'Try the slash command (type /)', properties: { checked: false } },
      { id: 'b6', type: 'todo', content: 'Try dragging blocks', properties: { checked: true } },
      { id: 'b7', type: 'todo', content: 'Dark mode toggle', properties: { checked: false } },
      { id: 'b8', type: 'divider', content: '' },
      { id: 'b9', type: 'text', content: 'Try typing below...' },
    ]
  },
  'root-2': {
    id: 'root-2',
    blocks: [
      { id: 'eng1', type: 'h1', content: 'Engineering Team' },
      { id: 'eng2', type: 'text', content: 'Central hub for dev docs.' },
      { id: 'eng3', type: 'toggle', content: 'Backend API Status', isOpen: false, children: [
         { id: 'eng3a', type: 'code', content: 'GET /api/v1/status\n{\n  "status": "ok"\n}', properties: { language: 'json' } }
      ] }
    ]
  }
};