import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../Navbar'
import Footer from '../Footer'
import SignupModal from '../modals/SignupModal'

const Layout = () => {
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onSignupClick={() => setIsSignupModalOpen(true)} />
      <main className="grow">
        <Outlet context={{ setIsSignupModalOpen }} />
      </main>
      <Footer />
      <SignupModal
        isOpen={isSignupModalOpen} 
        onClose={() => setIsSignupModalOpen(false)} 
      />
    </div>
  )
}

export default Layout