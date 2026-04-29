/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart3, 
  Plus, 
  Search, 
  Trash2, 
  ChevronRight, 
  ArrowLeft,
  Save,
  X,
  PlusCircle,
  MinusCircle,
  AlertTriangle,
  Receipt,
  Wallet,
  History
} from 'lucide-react';
import { storage, seedInitialData } from './services/storage';
import { Product, CartItem, Category, Transaction, PaymentMethod, Customer, DebtRecord, Expense } from './types';
import { cn, formatCurrency } from './lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

type Screen = 'dashboard' | 'pos' | 'inventory' | 'debt' | 'reports' | 'expenses';

export default function App() {
  const [screen, setScreen] = useState<Screen>('dashboard'); // Start with Dashboard as the front page
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<DebtRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
  useEffect(() => {
    seedInitialData();
    refreshData();
  }, []);

  const refreshData = () => {
    setProducts(storage.getProducts());
    setCustomers(storage.getCustomers());
    setTransactions(storage.getTransactions());
    setDebts(storage.getDebts());
    setExpenses(storage.getExpenses());
  };

  const lowStockItems = products.filter(p => p.stock <= p.lowStockThreshold);
  const totalDebt = customers.reduce((sum, c) => sum + c.totalDebt, 0);
  const todaySales = transactions
    .filter(t => t.timestamp.toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + t.total, 0);

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-20 bg-blue-700 flex flex-col items-center py-6 gap-6 text-white shrink-0">
        <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center text-blue-900 font-bold text-xl shadow-lg mb-6">TM</div>
        
        <SidebarNavItem 
          icon={<ShoppingCart size={24} />} 
          label="Kasir" 
          active={screen === 'pos'} 
          onClick={() => setScreen('pos')} 
        />
        <SidebarNavItem 
          icon={<LayoutDashboard size={24} />} 
          label="Home" 
          active={screen === 'dashboard'} 
          onClick={() => setScreen('dashboard')} 
        />
        <SidebarNavItem 
          icon={<Package size={24} />} 
          label="Stok" 
          active={screen === 'inventory'} 
          onClick={() => setScreen('inventory')} 
        />
        <SidebarNavItem 
          icon={<Users size={24} />} 
          label="Hutang" 
          active={screen === 'debt'} 
          onClick={() => setScreen('debt')} 
        />
        <SidebarNavItem 
          icon={<Wallet size={24} />} 
          label="Biaya" 
          active={screen === 'expenses'} 
          onClick={() => setScreen('expenses')} 
        />
        
        <div className="mt-auto">
          <SidebarNavItem 
            icon={<BarChart3 size={24} />} 
            label="Laporan" 
            active={screen === 'reports'} 
            onClick={() => setScreen('reports')} 
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              {screen === 'pos' && 'Kasir Toko Madura'}
              {screen === 'dashboard' && 'Dashboard Operasional'}
              {screen === 'inventory' && 'Manajemen Stok Barang'}
              {screen === 'debt' && 'Buku Catatan Kasbon'}
              {screen === 'reports' && 'Laporan Penjualan'}
            </h1>
            <div className="flex items-center gap-2">
              <div className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded tracking-widest uppercase">ONLINE</div>
              <div className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-1 rounded tracking-widest uppercase">OFFLINE MODE READY</div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-xs font-bold text-slate-700">Petugas: Admin Toko</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-white shadow-md flex items-center justify-center text-white font-bold">A</div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {screen === 'dashboard' && (
              <DashboardScreen 
                products={products}
                transactions={transactions}
                lowStockItems={lowStockItems}
                onNavigate={(s) => setScreen(s)}
              />
            )}
            {screen === 'pos' && (
              <POSScreen 
                products={products}
                customers={customers}
                onComplete={() => {
                  refreshData();
                  setScreen('dashboard');
                }}
              />
            )}
            {screen === 'inventory' && (
              <InventoryScreen 
                products={products}
                onUpdate={() => refreshData()}
              />
            )}
            {screen === 'debt' && (
              <DebtScreen 
                customers={customers}
                debts={debts}
                onUpdate={() => refreshData()}
              />
            )}
            {screen === 'reports' && (
              <ReportsScreen 
                transactions={transactions}
                expenses={expenses}
              />
            )}
            {screen === 'expenses' && (
              <ExpensesScreen 
                expenses={expenses}
                onUpdate={() => refreshData()}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Quick Stats Footer */}
        <footer className="h-12 bg-slate-800 text-slate-400 px-6 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest shrink-0">
          <div className="flex gap-8">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> 
              Penjualan Hari Ini: <b className="text-white ml-1">{formatCurrency(todaySales)}</b>
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div> 
              Total Hutang: <b className="text-white ml-1">{formatCurrency(totalDebt)}</b>
            </span>
          </div>
          <div className="flex gap-6 items-center">
            {lowStockItems.length > 0 && (
              <span className="text-red-400">⚠️ {lowStockItems.length} Produk Perlu Restok</span>
            )}
            <span className="text-slate-500">V2.4.0-STABLE</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

function SidebarNavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex flex-col items-center gap-1 py-4 transition-all relative",
        active ? "bg-blue-800 opacity-100" : "opacity-60 hover:opacity-100 hover:bg-blue-800/50"
      )}
    >
      {active && <div className="absolute right-0 top-0 bottom-0 w-1 bg-yellow-400 shadow-[0_0_8px_white]" />}
      <div className={cn(active ? "text-yellow-400 scale-110" : "text-white")}>{icon}</div>
      <span className="text-[10px] font-bold uppercase tracking-tighter mt-1">{label}</span>
    </button>
  );
}

// --- Sub-components ---

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-colors",
        active ? "text-blue-600" : "text-slate-400"
      )}
    >
      {icon}
      <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
      {active && <motion.div layoutId="nav-dot" className="w-1 h-1 bg-blue-600 rounded-full" />}
    </button>
  );
}

function DashboardScreen({ products, transactions, lowStockItems, onNavigate }: { 
  products: Product[], 
  transactions: Transaction[], 
  lowStockItems: Product[],
  onNavigate: (s: Screen) => void 
}) {
  const todaySales = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    return transactions
      .filter(t => t.timestamp >= today)
      .reduce((sum, t) => sum + t.total, 0);
  }, [transactions]);

  const totalProducts = products.length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 space-y-8 overflow-y-auto h-full scrollbar-hide"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Selamat Datang! 👋</h2>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Panel Kontrol Toko Madura</p>
      </div>

      <div className="flex items-center gap-2 text-[10px] bg-blue-100 text-blue-600 px-3 py-1.5 rounded-full w-fit font-black uppercase tracking-widest">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
        Operasional Toko Aktif
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-blue-700 text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <ShoppingCart size={80} />
          </div>
          <p className="text-blue-200 text-xs font-black uppercase tracking-widest mb-1">Omzet Hari Ini</p>
          <p className="text-3xl font-black">{formatCurrency(todaySales)}</p>
        </div>
        
        <div className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Inventory</p>
            <p className="text-3xl font-black text-slate-800">{totalProducts} <span className="text-sm font-medium text-slate-400">Items</span></p>
          </div>
          <div className="h-1 bg-slate-100 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-blue-500 w-3/4 rounded-full" />
          </div>
        </div>

        <div className={cn(
          "p-6 rounded-[2rem] shadow-sm flex flex-col justify-between transition-colors",
          lowStockItems.length > 0 ? "bg-red-50 border border-red-100" : "bg-green-50 border border-green-100"
        )}>
          <div>
            <p className={cn(
              "text-xs font-black uppercase tracking-widest mb-1",
              lowStockItems.length > 0 ? "text-red-500" : "text-green-500"
            )}>Status Stok</p>
            <p className={cn(
              "text-3xl font-black",
              lowStockItems.length > 0 ? "text-red-600" : "text-green-600"
            )}>
              {lowStockItems.length > 0 ? `${lowStockItems.length} Menipis` : 'Aman'}
            </p>
          </div>
          <button 
            onClick={() => onNavigate('inventory')}
            className="text-[10px] font-black uppercase tracking-widest underline mt-2 text-slate-400 hover:text-blue-600"
          >
            Update Inventaris
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm grow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-black text-slate-800 uppercase tracking-widest text-sm flex items-center gap-2">
              <History size={18} className="text-slate-400" />
              Transaksi Terakhir
            </h2>
            <button onClick={() => onNavigate('reports')} className="text-[10px] font-black text-blue-600 hover:underline">LIHAT SEMUA</button>
          </div>
          <div className="space-y-4">
            {transactions.slice(-6).reverse().map(t => (
              <div key={t.id} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0 group hover:bg-slate-50 transition-colors px-2 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                    <Receipt size={18} />
                  </div>
                  <div>
                    <p className="font-black text-sm text-slate-800">{formatCurrency(t.total)}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {t.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {t.paymentMethod}
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300" />
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-300 text-xs font-bold uppercase tracking-widest italic">Belum Ada Transaksi</p>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <div className="bg-yellow-400 p-6 rounded-3xl shadow-lg shadow-yellow-100">
            <h3 className="font-black text-blue-900 text-sm uppercase tracking-widest mb-4">Pilih Menu Operasional</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => onNavigate('pos')}
              className="bg-white/40 hover:bg-white/60 p-4 rounded-2xl flex flex-col items-center gap-3 transition-all group border border-white/20"
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-900 shadow-sm group-hover:scale-110 transition-transform">
                <ShoppingCart size={24} />
              </div>
              <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Kasir / Jualan</span>
            </button>
            <button 
              onClick={() => onNavigate('inventory')}
              className="bg-white/40 hover:bg-white/60 p-4 rounded-2xl flex flex-col items-center gap-3 transition-all group border border-white/20"
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-900 shadow-sm group-hover:scale-110 transition-transform">
                <Package size={24} />
              </div>
              <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Manajemen Stok</span>
            </button>
          </div>
        </div>

          {lowStockItems.length > 0 && (
            <div className="bg-slate-900 p-6 rounded-3xl text-white">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={18} className="text-yellow-400" />
                <h3 className="text-xs font-black uppercase tracking-widest">Peringatan Rekomendasi</h3>
              </div>
              <div className="space-y-3">
                {lowStockItems.slice(0, 4).map(item => (
                  <div key={item.id} className="flex justify-between items-center text-[10px] border-b border-white/10 pb-2 font-bold uppercase tracking-widest">
                    <span className="text-slate-400">{item.name}</span>
                    <span className="text-red-400">{item.stock} {item.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );
}

function POSScreen({ products, customers, onComplete }: { 
  products: Product[], 
  customers: Customer[],
  onComplete: () => void 
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Semua'>('Semua');
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Tunai');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const categories: (Category | 'Semua')[] = ['Semua', 'Sembako', 'Minuman', 'Snack', 'Rokok', 'Pulsa', 'Bensin', 'Lainnya'];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        const p = products.find(prod => prod.id === id);
        if (p && newQty > p.stock) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const total = cart.reduce((sum, item) => sum + (item.sellPrice * item.quantity), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'Hutang' && !selectedCustomerId) {
      alert('Pilih pelanggan untuk sistem hutang!');
      return;
    }

    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      items: cart,
      total,
      paymentMethod,
      customerId: paymentMethod === 'Hutang' ? selectedCustomerId : undefined,
      timestamp: new Date()
    };

    storage.saveTransaction(transaction);

    if (paymentMethod === 'Hutang') {
      storage.saveDebtRecord({
        id: Math.random().toString(36).substr(2, 9),
        customerId: selectedCustomerId,
        amount: total,
        type: 'Debt',
        timestamp: new Date(),
        transactionId: transaction.id,
        note: `Belanja ${cart.length} item`
      });
    }

    onComplete();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full grid grid-cols-12 gap-4 p-4"
    >
      {/* Left: Product Selection */}
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 overflow-hidden">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest whitespace-nowrap border transition-all",
                selectedCategory === cat 
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm" 
                  : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari produk atau scan barcode..." 
            className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto pr-1 pb-4 scrollbar-hide">
          {filteredProducts.map(p => (
            <button 
              key={p.id}
              onClick={() => addToCart(p)}
              disabled={p.stock <= 0}
              className={cn(
                "bg-white p-3 rounded-xl border shadow-sm flex flex-col justify-between text-left transition-all active:scale-95",
                "hover:border-blue-400 hover:shadow-md",
                p.stock <= 0 ? "opacity-50 grayscale border-slate-100" : "border-slate-200"
              )}
            >
              <div>
                <p className={cn(
                  "text-[9px] font-black uppercase tracking-widest mb-1",
                  p.category === 'Rokok' ? 'text-red-500' : 'text-blue-600'
                )}>{p.category}</p>
                <h3 className="text-sm font-bold text-slate-800 leading-tight line-clamp-2 min-h-[2.5rem]">{p.name}</h3>
              </div>
              <div className="mt-4 flex justify-between items-end">
                <span className={cn(
                  "text-[10px] uppercase font-bold",
                  p.stock <= p.lowStockThreshold ? "text-red-500 italic underline" : "text-slate-400"
                )}>
                  Stok: {p.stock}
                </span>
                <span className="font-black text-blue-700 text-sm">{formatCurrency(p.sellPrice)}</span>
              </div>
            </button>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 font-medium italic">
              Produk tidak ditemukan
            </div>
          )}
        </div>
      </div>

      {/* Right: Cart & Checkout Summary */}
      <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 rounded-2xl flex flex-col shadow-xl overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between shrink-0 bg-slate-50/50">
          <h2 className="font-black text-slate-800 text-sm uppercase tracking-widest">Transaksi Baru</h2>
          <button 
            onClick={() => setCart([])}
            className="text-red-500 text-[10px] font-black uppercase tracking-tighter hover:underline"
          >
            Hapus Semua
          </button>
        </div>
        
        {/* Order Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {cart.map(item => (
            <div key={item.id} className="flex justify-between items-start animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-800 leading-tight">{item.name}</h4>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">{item.quantity} x {formatCurrency(item.sellPrice)}</p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button 
                  onClick={() => updateCartQuantity(item.id, -1)}
                  className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                >
                  <MinusCircle size={16} className="text-slate-600" />
                </button>
                <span className="font-black text-sm w-4 text-center">{item.quantity}</span>
                <button 
                  onClick={() => updateCartQuantity(item.id, 1)}
                  className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors"
                >
                  <PlusCircle size={16} />
                </button>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-3 py-12">
              <ShoppingCart size={48} className="opacity-20" />
              <p className="text-xs font-black uppercase tracking-widest">Keranjang Kosong</p>
            </div>
          )}
        </div>

        {/* Checkout Summary Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 space-y-4 shrink-0">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-tight">Subtotal</span>
            <span className="text-sm font-black">{formatCurrency(total)}</span>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 bg-white p-1 rounded-xl border border-slate-200">
              <button 
                onClick={() => setPaymentMethod('Tunai')}
                className={cn(
                  "py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all",
                  paymentMethod === 'Tunai' ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-slate-400 hover:bg-slate-50"
                )}
              >
                TUNAI
              </button>
              <button 
                onClick={() => setPaymentMethod('Hutang')}
                className={cn(
                  "py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all",
                  paymentMethod === 'Hutang' ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-slate-400 hover:bg-slate-50"
                )}
              >
                KASBON (HUTANG)
              </button>
            </div>

            {paymentMethod === 'Hutang' && (
              <select 
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">PELANGGAN KASBON...</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({formatCurrency(c.totalDebt)})</option>)}
              </select>
            )}
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
            <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Total Bayar</span>
            <span className="text-2xl font-black text-blue-700">{formatCurrency(total)}</span>
          </div>
          
          <button 
            disabled={cart.length === 0 || (paymentMethod === 'Hutang' && !selectedCustomerId)}
            onClick={handleCheckout}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-4 rounded-2xl font-black text-sm tracking-widest shadow-lg flex items-center justify-center gap-2 transform active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
          >
            <Receipt size={18} />
            BAYAR SEKARANG
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function InventoryScreen({ products, onUpdate }: { products: Product[], onUpdate: () => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  
  const [formData, setFormData] = useState<Partial<Product>>({
    category: 'Sembako',
    unit: 'Pcs',
    lowStockThreshold: 5
  });

  const categories: Category[] = ['Sembako', 'Minuman', 'Snack', 'Rokok', 'Pulsa', 'Listrik', 'Bensin', 'Lainnya'];

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentProducts = storage.getProducts();
    
    if (editingId) {
      storage.saveProducts(currentProducts.map(p => 
        p.id === editingId ? { ...p, ...formData } as Product : p
      ));
    } else {
      const newProduct: Product = {
        ...(formData as Product),
        id: Math.random().toString(36).substr(2, 9)
      };
      storage.saveProducts([...currentProducts, newProduct]);
    }
    
    setIsAdding(false);
    setEditingId(null);
    setFormData({ category: 'Sembako', unit: 'Pcs', lowStockThreshold: 5 });
    onUpdate();
  };

  const deleteProduct = (id: string) => {
    if (confirm('Hapus produk ini dari sistem?')) {
      storage.saveProducts(products.filter(p => p.id !== id));
      onUpdate();
    }
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setFormData(p);
    setIsAdding(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="p-6 h-full flex flex-col gap-6 overflow-hidden"
    >
      <div className="flex justify-between items-center shrink-0">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari barang di stok..." 
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 transition-all active:scale-95 ml-4"
        >
          <Plus size={18} /> Tambah Barang
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-hide pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProducts.map(p => (
            <div key={p.id} className="bg-white border border-slate-200 p-4 rounded-[1.5rem] flex flex-col justify-between shadow-sm hover:border-blue-400 transition-all group">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded",
                      p.category === 'Rokok' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                    )}>{p.category}</span>
                    {p.stock <= p.lowStockThreshold && (
                      <span className="bg-orange-100 text-orange-600 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded">TIPIS</span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-800 leading-tight line-clamp-1">{p.name}</h3>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(p)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Search size={16} /></button>
                  <button onClick={() => deleteProduct(p.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-50 mt-auto">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Harga Jual</p>
                  <p className="font-black text-blue-700">{formatCurrency(p.sellPrice)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sisa Stok</p>
                  <p className={cn(
                    "font-black",
                    p.stock <= p.lowStockThreshold ? "text-red-600" : "text-slate-800"
                  )}>{p.stock} <span className="text-[10px] font-medium text-slate-400 uppercase">{p.unit}</span></p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center justify-center opacity-20">
            <Package size={64} />
            <p className="mt-4 font-black uppercase tracking-widest text-sm">Stok Kosong / Tidak Ditemukan</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-800">{editingId ? 'Edit Barang' : 'Barang Baru'}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Detail Informasi Produk</p>
                </div>
                <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nama Produk</label>
                  <input 
                    required
                    autoFocus
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Contoh: Beras Premium 1kg"
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kategori</label>
                    <select 
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Satuan</label>
                    <input 
                      placeholder="Pcs, Kg, Ltr, dsb"
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      value={formData.unit || ''}
                      onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Harga Beli (Modal)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs uppercase">Rp</span>
                      <input 
                        type="number"
                        className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all text-blue-700"
                        value={formData.buyPrice || ''}
                        onChange={e => setFormData({ ...formData, buyPrice: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Harga Jual</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs uppercase">Rp</span>
                      <input 
                        type="number"
                        className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all text-blue-700"
                        value={formData.sellPrice || ''}
                        onChange={e => setFormData({ ...formData, sellPrice: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Jumlah Stok</label>
                    <input 
                      type="number"
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      value={formData.stock || ''}
                      onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Batas Stok Tipis</label>
                    <input 
                      type="number"
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      value={formData.lowStockThreshold || ''}
                      onChange={e => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-700 text-white p-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-200 hover:bg-blue-800 transition-all active:scale-95 mt-4"
                >
                  Simpan Produk
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function DebtScreen({ customers, debts, onUpdate }: { 
  customers: Customer[], 
  debts: DebtRecord[],
  onUpdate: () => void 
}) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(0);
  
  const customerDebts = useMemo(() => {
    if (!selectedCustomer) return [];
    return debts.filter(d => d.customerId === selectedCustomer.id).reverse();
  }, [selectedCustomer, debts]);

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const name = (e.target as any).name.value;
    const phone = (e.target as any).phone.value;
    
    const newCustomer: Customer = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      phone,
      totalDebt: 0
    };
    
    storage.saveCustomers([...customers, newCustomer]);
    setIsAddingCustomer(false);
    onUpdate();
  };

  const handlePayment = () => {
    if (!selectedCustomer || payAmount <= 0) return;
    
    storage.saveDebtRecord({
      id: Math.random().toString(36).substr(2, 9),
      customerId: selectedCustomer.id,
      amount: payAmount,
      type: 'Payment',
      timestamp: new Date(),
      note: 'Pembayaran manual'
    });
    
    setIsPaying(false);
    setPayAmount(0);
    // Deep refresh selected customer
    const updated = storage.getCustomers().find(c => c.id === selectedCustomer.id);
    if (updated) setSelectedCustomer(updated);
    onUpdate();
  };

  if (selectedCustomer) {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <button onClick={() => setSelectedCustomer(null)} className="flex items-center gap-2 text-slate-500 font-bold mb-6">
          <ArrowLeft size={20} /> Kembali
        </button>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-6">
          <h2 className="text-2xl font-bold">{selectedCustomer.name}</h2>
          <p className="text-slate-400 text-sm">{selectedCustomer.phone}</p>
          <div className="mt-4 pt-4 border-t border-slate-50">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Hutang</p>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(selectedCustomer.totalDebt)}</p>
          </div>
          {selectedCustomer.totalDebt > 0 && (
            <button 
              onClick={() => setIsPaying(true)}
              className="w-full mt-4 bg-green-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2"
            >
              <Wallet size={18} /> Bayar Hutang
            </button>
          )}
        </div>

        <h3 className="font-bold flex items-center gap-2 mb-3">
          <History size={18} className="text-slate-400" /> Riwayat
        </h3>
        <div className="space-y-3">
          {customerDebts.map(d => (
            <div key={d.id} className="bg-white p-3 rounded-2xl flex justify-between items-center text-sm border border-slate-50">
              <div>
                <p className="font-bold">{d.type === 'Debt' ? 'Hutang Transaksi' : 'Pembayaran'}</p>
                <p className="text-[10px] text-slate-400">{d.timestamp.toLocaleDateString()} • {d.note || 'Transaksi Kasir'}</p>
              </div>
              <span className={cn(
                "font-bold",
                d.type === 'Debt' ? "text-red-600" : "text-green-600"
              )}>
                {d.type === 'Debt' ? '+' : '-'}{formatCurrency(d.amount)}
              </span>
            </div>
          ))}
          {customerDebts.length === 0 && <p className="text-center text-slate-400 py-4 text-sm italic">Belum ada riwayat</p>}
        </div>

        <AnimatePresence>
          {isPaying && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl">
                <h3 className="text-xl font-bold mb-6">Input Pembayaran</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Jumlah Bayar</label>
                    <input 
                      type="number"
                      autoFocus
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-2xl font-bold outline-none focus:border-green-600"
                      value={payAmount || ''}
                      onChange={e => setPayAmount(Number(e.target.value))}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setIsPaying(false)} className="flex-1 py-3 font-bold text-slate-400">Batal</button>
                    <button onClick={handlePayment} className="flex-2 bg-green-600 text-white font-bold rounded-xl py-3 px-6">Konfirmasi</button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Daftar Kasbon</h2>
        <button 
          onClick={() => setIsAddingCustomer(true)} 
          className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow-sm"
        >
          <Plus size={18} /> Pelanggan
        </button>
      </div>

      <div className="space-y-3">
        {customers.map(c => (
          <button 
            key={c.id} 
            onClick={() => setSelectedCustomer(c)}
            className="w-full bg-white border border-slate-100 p-4 rounded-2xl flex justify-between items-center shadow-sm text-left"
          >
            <div>
              <p className="font-bold">{c.name}</p>
              <p className="text-xs text-slate-400">{c.phone}</p>
            </div>
            <div className="text-right">
              <p className={cn("font-bold", c.totalDebt > 0 ? "text-red-500" : "text-slate-300")}>
                {formatCurrency(c.totalDebt)}
              </p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Klik Detail</p>
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {isAddingCustomer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl">
              <h3 className="text-xl font-bold mb-6">Tambah Pelanggan</h3>
              <form onSubmit={handleAddCustomer} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Nama</label>
                  <input required name="name" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-blue-600" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">No. HP</label>
                  <input required name="phone" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-blue-600" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsAddingCustomer(false)} className="flex-1 font-bold text-slate-400">Batal</button>
                  <button type="submit" className="flex-2 bg-blue-600 text-white font-bold rounded-xl py-3 px-6">Simpan</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ReportsScreen({ transactions, expenses }: { transactions: Transaction[], expenses: Expense[] }) {
  const [period, setPeriod] = useState<'today' | 'weekly' | 'monthly' | 'yearly' | 'custom'>('weekly');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (period === 'today') {
      return transactions.filter(t => t.timestamp >= today);
    } else if (period === 'weekly') {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      return transactions.filter(t => t.timestamp >= weekAgo);
    } else if (period === 'monthly') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return transactions.filter(t => t.timestamp >= monthStart);
    } else if (period === 'yearly') {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      return transactions.filter(t => t.timestamp >= yearStart);
    } else {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return transactions.filter(t => t.timestamp >= start && t.timestamp <= end);
    }
  }, [transactions, period, startDate, endDate]);

  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (period === 'today') {
      return expenses.filter(e => e.timestamp >= today);
    } else if (period === 'weekly') {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      return expenses.filter(e => e.timestamp >= weekAgo);
    } else if (period === 'monthly') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return expenses.filter(e => e.timestamp >= monthStart);
    } else if (period === 'yearly') {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      return expenses.filter(e => e.timestamp >= yearStart);
    } else {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return expenses.filter(e => e.timestamp >= start && e.timestamp <= end);
    }
  }, [expenses, period, startDate, endDate]);

  const totalOmzet = filteredTransactions.reduce((s,t) => s+t.total,0);
  const totalModal = filteredTransactions.reduce((s,t) => {
    return s + t.items.reduce((itemSum, item) => itemSum + (item.buyPrice * item.quantity), 0);
  }, 0);
  const totalBiaya = filteredExpenses.reduce((s,e) => s+e.amount, 0);
  const grossProfit = totalOmzet - totalModal;
  const netProfit = grossProfit - totalBiaya;

  const exportToCSV = () => {
    if (filteredTransactions.length === 0) {
      alert('Tidak ada data untuk diekspor');
      return;
    }

    const headers = ['ID Transaksi', 'Tanggal', 'Waktu', 'Item', 'Total', 'Metode Pembayaran'];
    const rows = filteredTransactions.map(t => [
      t.id,
      t.timestamp.toLocaleDateString('id-ID'),
      t.timestamp.toLocaleTimeString('id-ID'),
      t.items.map(i => `${i.name} (${i.quantity})`).join('; '),
      t.total,
      t.paymentMethod
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_Penjualan_${period}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartData = useMemo(() => {
    const data: Record<string, number> = {};
    const now = new Date();
    
    if (period === 'today') {
      for (let i = 0; i < 24; i++) {
        data[`${i}:00`] = 0;
      }
      filteredTransactions.forEach(t => {
        const hour = t.timestamp.getHours();
        data[`${hour}:00`] += t.total;
      });
    } else if (period === 'weekly') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const key = d.toLocaleDateString('id-ID', { weekday: 'short' });
        data[key] = 0;
      }
      filteredTransactions.forEach(t => {
        const key = t.timestamp.toLocaleDateString('id-ID', { weekday: 'short' });
        if (data[key] !== undefined) data[key] += t.total;
      });
    } else if (period === 'monthly') {
      for (let i = 1; i <= 31; i++) {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const d = new Date(monthStart);
        d.setDate(i);
        if (d.getMonth() === now.getMonth()) {
          data[i.toString()] = 0;
        }
      }
      filteredTransactions.forEach(t => {
        const key = t.timestamp.getDate().toString();
        if (data[key] !== undefined) data[key] += t.total;
      });
    } else if (period === 'yearly') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      months.forEach(m => data[m] = 0);
      filteredTransactions.forEach(t => {
        const monthIndex = t.timestamp.getMonth();
        const key = months[monthIndex];
        data[key] += t.total;
      });
    } else {
      filteredTransactions.forEach(t => {
        const key = t.timestamp.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        data[key] = (data[key] || 0) + t.total;
      });
    }

    return Object.entries(data).map(([name, total]) => ({ name, total }));
  }, [filteredTransactions, period]);

  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    filteredTransactions.forEach(t => {
      t.items.forEach(item => {
        cats[item.category] = (cats[item.category] || 0) + (item.sellPrice * item.quantity);
      });
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [filteredTransactions]);

  const COLORS = ['#1d4ed8', '#fbbf24', '#dc2626', '#059669', '#4f46e5', '#ea580c'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-8 h-full overflow-y-auto scrollbar-hide pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-black text-slate-800">Analisis Performa</h2>
          <div className="flex gap-1 p-1 bg-slate-200 rounded-2xl w-fit overflow-x-auto max-w-full scrollbar-hide">
            <button 
              onClick={() => setPeriod('today')}
              className={cn(
                "px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-tight transition-all whitespace-nowrap",
                period === 'today' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
              )}
            >
              Hari Ini
            </button>
            <button 
              onClick={() => setPeriod('weekly')}
              className={cn(
                "px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-tight transition-all whitespace-nowrap",
                period === 'weekly' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
              )}
            >
              7 Hari
            </button>
            <button 
              onClick={() => setPeriod('monthly')}
              className={cn(
                "px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-tight transition-all whitespace-nowrap",
                period === 'monthly' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
              )}
            >
              Bulan Ini
            </button>
            <button 
              onClick={() => setPeriod('yearly')}
              className={cn(
                "px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-tight transition-all whitespace-nowrap",
                period === 'yearly' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
              )}
            >
              Tahun Ini
            </button>
            <button 
              onClick={() => setPeriod('custom')}
              className={cn(
                "px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-tight transition-all whitespace-nowrap",
                period === 'custom' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
              )}
            >
              Pilih Tanggal
            </button>
          </div>
        </div>

        {period === 'custom' && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-[10px] font-black text-slate-400">S/D</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <button 
          onClick={exportToCSV}
          className="bg-slate-800 text-white px-6 py-3 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-slate-700 transition-all active:scale-95 h-fit self-start sm:self-center"
        >
          <Save size={16} /> Ekspor Data
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm">
          <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-1">Total Omzet</p>
          <p className="text-2xl font-black text-slate-800">{formatCurrency(totalOmzet)}</p>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm">
          <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-1">Modal Produk</p>
          <p className="text-2xl font-black text-slate-600">{formatCurrency(totalModal)}</p>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm">
          <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-1">Total Biaya Operasi</p>
          <p className="text-2xl font-black text-red-500">{formatCurrency(totalBiaya)}</p>
        </div>
        <div className={cn(
          "p-6 rounded-[2rem] shadow-lg",
          netProfit >= 0 ? "bg-green-600 text-white" : "bg-red-600 text-white"
        )}>
          <p className="opacity-70 text-[9px] font-black uppercase tracking-[0.2em] mb-1">Untung Bersih</p>
          <p className="text-2xl font-black">{formatCurrency(netProfit)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm grow">
          <h3 className="font-black text-xs text-slate-400 uppercase tracking-widest mb-8">
            Grafik Omzet {period === 'today' ? 'Per Jam' : period === 'weekly' ? '7 Hari Terakhir' : period === 'monthly' ? 'Bulan Ini' : 'Tahun Ini'}
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#94a3b8', fontWeight: 700 }} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [formatCurrency(value), 'Omzet']}
                />
                <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.total > 0 ? '#1d4ed8' : '#f1f5f9'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl grow flex flex-col justify-between">
          <h3 className="font-black text-xs text-slate-500 uppercase tracking-widest mb-4">Kategori Terlaris ({period})</h3>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '20px', backgroundColor: '#fff', border: 'none' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {categoryData.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-xs font-black uppercase tracking-widest italic">
                Belum Ada Penjualan
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-6">
            {categoryData.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest truncate max-w-[80px]">{entry.name}</span>
                </div>
                <span className="text-[10px] text-white font-black">{formatCurrency(entry.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ExpensesScreen({ expenses, onUpdate }: { expenses: Expense[], onUpdate: () => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const categories = ['Listrik/Token', 'Plastik/Kemasan', 'Gaji Pegawai', 'Sewa Tempat', 'Bensin/Transport', 'Kebersihan/Keamanan', 'Lain-lain'];

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as any;
    storage.saveExpense({
      id: Math.random().toString(36).substr(2, 9),
      amount: Number(target.amount.value),
      category: target.category.value,
      note: target.note.value,
      timestamp: new Date()
    });
    setIsAdding(false);
    onUpdate();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6 h-full overflow-y-auto scrollbar-hide">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-800">Biaya Operasional</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-100 flex items-center gap-2"
        >
          <PlusCircle size={18} /> Tambah Biaya
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-24">
        {expenses.slice().reverse().map(e => (
          <div key={e.id} className="bg-white border border-slate-200 p-5 rounded-[1.5rem] flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
                <MinusCircle size={24} />
              </div>
              <div>
                <p className="font-black text-slate-800">{e.category}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{e.timestamp.toLocaleDateString()} • {e.note || '-'}</p>
              </div>
            </div>
            <p className="font-black text-red-600">{formatCurrency(e.amount)}</p>
          </div>
        ))}
        {expenses.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-300 italic font-medium uppercase tracking-widest text-xs">
            Belum ada catatan pengeluaran
          </div>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800">Catat Pengeluaran</h3>
                <button onClick={() => setIsAdding(false)} className="text-slate-400"><X size={24} /></button>
              </div>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori Biaya</label>
                  <select name="category" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-red-500 appearance-none">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jumlah (Rp)</label>
                  <input required name="amount" type="number" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Catatan Tambahan</label>
                  <input name="note" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-red-500" placeholder="Misal: Listrik bulan Juni" />
                </div>
                <button type="submit" className="w-full bg-red-600 text-white p-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-red-100 mt-4 active:scale-95 transition-all">
                  Simpan Biaya
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
