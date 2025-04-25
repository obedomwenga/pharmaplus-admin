import React, { ReactNode, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

type MainLayoutProps = {
  children: ReactNode;
};

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Helper function to check if route is active
  const isActive = (path: string): boolean => {
    if (path === '/' && router.pathname === '/') {
      return true;
    }
    return router.pathname.startsWith(path) && path !== '/';
  };
  
  // Compute page title based on route
  const getPageTitle = (): string => {
    if (router.pathname === '/') return 'Dashboard';
    if (router.pathname.startsWith('/promotions')) return 'Promotions Management';
    if (router.pathname.startsWith('/products')) return 'Products Management';
    if (router.pathname.startsWith('/orders')) return 'Orders Management';
    if (router.pathname.startsWith('/users')) return 'Users Management';
    return 'PharmaPlus Admin';
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-background-primary text-text-primary flex">
      {/* Sidebar */}
      <aside 
        className={`sidebar bg-pharma-green-dark text-white flex-shrink-0 fixed h-full shadow-card z-10 transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className={`flex items-center h-16 border-b border-opacity-20 border-pharma-green-light ${
          sidebarCollapsed ? 'justify-center' : 'justify-between px-4'
        }`}>
          {!sidebarCollapsed && (
            <div className="flex items-center">
              <img 
                src="/images/pharma-logo.svg" 
                alt="PharmaPlus Logo" 
                className="w-8 h-8 mr-2" 
              />
              <h1 className="text-xl font-bold">PharmaPlus</h1>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="flex items-center justify-center">
              <img 
                src="/images/pharma-logo.svg" 
                alt="PharmaPlus Logo" 
                className="w-8 h-8" 
              />
            </div>
          )}
          <button 
            onClick={toggleSidebar}
            className={`p-1 rounded-full hover:bg-pharma-green-light/20 transition-colors ${sidebarCollapsed ? 'mt-1' : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              {sidebarCollapsed ? (
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              )}
            </svg>
          </button>
        </div>
        <nav className="mt-6 px-4">
          <div className="space-y-4">
            {/* Navigation Links */}
            <Link href="/" 
                  className={`block py-2.5 px-4 rounded transition-colors hover:bg-pharma-green-light/20 flex items-center ${
                    isActive('/') ? 'bg-pharma-green-light/20' : ''
                  }`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              {!sidebarCollapsed && <span>Dashboard</span>}
            </Link>

            <Link href="/promotions"
                  className={`block py-2.5 px-4 rounded transition-colors hover:bg-pharma-green-light/20 flex items-center ${
                    isActive('/promotions') ? 'bg-pharma-green-light/20' : ''
                  }`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z" clipRule="evenodd" />
              </svg>
              {!sidebarCollapsed && <span>Promotions</span>}
            </Link>

            <Link href="/products"
                  className={`block py-2.5 px-4 rounded transition-colors hover:bg-pharma-green-light/20 flex items-center ${
                    isActive('/products') ? 'bg-pharma-green-light/20' : ''
                  }`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
              </svg>
              {!sidebarCollapsed && <span>Products</span>}
            </Link>

            <Link href="/orders"
                  className={`block py-2.5 px-4 rounded transition-colors hover:bg-pharma-green-light/20 flex items-center ${
                    isActive('/orders') ? 'bg-pharma-green-light/20' : ''
                  }`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              {!sidebarCollapsed && <span>Orders</span>}
            </Link>

            <Link href="/users"
                  className={`block py-2.5 px-4 rounded transition-colors hover:bg-pharma-green-light/20 flex items-center ${
                    isActive('/users') ? 'bg-pharma-green-light/20' : ''
                  }`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              {!sidebarCollapsed && <span>Users</span>}
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`main-content flex-1 transition-all duration-300 ${
        sidebarCollapsed ? 'ml-20' : 'ml-64'
      }`}>
        {/* Header */}
        <header className="bg-white h-16 shadow-sm flex items-center px-6 sticky top-0 z-10">
          <div className="flex justify-between items-center w-full">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">{getPageTitle()}</h2>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-1 rounded-full text-pharma-gray-darker hover:bg-pharma-gray transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pharma-green">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button className="flex items-center space-x-2 focus:outline-none">
                  <div className="h-8 w-8 rounded-full bg-pharma-green-dark text-white flex items-center justify-center">
                    <span className="text-sm font-medium">JD</span>
                  </div>
                  <span className="text-text-secondary hidden md:block">John Doe</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 