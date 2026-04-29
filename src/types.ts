
export type Category = 'Sembako' | 'Minuman' | 'Snack' | 'Rokok' | 'Pulsa' | 'Listrik' | 'Bensin' | 'Lainnya';

export interface Product {
  id: string;
  name: string;
  category: Category;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  lowStockThreshold: number;
  unit: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type PaymentMethod = 'Tunai' | 'Hutang';

export interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  paymentMethod: PaymentMethod;
  customerId?: string; // If Hutang
  timestamp: Date;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  totalDebt: number;
}

export interface DebtRecord {
  id: string;
  customerId: string;
  amount: number;
  type: 'Debt' | 'Payment';
  timestamp: Date;
  transactionId?: string;
  note?: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  note: string;
  timestamp: Date;
}
