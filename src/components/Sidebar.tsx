import { Package, History } from 'lucide-react';

interface SidebarProps {
  activeView: 'tracker' | 'history';
  onViewChange: (view: 'tracker' | 'history') => void;
}

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Package className="w-6 h-6" />
          Tarkov Tracker
        </h1>
      </div>

      <nav className="flex-1 p-4">
        <button
          onClick={() => onViewChange('tracker')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
            activeView === 'tracker'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="font-medium">Item Tracker</span>
        </button>

        <button
          onClick={() => onViewChange('history')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            activeView === 'history'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="font-medium">History</span>
        </button>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <p className="text-xs text-gray-500 text-center">
          More features coming soon...
        </p>
      </div>
    </div>
  );
}
