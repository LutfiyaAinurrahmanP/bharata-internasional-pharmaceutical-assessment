"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, ShoppingCart, Leaf } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Produk', href: '/', icon: Package },
    { name: 'Pesanan', href: '/orders', icon: ShoppingCart },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-full flex flex-col z-10 shadow-sm">
      <div className="h-20 flex items-center px-6 border-b border-slate-100">
        <Leaf className="h-8 w-8 text-emerald-500 mr-3" />
        <div>
            <span className="text-xl font-bold text-slate-800 block">BIP ERP</span>
            <span className="text-xs text-slate-500 font-medium tracking-wider">OBAT HERBAL</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200 font-semibold' 
                  : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 font-medium'
              }`}
            >
              <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                A
            </div>
            <div className="ml-3">
                <p className="text-sm font-semibold text-slate-800">Admin</p>
                <p className="text-xs text-slate-500">Staf Gudang</p>
            </div>
        </div>
      </div>
    </aside>
  );
}
