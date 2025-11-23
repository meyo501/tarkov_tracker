import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Check, Package, Download, Upload, AlertCircle } from 'lucide-react';
import { generateId } from '../lib/storage';

interface Item {
  id: string;
  name: string;
  quantity_needed: number;
  isHighPriority?: boolean;
}

interface FoundItem {
  id: string;
  item_name: string;
  quantity: number;
  found_at: string;
}

export default function ItemTracker() {
  const [items, setItems] = useState<Item[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<string[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setShowAutocomplete(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadItems = () => {
    const stored = localStorage.getItem('tarkov_items');
    const loadedItems = stored ? JSON.parse(stored) : [];
    // Ensure backward compatibility: add isHighPriority if missing
    const itemsWithPriority = loadedItems.map((item: Item) => ({
      ...item,
      isHighPriority: item.isHighPriority ?? false,
    }));
    setItems(itemsWithPriority);
  };

  const saveItems = (newItems: Item[]) => {
    localStorage.setItem('tarkov_items', JSON.stringify(newItems));
    setItems(newItems);
  };

  const addItem = () => {
    if (!newItemName.trim()) return;

    const newItem: Item = {
      id: generateId(),
      name: newItemName.trim(),
      quantity_needed: newItemQuantity,
      isHighPriority: false,
    };

    saveItems([newItem, ...items]);
    setNewItemName('');
    setNewItemQuantity(1);
    setIsAdding(false);
    setShowAutocomplete(false);
  };

  const deleteItem = (id: string) => {
    saveItems(items.filter((item) => item.id !== id));
  };

  const increaseQuantity = (id: string) => {
    const updated = items.map((i) =>
      i.id === id ? { ...i, quantity_needed: i.quantity_needed + 1 } : i
    );
    saveItems(updated);
  };

  const togglePriority = (id: string) => {
    const updated = items.map((i) =>
      i.id === id ? { ...i, isHighPriority: !(i.isHighPriority ?? false) } : i
    );
    saveItems(updated);
  };

  const getSortedItems = (): Item[] => {
    return [...items].sort((a, b) => {
      const aPriority = a.isHighPriority ?? false;
      const bPriority = b.isHighPriority ?? false;
      if (aPriority && !bPriority) return -1;
      if (!aPriority && bPriority) return 1;
      return 0;
    });
  };

  const markAsFound = (item: Item) => {
    const foundItems = JSON.parse(localStorage.getItem('tarkov_history') || '[]');
    foundItems.unshift({
      id: generateId(),
      item_name: item.name,
      quantity: 1,
      found_at: new Date().toISOString(),
    });
    localStorage.setItem('tarkov_history', JSON.stringify(foundItems));

    const newQuantity = item.quantity_needed - 1;
    if (newQuantity <= 0) {
      deleteItem(item.id);
    } else {
      const updated = items.map((i) =>
        i.id === item.id ? { ...i, quantity_needed: newQuantity } : i
      );
      saveItems(updated);
    }
  };

  const getDistinctItemNames = (): string[] => {
    const currentItemNames = items.map((item) => item.name);
    const foundItems: FoundItem[] = JSON.parse(localStorage.getItem('tarkov_history') || '[]');
    const historyItemNames = foundItems.map((item) => item.item_name);
    
    const allNames = [...currentItemNames, ...historyItemNames];
    const distinctNames = Array.from(new Set(allNames));
    return distinctNames.sort();
  };

  const handleItemNameChange = (value: string) => {
    setNewItemName(value);
    
    if (value.trim().length > 0) {
      const suggestions = getDistinctItemNames().filter((name) =>
        name.toLowerCase().includes(value.toLowerCase())
      );
      setAutocompleteSuggestions(suggestions);
      setShowAutocomplete(suggestions.length > 0);
    } else {
      setAutocompleteSuggestions([]);
      setShowAutocomplete(false);
    }
  };

  const selectAutocompleteItem = (name: string) => {
    setNewItemName(name);
    setShowAutocomplete(false);
  };

  const exportToJSON = () => {
    const foundItems: FoundItem[] = JSON.parse(localStorage.getItem('tarkov_history') || '[]');
    const exportData = {
      items: items,
      history: foundItems,
      exported_at: new Date().toISOString(),
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tarkov-tracker-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);

        // Handle both old format (just array) and new format (object with items and history)
        let importedItems: Item[] = [];
        let importedHistory: FoundItem[] = [];

        if (Array.isArray(importedData)) {
          // Old format: just an array of items
          importedItems = importedData;
        } else if (importedData.items && Array.isArray(importedData.items)) {
          // New format: object with items and history
          importedItems = importedData.items;
          if (importedData.history && Array.isArray(importedData.history)) {
            importedHistory = importedData.history;
          }
        } else {
          alert('Invalid file format. Please import a valid JSON file.');
          return;
        }

        // Validate items structure
        const validItems = importedItems
          .filter(
            (item: any) => item && typeof item.name === 'string' && typeof item.quantity_needed === 'number'
          )
          .map((item: any) => ({
            ...item,
            isHighPriority: item.isHighPriority ?? false,
          }));

        // Validate history structure
        const validHistory = importedHistory.filter(
          (item: any) => item && typeof item.item_name === 'string' && typeof item.quantity === 'number'
        );

        if (validItems.length === 0 && validHistory.length === 0) {
          alert('No valid data found in the file.');
          return;
        }

        // Ask user if they want to replace or merge
        const replace = window.confirm(
          `Found ${validItems.length} items and ${validHistory.length} history entries.\n\n` +
          'Click OK to replace current data, or Cancel to merge with existing data.'
        );

        if (replace) {
          // Replace existing data
          saveItems(validItems);
          localStorage.setItem('tarkov_history', JSON.stringify(validHistory));
        } else {
          // Merge with existing data
          const existingItems = items;
          const existingHistory: FoundItem[] = JSON.parse(localStorage.getItem('tarkov_history') || '[]');

          // Merge items: combine quantities for same names, add new items
          const mergedItems = [...existingItems];
          validItems.forEach((importedItem) => {
            const existingIndex = mergedItems.findIndex((item) => item.name === importedItem.name);
            if (existingIndex >= 0) {
              mergedItems[existingIndex].quantity_needed += importedItem.quantity_needed;
            } else {
              mergedItems.push(importedItem);
            }
          });
          saveItems(mergedItems);

          // Merge history: combine entries
          const mergedHistory = [...existingHistory, ...validHistory];
          localStorage.setItem('tarkov_history', JSON.stringify(mergedHistory));
        }

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        alert('Import completed successfully!');
      } catch (error) {
        alert('Error reading file. Please make sure it is a valid JSON file.');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white">Items to Find</h2>
          {!isAdding && (
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
              <button
                onClick={handleImportClick}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                title="Import items and history from JSON"
              >
                <Upload className="w-5 h-5" />
                Import JSON
              </button>
              {(items.length > 0 || JSON.parse(localStorage.getItem('tarkov_history') || '[]').length > 0) && (
                <button
                  onClick={exportToJSON}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  title="Export items and history to JSON"
                >
                  <Download className="w-5 h-5" />
                  Export JSON
                </button>
              )}
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Item
              </button>
            </div>
          )}
        </div>

        {isAdding && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              Add New Item
            </h3>
            <div className="flex gap-4">
              <div className="flex-1 relative" ref={autocompleteRef}>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => handleItemNameChange(e.target.value)}
                  placeholder="Item name"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && addItem()}
                  autoFocus
                />
                {showAutocomplete && autocompleteSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {autocompleteSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectAutocompleteItem(suggestion)}
                        className="w-full text-left px-4 py-2 text-white hover:bg-gray-800 transition-colors first:rounded-t-lg last:rounded-b-lg"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="number"
                value={newItemQuantity}
                onChange={(e) =>
                  setNewItemQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                min="1"
                className="w-24 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addItem}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewItemName('');
                  setNewItemQuantity(1);
                  setShowAutocomplete(false);
                }}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No items to track yet</p>
            <p className="text-gray-500 text-sm mt-2">
              Add items you need to find in your Tarkov missions
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {getSortedItems().map((item) => (
              <div
                key={item.id}
                className={`bg-gray-800 rounded-lg p-4 border flex items-center justify-between hover:border-gray-600 transition-colors ${
                  item.isHighPriority ? 'border-yellow-500 border-2' : 'border-gray-700'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => togglePriority(item.id)}
                    className={`p-1 rounded transition-colors ${
                      item.isHighPriority
                        ? 'text-yellow-500 hover:text-yellow-400'
                        : 'text-gray-500 hover:text-gray-400'
                    }`}
                    title={item.isHighPriority ? 'Remove high priority' : 'Mark as high priority'}
                  >
                    <AlertCircle className="w-5 h-5" fill={item.isHighPriority ? 'currentColor' : 'none'} />
                  </button>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-white">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Quantity needed: {item.quantity_needed}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => increaseQuantity(item.id)}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    title="Increase quantity by 1"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => markAsFound(item)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Found It
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
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
