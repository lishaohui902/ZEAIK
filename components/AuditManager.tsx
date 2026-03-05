import React, { useState, useEffect } from 'react';
import { ClipboardList, Utensils, Search, CheckCircle, History, ChevronRight, Calendar, Filter, Trash2, Plus, X, FileText, ArrowRight, Hash } from 'lucide-react';
import { InventoryItem, AuditRecord, AuditType } from '../types';

interface AuditManagerProps {
  inventory: InventoryItem[];
  auditRecords: AuditRecord[];
  onSave: (record: AuditRecord) => void;
}

const CONSUMPTION_TYPES = ['老板带走', '员工餐', '试菜', '临时菜'];

export default function AuditManager({ inventory, auditRecords, onSave }: AuditManagerProps) {
  const [view, setView] = useState<'audit' | 'consumption' | 'query'>('audit');
  const [editStates, setEditStates] = useState<Record<string, number>>({});
  const [selectedConsumptionType, setSelectedConsumptionType] = useState('员工餐');
  
  // 列表管理
  const [visibleAuditIds, setVisibleAuditIds] = useState<string[]>([]);
  const [visibleConsumptionIds, setVisibleConsumptionIds] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDetailRecord, setSelectedDetailRecord] = useState<AuditRecord | null>(null);

  // 初始化列表（默认显示全部）
  useEffect(() => {
    const allIds = inventory.map(i => i.id);
    setVisibleAuditIds(allIds);
    setVisibleConsumptionIds(allIds);
  }, [inventory]);

  // 当切换视图时，清空选择状态
  useEffect(() => {
    setSelectedIds(new Set());
  }, [view]);

  // 筛选状态
  const [searchDate, setSearchDate] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'DAILY_AUDIT' | 'CONSUMPTION'>('ALL');

  const handleInputChange = (id: string, value: string) => {
    const num = parseFloat(value);
    setEditStates(prev => ({ ...prev, [id]: isNaN(num) ? 0 : num }));
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const currentVisibleIds = view === 'audit' ? visibleAuditIds : visibleConsumptionIds;

  const toggleSelectAll = () => {
    if (selectedIds.size === currentVisibleIds.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(currentVisibleIds));
    }
  };

  const batchDelete = () => {
    if (selectedIds.size === 0) return;
    if (view === 'audit') {
      setVisibleAuditIds(prev => prev.filter(id => !selectedIds.has(id)));
    } else {
      setVisibleConsumptionIds(prev => prev.filter(id => !selectedIds.has(id)));
    }
    setSelectedIds(new Set());
  };

  const addItemToView = (id: string) => {
    if (view === 'audit') {
      if (!visibleAuditIds.includes(id)) setVisibleAuditIds(prev => [...prev, id]);
    } else {
      if (!visibleConsumptionIds.includes(id)) setVisibleConsumptionIds(prev => [...prev, id]);
    }
    setShowAddModal(false);
  };

  const submit = (type: AuditType) => {
    const activeIds = type === 'DAILY_AUDIT' ? visibleAuditIds : visibleConsumptionIds;
    const itemsToProcess = inventory.filter(i => activeIds.includes(i.id));

    const items = itemsToProcess
      .filter(item => editStates[item.id] !== undefined && editStates[item.id] !== 0)
      .map(item => ({
        itemId: item.id,
        itemName: item.name,
        previousStock: item.currentStock,
        newStock: type === 'DAILY_AUDIT' 
          ? editStates[item.id] 
          : Math.max(0, item.currentStock - editStates[item.id]),
        diff: type === 'DAILY_AUDIT' 
          ? editStates[item.id] - item.currentStock 
          : -editStates[item.id]
      }));

    if (items.length === 0) {
      alert("请至少输入一项有效数据");
      return;
    }

    const record: AuditRecord = {
      id: `audit-${Date.now()}`,
      date: new Date().toISOString(),
      type,
      consumptionType: type === 'CONSUMPTION' ? selectedConsumptionType : undefined,
      items
    };

    onSave(record);
    setEditStates({});
    setSelectedIds(new Set());
  };

  const filteredAuditRecords = auditRecords.filter(record => {
    const dateMatch = searchDate === '' || record.date.startsWith(searchDate);
    const typeMatch = filterType === 'ALL' || record.type === filterType;
    return dateMatch && typeMatch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Sub Tabs */}
      <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
        <button 
          onClick={() => setView('audit')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${view === 'audit' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
        >
          <ClipboardList size={14} /> 每日盘点
        </button>
        <button 
          onClick={() => setView('consumption')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${view === 'consumption' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
        >
          <Utensils size={14} /> 消耗填写
        </button>
        <button 
          onClick={() => setView('query')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${view === 'query' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
        >
          <Search size={14} /> 单据查询
        </button>
      </div>

      {view !== 'query' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className={`${view === 'audit' ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'} px-4 py-3 rounded-2xl border flex-1 mr-3`}>
              <h4 className={`font-bold text-sm ${view === 'audit' ? 'text-blue-800' : 'text-orange-800'}`}>
                {view === 'audit' ? '当前待盘点项' : '当前消耗录入项'}
              </h4>
              <p className={`text-[10px] mt-1 ${view === 'audit' ? 'text-blue-600' : 'text-orange-600'}`}>
                {view === 'audit' ? '勾选并录入实存，未填写的项将不会被更新。' : '勾选并录入消耗量。'}
              </p>
            </div>
            {selectedIds.size > 0 && (
              <button 
                onClick={batchDelete}
                className="p-3 bg-red-50 text-red-600 rounded-2xl border border-red-100 shadow-sm active:scale-95 transition-all flex items-center gap-2"
              >
                <Trash2 size={18} />
                <span className="text-xs font-bold">{selectedIds.size}</span>
              </button>
            )}
          </div>

          {view === 'consumption' && (
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">消耗类型</label>
              <div className="flex flex-wrap gap-2">
                {CONSUMPTION_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedConsumptionType(type)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                      selectedConsumptionType === type 
                        ? 'bg-orange-600 text-white border-orange-600 shadow-sm' 
                        : 'bg-white text-slate-500 border-slate-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 px-1 mb-1">
             <button 
                onClick={toggleSelectAll}
                className={`text-[10px] font-bold transition-colors ${selectedIds.size === currentVisibleIds.length ? 'text-blue-600' : 'text-slate-400'}`}
             >
               {selectedIds.size === currentVisibleIds.length ? '取消全选' : '全选项'}
             </button>
          </div>

          <div className="space-y-3">
            {inventory.filter(i => currentVisibleIds.includes(i.id)).map(item => (
              <div key={item.id} className={`bg-white p-4 rounded-2xl border transition-all flex items-center gap-3 ${selectedIds.has(item.id) ? (view === 'audit' ? 'border-blue-500 bg-blue-50/30' : 'border-orange-500 bg-orange-50/30') : 'border-slate-100'}`}>
                <input 
                  type="checkbox" 
                  checked={selectedIds.has(item.id)}
                  onChange={() => toggleSelect(item.id)}
                  className={`w-5 h-5 rounded-lg border-slate-300 focus:ring-offset-0 ${view === 'audit' ? 'text-blue-600 focus:ring-blue-500' : 'text-orange-600 focus:ring-orange-500'}`}
                />
                <div className="flex-1">
                  <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                  <p className="text-[10px] text-slate-400">
                    {view === 'audit' ? `账面：${item.currentStock}${item.unit}` : `可用：${item.currentStock}${item.unit}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    placeholder={view === 'audit' ? "实存" : "消耗"}
                    value={editStates[item.id] ?? ''}
                    onChange={(e) => handleInputChange(item.id, e.target.value)}
                    className={`w-20 text-right px-2 py-1.5 bg-slate-50 border-none rounded-lg text-sm font-bold focus:ring-2 ${view === 'audit' ? 'text-blue-600 focus:ring-blue-500' : 'text-orange-600 focus:ring-orange-500'}`}
                  />
                  <span className="text-xs text-slate-400 font-medium">{item.unit}</span>
                </div>
              </div>
            ))}

            <button 
              onClick={() => setShowAddModal(true)}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 flex items-center justify-center gap-2 hover:border-blue-300 hover:text-blue-500 transition-all active:scale-[0.98]"
            >
              <Plus size={20} />
              <span className="text-sm font-bold">增加一行/新增食材</span>
            </button>
          </div>

          <button 
            onClick={() => submit(view === 'audit' ? 'DAILY_AUDIT' : 'CONSUMPTION')}
            className={`w-full py-4 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${view === 'audit' ? 'bg-blue-600 shadow-blue-200' : 'bg-orange-600 shadow-orange-200'}`}
          >
            <CheckCircle size={20} />
            {view === 'audit' ? '提交盘点结果' : '提交消耗记录'}
          </button>
        </div>
      )}

      {view === 'query' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="date" 
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('ALL')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  filterType === 'ALL' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-100'
                }`}
              >
                全部单据
              </button>
              <button
                onClick={() => setFilterType('DAILY_AUDIT')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  filterType === 'DAILY_AUDIT' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-100'
                }`}
              >
                盘点单据
              </button>
              <button
                onClick={() => setFilterType('CONSUMPTION')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  filterType === 'CONSUMPTION' ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-slate-500 border-slate-100'
                }`}
              >
                消耗单据
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredAuditRecords.length > 0 ? filteredAuditRecords.map(record => (
              <div 
                key={record.id} 
                onClick={() => setSelectedDetailRecord(record)}
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm active:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${record.type === 'DAILY_AUDIT' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                      {record.type === 'DAILY_AUDIT' ? <ClipboardList size={16} /> : <Utensils size={16} />}
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        {record.type === 'DAILY_AUDIT' ? '盘点单据' : '消耗单据'}
                        {record.consumptionType && (
                          <span className="px-1.5 py-0.5 bg-orange-50 text-orange-600 text-[9px] border border-orange-100 rounded">
                            {record.consumptionType}
                          </span>
                        )}
                      </h5>
                      <p className="text-[10px] text-slate-400">{new Date(record.date).toLocaleString()}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {record.items.slice(0, 3).map((it, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[9px] text-slate-500 font-medium">
                      {it.itemName}: {it.diff > 0 ? '+' : ''}{it.diff}
                    </span>
                  ))}
                  {record.items.length > 3 && (
                    <span className="text-[9px] text-slate-300 self-center">等{record.items.length}项...</span>
                  )}
                </div>
              </div>
            )) : (
              <div className="p-12 text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-3">
                  <Filter size={24} />
                </div>
                <p className="text-slate-400 text-xs">暂无匹配的单据记录</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-bold text-slate-800">添加{view === 'audit' ? '盘点' : '消耗'}食材</h4>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 bg-slate-50 rounded-full text-slate-400">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {inventory
                .filter(item => !currentVisibleIds.includes(item.id))
                .map(item => (
                  <button 
                    key={item.id}
                    onClick={() => addItemToView(item.id)}
                    className="w-full p-3 flex items-center justify-between hover:bg-slate-50 rounded-2xl transition-colors text-left"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-700">{item.name}</p>
                      <p className="text-[10px] text-slate-400">{item.category} · 当前库存:{item.currentStock}{item.unit}</p>
                    </div>
                    <div className={`p-1.5 rounded-lg ${view === 'audit' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                      <Plus size={16} />
                    </div>
                  </button>
                ))}
              {inventory.filter(item => !currentVisibleIds.includes(item.id)).length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  所有库存食材已在列表中
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedDetailRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className={`p-5 border-b border-slate-50 flex items-center justify-between text-white ${selectedDetailRecord.type === 'DAILY_AUDIT' ? 'bg-blue-600' : 'bg-orange-600'}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  {selectedDetailRecord.type === 'DAILY_AUDIT' ? <ClipboardList size={20} /> : <Utensils size={20} />}
                </div>
                <div>
                  <h4 className="font-bold text-sm">
                    {selectedDetailRecord.type === 'DAILY_AUDIT' ? '盘点单据详情' : '消耗单据详情'}
                  </h4>
                  <p className="text-[10px] opacity-80">{new Date(selectedDetailRecord.date).toLocaleString()}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDetailRecord(null)} 
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-around text-center">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">食材项</p>
                  <p className="text-sm font-black text-slate-800">{selectedDetailRecord.items.length}</p>
                </div>
                <div className="w-px h-8 bg-slate-200"></div>
                {selectedDetailRecord.consumptionType && (
                  <>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">消耗类型</p>
                      <p className="text-sm font-black text-orange-600">{selectedDetailRecord.consumptionType}</p>
                    </div>
                    <div className="w-px h-8 bg-slate-200"></div>
                  </>
                )}
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">差异项</p>
                  <p className="text-sm font-black text-slate-800">
                    {selectedDetailRecord.items.filter(it => it.diff !== 0).length}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">明细列表</p>
                <div className="space-y-2.5">
                  {selectedDetailRecord.items.map((item, idx) => (
                    <div key={idx} className="bg-white p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-slate-200 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-800">{item.itemName}</p>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${item.diff === 0 ? 'bg-slate-50 text-slate-400' : (item.diff > 0 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600')}`}>
                            {item.diff > 0 ? `+${item.diff}` : item.diff}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-400">账面: {item.previousStock}</span>
                          <ArrowRight size={10} className="text-slate-300" />
                          <span className={`text-[10px] font-bold ${selectedDetailRecord.type === 'DAILY_AUDIT' ? 'text-blue-600' : 'text-orange-600'}`}>
                            {selectedDetailRecord.type === 'DAILY_AUDIT' ? `实存: ${item.newStock}` : `消耗: ${Math.abs(item.diff)}`}
                          </span>
                        </div>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-xl">
                        <Hash size={14} className="text-slate-300" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <button 
                onClick={() => setSelectedDetailRecord(null)}
                className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm shadow-sm active:scale-95 transition-all"
              >
                关闭详情
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}