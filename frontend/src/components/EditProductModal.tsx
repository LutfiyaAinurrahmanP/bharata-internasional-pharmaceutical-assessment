"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

export default function EditProductModal({ isOpen, onClose, onSuccess, product }: { isOpen: boolean, onClose: () => void, onSuccess: () => void, product: Product | null }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price.toString());
      setStock(product.stock.toString());
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/products/${product.id}`, {
        name,
        price: Number(price),
        stock: Number(stock)
      });
      toast.success('Produk berhasil diperbarui!');
      onSuccess();
    } catch (error) {
      toast.error('Gagal memperbarui produk');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-xl font-bold text-slate-800">Edit Produk</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition">
                <X className="h-5 w-5" />
            </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Produk</label>
              <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" placeholder="Contoh: Ekstrak Herbal 500ml" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Harga (Rp)</label>
              <input required type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" placeholder="Contoh: 75000" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Stok</label>
              <input required type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" placeholder="Contoh: 50" />
            </div>
          </div>
          <div className="mt-8 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition">Batal</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition disabled:opacity-50 shadow-md shadow-emerald-200">
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
