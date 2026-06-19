"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Package, Tag, Hash, Calendar } from 'lucide-react';

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

export default function ProductDetailModal({ isOpen, onClose, productId }: { isOpen: boolean, onClose: () => void, productId: string | null }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !productId) return;
    
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`);
        setProduct(res.data);
      } catch (error) {
        console.error('Failed to fetch product details', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [isOpen, productId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-xl font-bold text-slate-800">Detail Produk</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition">
                <X className="h-5 w-5" />
            </button>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : product ? (
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                  <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                      <Package className="h-8 w-8" />
                  </div>
                  <div>
                      <p className="text-sm text-slate-500 font-medium mb-1">Nama Produk</p>
                      <h3 className="text-xl font-bold text-slate-800">{product.name}</h3>
                  </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center text-slate-500 mb-1">
                          <Tag className="h-4 w-4 mr-1.5" />
                          <span className="text-xs font-medium uppercase tracking-wider">Harga</span>
                      </div>
                      <p className="text-lg font-bold text-emerald-600">
                          Rp {product.price.toLocaleString('id-ID')}
                      </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center text-slate-500 mb-1">
                          <Package className="h-4 w-4 mr-1.5" />
                          <span className="text-xs font-medium uppercase tracking-wider">Stok</span>
                      </div>
                      <p className="text-lg font-bold text-slate-800">
                          {product.stock} pcs
                      </p>
                  </div>
              </div>

            </div>
          ) : (
            <div className="py-8 text-center text-slate-500">
              Data produk tidak ditemukan.
            </div>
          )}
        </div>
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition shadow-md">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
