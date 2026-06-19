"use client";
import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { X, PackageOpen } from 'lucide-react';

type Product = {
  id: string;
  name: string;
  stock: number;
};

export default function CreateOrderModal({ isOpen, onClose, onSuccess, products }: { isOpen: boolean, onClose: () => void, onSuccess: () => void, products: Product[] }) {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

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
            <h2 className="text-xl font-bold text-slate-800">Create New Order</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition">
                <X className="h-5 w-5" />
            </button>
        </div>
        
        {products.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center">
                <PackageOpen className="h-12 w-12 text-slate-300 mb-3" />
                <h3 className="text-lg font-medium text-slate-800">No Products Available</h3>
                <p className="text-sm text-slate-500 mt-1">Please add a product in the inventory first before creating an order.</p>
                <button onClick={onClose} className="mt-6 px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition">Close</button>
            </div>
        ) : (
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Product</label>
              <select required value={productId} onChange={(e) => setProductId(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-700">
                <option value="" disabled>-- Choose a Product --</option>
                {products.map(p => (
                    <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                        {p.name} {p.stock <= 0 ? '(Out of Stock)' : `(Stock: ${p.stock})`}
                    </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Quantity</label>
              <input required type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" placeholder="e.g. 5" />
            </div>
          </div>
          <div className="mt-8 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition disabled:opacity-50 shadow-md shadow-emerald-200">
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
