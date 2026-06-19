"use client";
import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

export default function CreateOrderModal({ isOpen, onClose, onSuccess, products }: { isOpen: boolean, onClose: () => void, onSuccess: () => void, products: Product[] }) {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  if (!products || products.length === 0) {
    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
         <div className="bg-white rounded-3xl w-full max-w-md p-8 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
             <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4 text-amber-500">
                <X className="h-8 w-8" />
             </div>
             <h2 className="text-xl font-bold text-slate-800 mb-2">Tidak Ada Produk</h2>
             <p className="text-slate-500 mb-6">Silakan tambahkan produk ke inventaris terlebih dahulu sebelum membuat pesanan.</p>
             <button onClick={onClose} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2.5 rounded-xl font-medium w-full transition">Tutup</button>
         </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        productId,
        quantity: Number(quantity)
      });
      toast.success('Pesanan berhasil dibuat!');
      onSuccess();
      setProductId(''); setQuantity('');
    } catch (error: any) {
        // Handle API Gateway & Microservices custom errors (400, 404, 503)
        const msg = error.response?.data?.error || 'Terjadi kesalahan sistem';
        toast.error(`Gagal: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-xl font-bold text-slate-800">Buat Pesanan Baru</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition">
                <X className="h-5 w-5" />
            </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Pilih Produk</label>
              <select required value={productId} onChange={(e) => setProductId(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-700">
                <option value="" disabled>-- Pilih Produk --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id} disabled={p.stock === 0}>
                    {p.name} {p.stock === 0 ? '(Habis)' : `(Stok: ${p.stock})`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Jumlah</label>
              <input required type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" placeholder="Contoh: 5" />
            </div>
          </div>
          <div className="mt-8 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition">Batal</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition disabled:opacity-50 shadow-md shadow-emerald-200">
              {loading ? 'Memproses...' : 'Buat Pesanan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
