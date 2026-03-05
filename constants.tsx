
import React from 'react';
import { 
  Package, 
  Camera, 
  ClipboardCheck
} from 'lucide-react';

export const CATEGORIES = [
  '海鲜', '干果', '水果', '蔬菜', '肉类', '调料', '酒水', '其他'
];

export const UNITS = [
  'kg', 'g', '瓶', '箱', '个', '袋', '升', '斤'
];

export const NAV_ITEMS = [
  { id: 'inventory', label: '库存查询', icon: <Package size={20} /> },
  { id: 'delivery', label: '食材入库', icon: <Camera size={26} />, isCenter: true },
  { id: 'audit', label: '盘点管理', icon: <ClipboardCheck size={20} /> },
];
