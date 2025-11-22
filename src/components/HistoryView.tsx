import { useState, useEffect } from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import { generateId } from '../lib/storage';

interface FoundItem {
  id: string;
  item_name: string;
  quantity: number;
  found_at: string;
}

interface Item {
  id: string;
  name: string;
  quantity_needed: number;
}

export default function HistoryView() {
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const stored = localStorage.getItem('tarkov_history');
    setFoundItems(stored ? JSON.parse(stored) : []);
  };

  const saveHistory = (newHistory: FoundItem[]) => {
    localStorage.setItem('tarkov_history', JSON.stringify(newHistory));
    setFoundItems(newHistory);
  };

  const restoreItem = (foundItem: FoundItem) => {
    const items = JSON.parse(localStorage.getItem('tarkov_items') || '[]');
    const existingItem = items.find((i: Item) => i.name === foundItem.item_name);

    if (existingItem) {
      const updated = items.map((i: Item) =>
        i.id === existingItem.id
          ? { ...i, quantity_needed: i.quantity_needed + foundItem.quantity }
          : i
      );
      localStorage.setItem('tarkov_items', JSON.stringify(updated));
    } else {
      items.unshift({
        id: generateId(),
        name: foundItem.item_name,
        quantity_needed: foundItem.quantity,
      });
      localStorage.setItem('tarkov_items', JSON.stringify(items));
    }

    saveHistory(foundItems.filter((item) => item.id !== foundItem.id));
  };

  const deleteFromHistory = (id: string) => {
    saveHistory(foundItems.filter((item) => item.id !== id));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-8">Found Items History</h2>

        {foundItems.length === 0 ? (
          <div className="text-center py-12">
            <RotateCcw className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No history yet</p>
            <p className="text-gray-500 text-sm mt-2">
              Items you mark as found will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {foundItems.map((item) => (
              <div
                key={item.id}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex items-center justify-between hover:border-gray-600 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white">
                    {item.item_name}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Quantity: {item.quantity} • Found on {formatDate(item.found_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => restoreItem(item)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restore
                  </button>
                  <button
                    onClick={() => deleteFromHistory(item.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
