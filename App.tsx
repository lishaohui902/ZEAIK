import React, { useState, useEffect } from 'react';
import InventoryList from './components/InventoryList';
import InventoryEntry from './components/InventoryEntry';
import AuditManager from './components/AuditManager';
import { InventoryItem, Vendor, DeliveryNote, Category, AuditRecord } from './types';
import { NAV_ITEMS } from './constants';

const INITIAL_VENDORS: Vendor[] = [
  { id: 'v1', name: '兴隆蔬菜批发', contact: '张老板', phone: '13800138000', address: '新发地市场A区', categories: [Category.VEGETABLE, Category.FRUIT], paymentMethod: '周结' },
  { id: 'v2', name: '诚顺肉品供应', contact: '王经理', phone: '13900139000', address: '新发地市场B区', categories: [Category.MEAT], paymentMethod: '日结' },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'i1', name: '大白菜', category: Category.VEGETABLE, unit: 'kg', price: 2.5, currentStock: 45, minStock: 50, lastRestockDate: '2023-11-20' },
  { id: 'i2', name: '猪里脊', category: Category.MEAT, unit: 'kg', price: 32, currentStock: 12, minStock: 10, lastRestockDate: '2023-11-22' },
  { id: 'i3', name: '青岛啤酒', category: Category.BEVERAGE, unit: '箱', price: 48, currentStock: 5, minStock: 10, lastRestockDate: '2023-10-15' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [vendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);

  const handleUpdateStock = (itemId: string, amount: number) => {
    setInventory(prev => prev.map(item => 
      item.id === itemId ? { ...item, currentStock: Math.max(0, item.currentStock + amount) } : item
    ));
  };

  const handleSaveAudit = (record: AuditRecord) => {
    setAuditRecords(prev => [record, ...prev]);
    setInventory(prev => prev.map(item => {
      const auditItem = record.items.find(ai => ai.itemId === item.id);
      if (auditItem) {
        return { ...item, currentStock: auditItem.newStock };
      }
      return item;
    }));
    setActiveTab('inventory');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'inventory': 
        return <InventoryList inventory={inventory} onUpdateStock={handleUpdateStock} deliveryNotes={deliveryNotes} />;
      case 'audit': 
        return (
          <AuditManager 
            inventory={inventory} 
            auditRecords={auditRecords} 
            onSave={handleSaveAudit} 
          />
        );
      case 'delivery': 
        return (
          <InventoryEntry 
            vendors={vendors} 
            inventory={inventory}
            onComplete={(note) => {
              setDeliveryNotes(prev => [note, ...prev]);
              const updatedInventory = [...inventory];
              note.items.forEach(item => {
                const existing = updatedInventory.find(i => i.name === item.name);
                if (existing) {
                  existing.currentStock += item.quantity;
                  existing.lastRestockDate = note.date;
                } else {
                  updatedInventory.push({
                    id: `i-${Date.now()}-${Math.random()}`,
                    name: item.name,
                    category: item.category,
                    unit: item.unit,
                    price: item.price,
                    currentStock: item.quantity,
                    minStock: 10,
                    lastRestockDate: note.date
                  });
                }
              });
              setInventory(updatedInventory);
              setActiveTab('inventory');
            }}
          />
        );
      default: 
        return <InventoryList inventory={inventory} onUpdateStock={handleUpdateStock} deliveryNotes={deliveryNotes} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 max-w-md mx-auto shadow-2xl overflow-hidden border-x border-slate-200">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">智</div>
          <h1 className="font-bold text-lg text-slate-800 tracking-tight">智爱客</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-28 scroll-smooth">
        <div className="p-4">
          {renderContent()}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-lg border-t border-slate-100 px-2 py-3 flex items-end justify-around z-40 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
        {NAV_ITEMS.map((item, index) => {
          const isActive = activeTab === item.id;
          
          if (item.isCenter) {
            return (
              <div key={item.id} className="relative flex-1 flex justify-center h-full">
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`absolute -top-10 flex flex-col items-center justify-center w-16 h-16 bg-blue-600 rounded-full text-white shadow-[0_8px_20px_-5px_rgba(37,99,235,0.4)] border-4 border-white active:scale-90 active:shadow-inner transition-all duration-200 group`}
                >
                  <div className="transition-transform group-hover:scale-110">
                    {item.icon}
                  </div>
                </button>
                <span className={`text-[10px] mt-8 font-bold ${isActive ? 'text-blue-600' : 'text-slate-400 opacity-60'}`}>
                  {item.label}
                </span>
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-200 py-1 rounded-2xl ${
                isActive ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-blue-50 scale-110' : 'bg-transparent'}`}>
                {item.icon}
              </div>
              <span className={`text-[10px] font-bold tracking-wide ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 bg-blue-600 rounded-full animate-in fade-in zoom-in duration-300"></div>
              )}
            </button>
          );
        })}
      </footer>
    </div>
  );
}