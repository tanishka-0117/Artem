import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { ToastContainer } from '@/components/ui/Toast';

const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        isCollapsed={sidebarCollapsed}
        onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export default AppLayout;
