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
  price: number;
  stock: number;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/orders?t=${Date.now()}`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products?t=${Date.now()}`),
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
    const p = products.find(prod => prod.id === id);
    return p ? p.name : 'Produk Tidak Dikenal';
  };

  const getProductPrice = (id: string) => {
    const p = products.find(prod => prod.id === id);
    return p ? p.price : 0;
  };

  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const filteredOrders = sortedOrders.filter(o => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    getProductName(o.productId).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  return (
    <div className="p-8 w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Pesanan</h1>
          <p className="text-slate-500 mt-1">Lacak dan buat pesanan pelanggan baru</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center transition-all shadow-md shadow-emerald-200"
        >
          <Plus className="h-5 w-5 mr-1.5" /> Buat Pesanan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-slate-500 text-sm font-medium">Total Pesanan</p>
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
             <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari pesanan..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white" />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-sm">
                <th className="px-6 py-4 font-medium w-1/4">ID Pesanan</th>
                <th className="px-6 py-4 font-medium w-1/3">Nama Produk</th>
                <th className="px-6 py-4 font-medium">Jumlah</th>
                <th className="px-6 py-4 font-medium">Total Harga</th>
                <th className="px-6 py-4 font-medium">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-slate-400">Memuat data pesanan...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-slate-400">Belum ada pesanan yang sesuai.</td></tr>
              ) : (
                currentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">{o.id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{getProductName(o.productId)}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{o.quantity}</td>
                    <td className="px-6 py-4 text-emerald-600 font-bold">Rp {(getProductPrice(o.productId) * o.quantity).toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {new Date(o.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-sm text-slate-500">
                  Menampilkan {(currentPage - 1) * itemsPerPage + 1} hingga {Math.min(currentPage * itemsPerPage, filteredOrders.length)} dari {filteredOrders.length} pesanan
              </span>
              <div className="flex space-x-2">
                  <button 
                      disabled={currentPage === 1} 
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                      Sebelumnya
                  </button>
                  <button 
                      disabled={currentPage === totalPages} 
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                      Selanjutnya
                  </button>
              </div>
          </div>
        )}
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
