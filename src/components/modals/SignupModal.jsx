import React from 'react'
import { Link } from 'react-router-dom'
import { FaTimes, FaUser, FaRunning, FaHandsHelping, FaArrowRight } from 'react-icons/fa'

const SignupModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  const signupOptions = [
    {
      title: 'Customer',
      description: 'Book errands and find local services',
      icon: FaUser,
      link: '/register/customer',
      color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
      iconColor: 'text-blue-600',
      features: ['Book errands', 'Find services', 'Track deliveries', 'Chat with providers'],
    },
    {
      title: 'Errand Runner',
      description: 'Complete errands and earn money',
      icon: FaRunning,
      link: '/register/errand-runner',
      color: 'bg-green-50 border-green-200 hover:border-green-400',
      iconColor: 'text-green-600',
      features: ['Earn per errand', 'Flexible schedule', 'Work locally', 'Weekly payouts'],
    },
    {
      title: 'Service Provider',
      description: 'Offer professional services to customers',
      icon: FaHandsHelping,
      link: '/register/provider',
      color: 'bg-purple-50 border-purple-200 hover:border-purple-400',
      iconColor: 'text-purple-600',
      features: ['Set your own rates', 'Choose your services', 'Manage bookings', 'Build reputation'],
    },
  ]

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 mx-4 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-text">Join GEOBUY</h2>
            <p className="text-text-light text-sm mt-1">Choose how you want to use GEOBUY</p>
          </div>
          <button
            onClick={onClose}
            className="text-text-light hover:text-text transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {signupOptions.map((option) => {
            const Icon = option.icon
            return (
              <Link
                key={option.title}
                to={option.link}
                onClick={onClose}
                className={`card p-6 border-2 ${option.color} transition-all duration-300 hover:shadow-large hover:-translate-y-1 group`}
              >
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full ${option.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`text-3xl ${option.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-text mb-1">{option.title}</h3>
                  <p className="text-sm text-text-light mb-4">{option.description}</p>
                  
                  <ul className="text-left space-y-2 mb-4">
                    {option.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-text-light">
                        <span className="text-primary mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-center text-primary font-medium group-hover:space-x-2 transition-all duration-300">
                    <span>Sign Up</span>
                    <FaArrowRight className="text-sm transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-text-light">
            Already have an account?{' '}
            <Link to="/login" onClick={onClose} className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
          <div className="mt-3 flex justify-center space-x-4 text-xs text-text-lighter">
            <span>🎯 100+ active users</span>
            <span>⭐ 4.8 average rating</span>
            <span>🏆 Verified providers</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignupModal