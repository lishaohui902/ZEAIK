import React, { useState } from 'react';
import { Search, Plus, Minus, SlidersHorizontal, History, Package, ChevronRight, Calendar, X, FileText, Tag, Hash, DollarSign } from 'lucide-react';
import { InventoryItem, Category, DeliveryNote } from '../types';
import { CATEGORIES } from '../constants';

interface InventoryListProps {
  inventory: InventoryItem[];
  deliveryNotes: DeliveryNote[];
  onUpdateStock: (id: string, amount: number) => void;
}

export default function InventoryList({ inventory, onUpdateStock, deliveryNotes }: InventoryListProps) {
  const [activeSubTab, setActiveSubTab] = useState<'stock' | 'history'>('stock');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('全部');
  
  // 历史单据查询状态
  const [historySearchVendor, setHistorySearchVendor] = useState('');
  const [historySearchDate, setHistorySearchDate] = useState('');
  const [selectedNote, setSelectedNote] = useState<DeliveryNote | null>(null);

  const filteredItems = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === '全部' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredHistory = deliveryNotes.filter(note => {
    const matchesVendor = note.vendorName.toLowerCase().includes(historySearchVendor.toLowerCase());
    const matchesDate = historySearchDate === '' || note.date.startsWith(historySearchDate);
    return matchesVendor && matchesDate;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-10">
      {/* Sub Tabs */}
      <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm mb-2">
        <button 
          onClick={() => setActiveSubTab('stock')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeSubTab === 'stock' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
        >
          <Package size={14} /> 实时库存
        </button>
        <button 
          onClick={() => setActiveSubTab('history')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeSubTab === 'history' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
        >
          <History size={14} /> 单据查询
        </button>
      </div>

      {activeSubTab === 'stock' ? (
        <>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="搜索食材..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 shadow-sm outline-none"
              />
            </div>
            <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 shadow-sm active:bg-slate-50">
              <SlidersHorizontal size={20} />
            </button>
          </div>

          <div className="flex overflow-x-auto gap-2 py-1 no-scrollbar">
            <button 
              onClick={() => setFilterCategory('全部')}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                filterCategory === '全部' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 border border-slate-100'
              }`}
            >
              全部
            </button>
            {CATEGORIES.map(c => (
              <button 
                key={c}
                onClick={() => setFilterCategory(c)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  filterCategory === c ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 border border-slate-100'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredItems.map((item) => {
              const isLow = item.currentStock < item.minStock;
              return (
                <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm active:scale-[0.98] transition-transform">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                        <p className="text-[10px] text-slate-400">{item.category} · 警戒:{item.minStock}{item.unit}</p>
                      </div>
                    </div>
                    {isLow && (
                      <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded">缺货</span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-xl font-black ${isLow ? 'text-red-500' : 'text-blue-600'}`}>
                        {item.currentStock}
                      </span>
                      <span className="text-xs text-slate-400">{item.unit}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => onUpdateStock(item.id, -1)}
                        className="w-9 h-9 flex items-center justify-center bg-slate-50 rounded-xl text-slate-600 active:bg-slate-200 transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <button 
                        onClick={() => onUpdateStock(item.id, 1)}
                        className="w-9 h-9 flex items-center justify-center bg-blue-50 rounded-xl text-blue-600 active:bg-blue-100 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="供应商" 
                value={historySearchVendor}
                onChange={(e) => setHistorySearchVendor(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="date" 
                value={historySearchDate}
                onChange={(e) => setHistorySearchDate(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredHistory.length > 0 ? filteredHistory.map(note => {
              const dateObj = new Date(note.date);
              const formattedName = `${note.vendorName}${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
              
              return (
                <div 
                  key={note.id} 
                  onClick={() => setSelectedNote(note)}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm active:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-sm font-bold text-slate-800">{formattedName}</h5>
                      <p className="text-[10px] text-slate-400 mt-1">记录时间: {dateObj.toLocaleString()}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {note.items.slice(0, 3).map((it, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[9px] text-slate-500">
                            {it.name} x{it.quantity}
                          </span>
                        ))}
                        {note.items.length > 3 && <span className="text-[9px] text-slate-300 self-center">...等{note.items.length}项</span>}
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                  </div>
                </div>
              );
            }) : (
              <div className="p-12 text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-3">
                  <History size={24} />
                </div>
                <p className="text-slate-400 text-xs">暂无匹配的入库单据</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {activeSubTab === 'stock' && filteredItems.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-slate-400 text-sm">没有找到相关食材</p>
        </div>
      )}

      {/* 单据详情 Modal */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-blue-600 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <FileText size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">入库单据详情</h4>
                  <p className="text-[10px] text-blue-100 opacity-80">{selectedNote.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedNote(null)} 
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">供应商</p>
                  <p className="text-xs font-bold text-slate-800">{selectedNote.vendorName}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">入库日期</p>
                  <p className="text-xs font-bold text-slate-800">
                    {new Date(selectedNote.date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">食材清单 ({selectedNote.items.length})</p>
                <div className="space-y-2">
                  {selectedNote.items.map((item, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{item.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1 text-[9px] text-slate-400">
                              <Tag size={10} /> {item.category}
                            </span>
                            {item.price > 0 && (
                              <span className="flex items-center gap-1 text-[9px] text-slate-400">
                                <DollarSign size={10} /> {item.price}/元
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <span className="text-sm font-black text-blue-600">{item.quantity}</span>
                          <span className="text-[10px] text-slate-400">{item.unit}</span>
                        </div>
                        <p className="text-[9px] text-slate-300">数量</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <button 
                onClick={() => setSelectedNote(null)}
                className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm shadow-sm active:scale-95 transition-all"
              >
                关闭窗口
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}