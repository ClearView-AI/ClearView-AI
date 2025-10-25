import { Home, ChevronRight } from 'lucide-react';

export function Toolbar({ title = 'Analytics' }) {
  return (
    <div className="flex items-center gap-2 px-6 py-4 border-b border-border-subtle bg-card">
      <Home className="w-4 h-4 text-gray-500" />
      <span className="text-sm text-gray-400">Dashboard</span>
      <ChevronRight className="w-4 h-4 text-gray-500" />
      <span className="text-sm font-semibold text-white">{title}</span>
    </div>
  );
}

