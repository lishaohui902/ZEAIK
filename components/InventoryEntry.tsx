import React, { useState, useRef } from 'react';
import { Camera, FileUp, Plus, Trash2, CheckCircle, Loader2, X, Square, CheckSquare } from 'lucide-react';
import { scanDeliveryNote } from '../services/gemini';
import { Vendor, InventoryItem, DeliveryNote, DeliveryItem, Category } from '../types';
import { CATEGORIES, UNITS } from '../constants';

interface InventoryEntryProps {
  vendors: Vendor[];
  inventory: InventoryItem[];
  onComplete: (note: DeliveryNote) => void;
}

export default function InventoryEntry({ vendors, inventory, onComplete }: InventoryEntryProps) {
  const [entryMode, setEntryMode] = useState<'ai' | 'review'>('ai');
  const [isLoading, setIsLoading] = useState(false);
  const [vendorId, setVendorId] = useState('');
  const [items, setItems] = useState<DeliveryItem[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const result = await scanDeliveryNote(base64);
        const foundVendor = vendors.find(v => v.name.includes(result.vendorName) || result.vendorName.includes(v.name));
        if (foundVendor) setVendorId(foundVendor.id);
        setItems(result.items.map((it: any) => ({
          name: it.name,
          quantity: it.quantity,
          unit: it.unit,
          category: it.category as Category,
          price: it.price || 0
        })));
        setEntryMode('review');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      alert("识别失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const updateItem = (idx: number, updates: Partial<DeliveryItem>) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], ...updates };
    setItems(newItems);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
    const newSelected = new Set(selectedIndices);
    newSelected.delete(idx);
    setSelectedIndices(newSelected);
  };

  const toggleSelect = (idx: number) => {
    const newSelected = new Set(selectedIndices);
    if (newSelected.has(idx)) {
      newSelected.delete(idx);
    } else {
      newSelected.add(idx);
    }
    setSelectedIndices(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIndices.size === items.length && items.length > 0) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(items.map((_, i) => i)));
    }
  };

  const batchDelete = () => {
    if (selectedIndices.size === 0) return;
    setItems(items.filter((_, i) => !selectedIndices.has(i)));
    setSelectedIndices(new Set());
  };

  const handleSave = () => {
    if (!vendorId) {
      alert("请选择供应商");
      return;
    }
    if (items.length === 0) {
      alert("请至少添加一项食材");
      return;
    }
    const vendor = vendors.find(v => v.id === vendorId);
    onComplete({
      id: `dn-${Date.now()}`,
      vendorId,
      vendorName: vendor?.name || '未知',
      date: new Date().toISOString(),
      items,
      status: 'completed'
    });
  };

  if (entryMode === 'ai') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 animate-in zoom-in-95 duration-300">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shadow-inner">
          <Camera size={48} />
        </div>
        <div className="text-center px-6">
          <h3 className="text-xl font-black text-slate-800">拍照智能识单</h3>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            对准送货单拍照，AI 将自动提取供应商信息及菜品详情，无需手动录入。
          </p>
        </div>
        <div className="w-full space-y-3 px-4">
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Camera size={24} />}
            {isLoading ? '正在智能识别...' : '立即拍照 / 上传'}
          </button>
          <button 
            onClick={() => {
              setItems([{ name: '', quantity: 1, unit: 'kg', category: Category.OTHER, price: 0 }]);
              setEntryMode('review');
            }}
            className="w-full py-4 bg-white text-slate-600 rounded-2xl font-bold border border-slate-200 active:bg-slate-50"
          >
            手动录入
          </button>
        </div>
        <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800">确认单据信息</h3>
        <button onClick={() => { setEntryMode('ai'); setSelectedIndices(new Set()); }} className="text-blue-600 text-xs font-bold">重新扫描</button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">送货供应商</label>
          <select 
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
            className="w-full mt-1 p-2 bg-slate-50 border-none rounded-lg text-sm font-bold text-slate-700 outline-none"
          >
            <option value="">点击选择供应商</option>
            {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest"
            >
              {selectedIndices.size === items.length && items.length > 0 ? <CheckSquare size={14} className="text-blue-600" /> : <Square size={14} />}
              全选
            </button>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">清单内容 ({items.length})</label>
          </div>
          <div className="flex items-center gap-2">
            {selectedIndices.size > 0 && (
              <button 
                onClick={batchDelete}
                className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"
                title="删除选中"
              >
                <Trash2 size={16} />
                <span className="text-[10px] font-bold">{selectedIndices.size}</span>
              </button>
            )}
            <button 
              onClick={() => setItems([...items, { name: '', quantity: 1, unit: 'kg', category: Category.OTHER, price: 0 }])} 
              className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              title="添加一行"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
        
        {items.length > 0 ? items.map((item, idx) => (
          <div key={idx} className={`bg-white p-3 rounded-2xl border transition-all flex gap-3 relative overflow-hidden ${selectedIndices.has(idx) ? 'border-blue-500 bg-blue-50/20' : 'border-slate-100 shadow-sm'}`}>
            <div className="flex items-center">
              <button 
                onClick={() => toggleSelect(idx)}
                className={`transition-colors ${selectedIndices.has(idx) ? 'text-blue-600' : 'text-slate-300'}`}
              >
                {selectedIndices.has(idx) ? <CheckSquare size={20} /> : <Square size={20} />}
              </button>
            </div>
            
            <div className="flex-1 space-y-3">
              <div className="flex justify-between items-center">
                <input 
                  type="text" 
                  value={item.name} 
                  placeholder="商品名称"
                  onChange={(e) => updateItem(idx, { name: e.target.value })}
                  className="w-full font-bold text-slate-800 border-none p-0 focus:ring-0 text-sm bg-transparent"
                />
                <button onClick={() => removeItem(idx)} className="text-slate-300 hover:text-red-500 transition-colors ml-2">
                  <X size={16} />
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-50/50 p-2 rounded-lg">
                  <p className="text-[8px] text-slate-400 uppercase font-bold">数量</p>
                  <input 
                    type="number" 
                    value={item.quantity} 
                    onChange={(e) => updateItem(idx, { quantity: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-transparent border-none p-0 text-xs font-bold text-slate-700 focus:ring-0"
                  />
                </div>
                <div className="flex-1 bg-slate-50/50 p-2 rounded-lg">
                  <p className="text-[8px] text-slate-400 uppercase font-bold">单位</p>
                  <select 
                    value={item.unit}
                    onChange={(e) => updateItem(idx, { unit: e.target.value })}
                    className="w-full bg-transparent border-none p-0 text-xs font-bold text-slate-700 focus:ring-0"
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div className="flex-[1.5] bg-slate-50/50 p-2 rounded-lg">
                  <p className="text-[8px] text-slate-400 uppercase font-bold">品类</p>
                  <select 
                    value={item.category}
                    onChange={(e) => updateItem(idx, { category: e.target.value as Category })}
                    className="w-full bg-transparent border-none p-0 text-xs font-bold text-slate-700 focus:ring-0"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-3xl">
            <p className="text-slate-300 text-xs font-bold">清单为空，请点击右上角“+”添加食材</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-24 left-4 right-4 max-w-md mx-auto">
        <button 
          onClick={handleSave}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
          disabled={items.length === 0}
        >
          <CheckCircle size={20} />
          完成入库
        </button>
      </div>
    </div>
  );
}