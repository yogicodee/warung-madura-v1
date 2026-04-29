import { Product, Transaction, Customer, DebtRecord } from '../types';

const KEYS = {
  PRODUCTS: 'tm_products',
  TRANSACTIONS: 'tm_transactions',
  CUSTOMERS: 'tm_customers',
  DEBTS: 'tm_debts',
  EXPENSES: 'tm_expenses'
};

export const storage = {
  // ... existing methods (I will replace the whole object to ensure consistency)
  getProducts: (): Product[] => {
    const data = localStorage.getItem(KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  },
  saveProducts: (products: Product[]) => {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  },
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(KEYS.TRANSACTIONS);
    return data ? JSON.parse(data).map((t: any) => ({ ...t, timestamp: new Date(t.timestamp) })) : [];
  },
  saveTransaction: (transaction: Transaction) => {
    const transactions = storage.getTransactions();
    transactions.push(transaction);
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
    const products = storage.getProducts();
    transaction.items.forEach(item => {
      const product = products.find(p => p.id === item.id);
      if (product) {
        product.stock -= item.quantity;
      }
    });
    storage.saveProducts(products);
  },
  getCustomers: (): Customer[] => {
    const data = localStorage.getItem(KEYS.CUSTOMERS);
    return data ? JSON.parse(data) : [];
  },
  saveCustomers: (customers: Customer[]) => {
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(customers));
  },
  getDebts: (): DebtRecord[] => {
    const data = localStorage.getItem(KEYS.DEBTS);
    return data ? JSON.parse(data).map((d: any) => ({ ...d, timestamp: new Date(d.timestamp) })) : [];
  },
  saveDebtRecord: (record: DebtRecord) => {
    const debts = storage.getDebts();
    debts.push(record);
    localStorage.setItem(KEYS.DEBTS, JSON.stringify(debts));
    const customers = storage.getCustomers();
    const customer = customers.find(c => c.id === record.customerId);
    if (customer) {
      if (record.type === 'Debt') {
        customer.totalDebt += record.amount;
      } else {
        customer.totalDebt -= record.amount;
      }
      storage.saveCustomers(customers);
    }
  },
  getExpenses: (): Expense[] => {
    const data = localStorage.getItem(KEYS.EXPENSES);
    return data ? JSON.parse(data).map((e: any) => ({ ...e, timestamp: new Date(e.timestamp) })) : [];
  },
  saveExpense: (expense: Expense) => {
    const expenses = storage.getExpenses();
    expenses.push(expense);
    localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
  }
};

// Seed initial data if empty
export const seedInitialData = () => {
  if (storage.getProducts().length === 0) {
    const initialProducts: Product[] = [
      { id: '1', name: 'Beras 1kg', category: 'Sembako', buyPrice: 12000, sellPrice: 15000, stock: 50, lowStockThreshold: 10, unit: 'Kg' },
      { id: '2', name: 'Minyak Goreng 1L', category: 'Sembako', buyPrice: 14000, sellPrice: 17000, stock: 20, lowStockThreshold: 5, unit: 'Botol' },
      { id: '3', name: 'Indomie Goreng', category: 'Sembako', buyPrice: 2800, sellPrice: 3500, stock: 120, lowStockThreshold: 20, unit: 'Pcs' },
      { id: '4', name: 'Teh Pucuk 350ml', category: 'Minuman', buyPrice: 3000, sellPrice: 4000, stock: 24, lowStockThreshold: 6, unit: 'Botol' },
      { id: '5', name: 'Aqua 600ml', category: 'Minuman', buyPrice: 2500, sellPrice: 3500, stock: 48, lowStockThreshold: 12, unit: 'Botol' },
    ];
    storage.saveProducts(initialProducts);
  }
  
  if (storage.getCustomers().length === 0) {
    const initialCustomers: Customer[] = [
      { id: 'c1', name: 'Pak Haji', phone: '08123456789', totalDebt: 0 },
      { id: 'c2', name: 'Bu RT', phone: '08987654321', totalDebt: 0 },
    ];
    storage.saveCustomers(initialCustomers);
  }
};
