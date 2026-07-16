import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import DashboardNavbar from '../DashboardNavbar'
import DashboardSidebar from '../DashboardSidebar'

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar - Fixed at top */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <DashboardNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      </header>

      <div className="flex flex-1 pt-16">
        {/* Sidebar container - handles both mobile and desktop */}
        <div className="fixed left-0 top-16 bottom-0 z-40">
          <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main content */}
        <main 
          className="flex-1 overflow-y-auto p-4 md:p-6 transition-all duration-300"
          style={{
            marginLeft: sidebarOpen ? '16rem' : '0rem',
            height: 'calc(100vh - 4rem)',
          }}
        >
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout