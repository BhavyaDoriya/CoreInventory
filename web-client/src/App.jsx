import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Package, ArrowDownToLine, Truck, History, LogOut } from 'lucide-react';

import Dashboard from './pages/dashboard/Dashboard';

// --- TEMPORARY PAGE PLACEHOLDERS ---
const Login = () => <div className="flex h-screen items-center justify-center bg-slate-100"><h1 className="text-3xl font-bold">🔐 Login Screen</h1></div>;
const Products = () => <div className="p-8"><h1 className="text-3xl font-bold text-slate-800">Stock / Products</h1></div>;
const Receipts = () => <div className="p-8"><h1 className="text-3xl font-bold text-slate-800">Incoming Receipts</h1></div>;
const Deliveries = () => <div className="p-8"><h1 className="text-3xl font-bold text-slate-800">Outgoing Deliveries</h1></div>;
const MoveHistory = () => <div className="p-8"><h1 className="text-3xl font-bold text-slate-800">Move History Ledger</h1></div>;

// --- COLLAPSIBLE SIDEBAR ---
const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false); 
  const location = useLocation();
  
  const menu = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={22} /> },
    { name: 'Stock / Products', path: '/products', icon: <Package size={22} /> },
    { name: 'Receipts', path: '/receipts', icon: <ArrowDownToLine size={22} /> },
    { name: 'Deliveries', path: '/deliveries', icon: <Truck size={22} /> },
    { name: 'Move History', path: '/history', icon: <History size={22} /> },
  ];

  return (
    <div className={`${isOpen ? 'w-64' : 'w-20'} bg-slate-900 text-slate-300 flex flex-col h-full shadow-xl z-20 transition-all duration-300 ease-in-out`}>
      <div className="h-20 flex items-center justify-between px-4 border-b border-slate-800">
        {isOpen && (
          <h2 className="text-2xl font-bold text-white tracking-wider ml-2 whitespace-nowrap overflow-hidden">
            CORE<span className="text-indigo-500">INV</span>
          </h2>
        )}
        <button onClick={() => setIsOpen(!isOpen)} className={`p-2 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors ${!isOpen && 'mx-auto'}`}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      <nav className="flex-1 px-3 space-y-2 mt-6 overflow-hidden">
        {menu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.name} to={item.path} title={!isOpen ? item.name : ""} className={`flex items-center py-3 rounded-lg transition-colors font-medium ${isOpen ? 'px-4 justify-start' : 'justify-center'} ${isActive ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
              <span className="flex-shrink-0">{item.icon}</span>
              {isOpen && <span className="ml-4 whitespace-nowrap">{item.name}</span>}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-800">
        <Link to="/login" title={!isOpen ? "Log Out" : ""} className={`flex items-center py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors ${isOpen ? 'px-4 justify-start' : 'justify-center'}`}>
          <span className="flex-shrink-0"><LogOut size={22} /></span>
          {isOpen && <span className="ml-4 whitespace-nowrap">Log Out</span>}
        </Link>
      </div>
    </div>
  );
};

// --- MAIN LAYOUT SHELL ---
const MainLayout = ({ children }) => (
  <div className="flex h-screen w-full bg-slate-50 font-sans overflow-hidden">
    <Sidebar />
    <div className="flex-1 overflow-y-auto">
      {children}
    </div>
  </div>
);

// --- APP ROUTER ---
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<MainLayout><Dashboard /></MainLayout>} />
        <Route path="/products" element={<MainLayout><Products /></MainLayout>} />
        <Route path="/receipts" element={<MainLayout><Receipts /></MainLayout>} />
        <Route path="/deliveries" element={<MainLayout><Deliveries /></MainLayout>} />
        <Route path="/history" element={<MainLayout><MoveHistory /></MainLayout>} />
      </Routes>
    </BrowserRouter>
  );
}