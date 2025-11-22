import { useState } from 'react';
import Sidebar from './components/Sidebar';
import ItemTracker from './components/ItemTracker';
import HistoryView from './components/HistoryView';

function App() {
  const [activeView, setActiveView] = useState<'tracker' | 'history'>('tracker');

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      {activeView === 'tracker' ? <ItemTracker /> : <HistoryView />}
    </div>
  );
}

export default App;
