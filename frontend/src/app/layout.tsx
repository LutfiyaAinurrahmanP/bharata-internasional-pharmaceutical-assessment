import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BIP ERP - Herbal Inventory",
  description: "Dashboard Inventory & Order untuk produk herbal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 flex h-screen overflow-hidden text-slate-800`}>
        <Sidebar />
        <main className="flex-1 flex flex-col h-screen overflow-y-auto">
          {children}
        </main>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
