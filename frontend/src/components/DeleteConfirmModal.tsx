"use client";
import { AlertTriangle } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, title, message, loading }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string, message: string, loading: boolean }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
         <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500">
            <AlertTriangle className="h-8 w-8" />
         </div>
         <h2 className="text-xl font-bold text-slate-800 mb-2">{title}</h2>
         <p className="text-slate-500 mb-8">{message}</p>
         <div className="flex space-x-3 w-full">
            <button onClick={onClose} disabled={loading} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-medium transition">Batal</button>
            <button onClick={onConfirm} disabled={loading} className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl font-medium transition shadow-md shadow-red-200 disabled:opacity-50">
                {loading ? 'Proses...' : 'Hapus'}
            </button>
         </div>
      </div>
    </div>
  );
}
