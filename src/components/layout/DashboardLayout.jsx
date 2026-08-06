import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import DashboardNavbar from '../DashboardNavbar'
import DashboardSidebar from '../DashboardSidebar'

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true) // Default to open on desktop
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setSidebarOpen(true)
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar - Fixed at top */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-soft">
        <DashboardNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      </header>

      <div className="flex pt-16">
        {/* Sidebar - Fixed position */}
        <div className="fixed left-0 top-16 bottom-0 z-40">
          <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main content - with proper margin for sidebar */}
        <main 
          className="flex-1 overflow-y-auto p-4 md:p-6 transition-all duration-300"
          style={{
            marginLeft: isMobile ? (sidebarOpen ? '16rem' : '0rem') : '16rem',
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