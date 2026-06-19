"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import CreateOrderModal from '@/components/CreateOrderModal';

type Order = {
  id: string;
  productId: string;
  quantity: number;
  createdAt: string;
};

type Product = {
  id: string;
  name: string;
  stock: number;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/orders`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products`)
      ]);
      setOrders(ordersRes.data || []);
      setProducts(productsRes.data || []);
    } catch (error) {
      toast.error('Gagal mengambil data pesanan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getProductName = (id: string) => {
    const p = products.find(p => p.id === id);
    return p ? p.name : 'Unknown Product';
  };

  return (
    <div className="p-8 w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Orders Management</h1>
          <p className="text-slate-500 mt-1">Track and create new customer orders</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center transition-all shadow-md shadow-emerald-200"
        >
          <Plus className="h-5 w-5 mr-1.5" /> Create Order
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-slate-500 text-sm font-medium">Total Orders</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-1">{orders.length}</h3>
            </div>
            <div className="bg-emerald-100 p-4 rounded-full text-emerald-600">
                <ShoppingCart className="h-6 w-6" />
            </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
           <div className="relative w-72">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
             <input type="text" placeholder="Search orders..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white" />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-sm">
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Product Name</th>
                <th className="px-6 py-4 font-medium">Quantity</th>
                <th className="px-6 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="text-center py-12 text-slate-400">Memuat data pesanan...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-slate-400">Belum ada pesanan yang dibuat.</td></tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-slate-500">{o.id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{getProductName(o.productId)}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                        <span className="bg-slate-100 px-3 py-1 rounded-full text-sm">{o.quantity} items</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{new Date(o.createdAt).toLocaleString('id-ID')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateOrderModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
            setIsModalOpen(false);
            fetchData();
        }}
        products={products}
      />
    </div>
  );
}
