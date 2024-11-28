import React from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutGrid, ClipboardList, CheckSquare, LogOut } from 'lucide-react';
import MenuManagement from './MenuManagement';
import OrderManagement from './OrderManagement';
import CompletedOrders from './CompletedOrders';
import { useAuthStore } from '../../store/authStore';

function Dashboard() {
  const location = useLocation();
  const { adminLogout } = useAuthStore();

  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  const handleLogout = async () => {
    await adminLogout();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/admin/menu"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/menu')
                      ? 'border-purple-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  Menu Management
                </Link>
                <Link
                  to="/admin/orders"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/orders')
                      ? 'border-purple-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Order Management
                </Link>
                <Link
                  to="/admin/completed"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/completed')
                      ? 'border-purple-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Completed Orders
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Navigate to="/admin/menu" replace />} />
          <Route path="menu" element={<MenuManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="completed" element={<CompletedOrders />} />
        </Routes>
      </div>
    </div>
  );
}

export default Dashboard;