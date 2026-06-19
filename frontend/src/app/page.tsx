"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import AddProductModal from '@/components/AddProductModal';

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products`);
      setProducts(res.data || []);
    } catch (error) {
      toast.error('Gagal mengambil data produk');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="p-8 w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Products Inventory</h1>
          <p className="text-slate-500 mt-1">Manage your herbal product stocks</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center transition-all shadow-md shadow-emerald-200"
        >
          <Plus className="h-5 w-5 mr-1.5" /> Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-slate-500 text-sm font-medium">Total Products</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-1">{products.length}</h3>
            </div>
            <div className="bg-emerald-100 p-4 rounded-full text-emerald-600">
                <Package className="h-6 w-6" />
            </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
           <div className="relative w-72">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
             <input type="text" placeholder="Search products..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white" />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-sm">
                <th className="px-6 py-4 font-medium w-1/3">Product Name</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="text-center py-12 text-slate-400">Memuat data produk...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-slate-400">Belum ada produk yang ditambahkan.</td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800">{p.name}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">Rp {p.price.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{p.stock}</td>
                    <td className="px-6 py-4">
                      {p.stock > 10 ? (
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">In Stock</span>
                      ) : p.stock > 0 ? (
                        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">Low Stock</span>
                      ) : (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">Out of Stock</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
            setIsModalOpen(false);
            fetchProducts();
        }} 
      />
    </div>
  );
}
