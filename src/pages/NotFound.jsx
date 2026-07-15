import React from 'react'
import { Link } from 'react-router-dom'
import { FaHome } from 'react-icons/fa'

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl md:text-8xl font-bold text-primary">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-text mt-4">
          Page Not Found
        </h2>
        <p className="text-text-light mt-2">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center space-x-2 mt-6">
          <FaHome />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  )
}

export default NotFound