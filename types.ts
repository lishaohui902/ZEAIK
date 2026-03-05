
export enum Category {
  SEAFOOD = '海鲜',
  DRY_GOODS = '干果',
  FRUIT = '水果',
  VEGETABLE = '蔬菜',
  MEAT = '肉类',
  SEASONING = '调料',
  BEVERAGE = '酒水',
  OTHER = '其他'
}

export interface Vendor {
  id: string;
  name: string;
  contact: string;
  phone: string;
  address: string;
  categories: Category[];
  paymentMethod: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: Category;
  unit: string;
  price: number;
  currentStock: number;
  minStock: number;
  lastRestockDate?: string;
}

export interface DeliveryNote {
  id: string;
  vendorId: string;
  vendorName: string;
  date: string;
  items: DeliveryItem[];
  status: 'pending' | 'completed';
}

export interface DeliveryItem {
  name: string;
  quantity: number;
  unit: string;
  category: Category;
  price: number;
}

export type AuditType = 'DAILY_AUDIT' | 'CONSUMPTION';

export interface AuditRecord {
  id: string;
  date: string;
  type: AuditType;
  consumptionType?: string;
  items: {
    itemId: string;
    itemName: string;
    previousStock: number;
    newStock: number;
    diff: number;
  }[];
}
