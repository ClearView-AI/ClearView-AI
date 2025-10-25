import {
  LayoutDashboard,
  CheckSquare,
  Bell,
  Calendar,
  FileText,
  MessageSquare,
  Inbox,
  TrendingUp,
  Clock,
  BarChart3,
  ChevronDown,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useState } from 'react';

const mainNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: CheckSquare, label: 'Tasks' },
  { icon: Bell, label: 'Notifications' },
  { icon: Calendar, label: 'Calendar' },
  { icon: FileText, label: 'Invoices' },
  { icon: MessageSquare, label: 'Messages' },
  { icon: Inbox, label: 'Inbox' },
  { icon: TrendingUp, label: 'Performance' },
];

const folderItems = [
  { icon: Clock, label: 'Work Logs' },
  { icon: Clock, label: 'Timesheets' },
  { icon: BarChart3, label: 'Marketing' },
];

export function Sidebar() {
  const [folderExpanded, setFolderExpanded] = useState(true);

  return (
    <aside className="w-64 bg-card border-r border-border-subtle flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-white/10 to-white/5 rounded-lg flex items-center justify-center ring-1 ring-white/10">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">ClearView</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-6 overflow-y-auto">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">
            Main
          </div>
          {mainNavItems.map((item) => (
            <NavItem key={item.label} {...item} />
          ))}
        </div>

        {/* Folder Section */}
        <div className="mt-8">
          <button
            onClick={() => setFolderExpanded(!folderExpanded)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-400 transition-colors"
          >
            <span>Folder</span>
            <ChevronDown
              className={cn(
                'w-4 h-4 transition-transform',
                folderExpanded && 'rotate-180'
              )}
            />
          </button>
          {folderExpanded && (
            <div className="space-y-1 mt-2">
              {folderItems.map((item) => (
                <NavItem key={item.label} {...item} />
              ))}
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}

function NavItem({ icon: Icon, label, active }) {
  return (
    <a
      href="#"
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
        active
          ? 'bg-white/5 text-white shadow-sm'
          : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span>{label}</span>
    </a>
  );
}

