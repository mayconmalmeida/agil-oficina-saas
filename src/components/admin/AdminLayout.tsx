
import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Megaphone, 
  LogOut,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      title: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard
    },
    {
      title: 'Usuários e Assinaturas',
      href: '/admin/users-subscriptions',
      icon: Users
    },
    {
      title: 'Relatórios do SaaS',
      href: '/admin/reports-saas',
      icon: BarChart3
    },
    {
      title: 'Campanhas',
      href: '/admin/campaigns',
      icon: Megaphone
    }
  ];

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">OficinaGO</h1>
          <p className="text-sm text-gray-600">Painel Admin</p>
        </div>
        
        <nav className="mt-6 px-4">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.title}
              </Link>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">Admin</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
