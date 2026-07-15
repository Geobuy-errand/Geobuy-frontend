import React from 'react'
import { Link } from 'react-router-dom'
import { FaMoneyBillWave, FaClock, FaUsers, FaShieldAlt, FaStar, FaMobile } from 'react-icons/fa'

const BecomeProvider = () => {
  const benefits = [
    {
      icon: FaMoneyBillWave,
      title: 'Earn Money',
      description: 'Set your own rates and earn money helping others in your community.',
    },
    {
      icon: FaClock,
      title: 'Flexible Schedule',
      description: 'Work when you want, choose the jobs that fit your availability.',
    },
    {
      icon: FaUsers,
      title: 'Meet New People',
      description: 'Connect with customers and build relationships in your area.',
    },
    {
      icon: FaShieldAlt,
      title: 'Stay Safe',
      description: 'We verify all users and provide support throughout the process.',
    },
    {
      icon: FaStar,
      title: 'Build Reputation',
      description: 'Earn ratings and reviews to grow your business.',
    },
    {
      icon: FaMobile,
      title: 'Easy to Use',
      description: 'Manage everything from your phone with our intuitive app.',
    },
  ]

  return (
    <div className="py-12">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h1 className="section-title">Become a Provider</h1>
          <p className="section-subtitle">
            Join our network of trusted local providers and start earning today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <div key={index} className="card text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <benefit.icon className="text-2xl text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">{benefit.title}</h3>
              <p className="text-text-light text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-primary-light mb-6">
              Join thousands of providers who are already helping their communities and earning money.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register/provider" className="bg-white text-primary px-8 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors">
                Register as Provider
              </Link>
              <Link to="/pricing" className="bg-secondary text-white px-8 py-3 rounded-xl font-medium hover:bg-secondary-dark transition-colors">
                See Pricing
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card">
            <h3 className="text-xl font-bold text-text mb-4">What You Need</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <span className="text-primary font-bold">✓</span>
                <span className="text-text-light">Be at least 18 years old</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-primary font-bold">✓</span>
                <span className="text-text-light">Have a valid UK phone number</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-primary font-bold">✓</span>
                <span className="text-text-light">Provide proof of identity (Passport or Driving Licence)</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-primary font-bold">✓</span>
                <span className="text-text-light">Proof of address (Utility bill or bank statement)</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-primary font-bold">✓</span>
                <span className="text-text-light">Right to work documentation</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-primary font-bold">✓</span>
                <span className="text-text-light">Bank account details for payments</span>
              </li>
            </ul>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold text-text mb-4">How It Works</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">1</div>
                <div>
                  <h4 className="font-semibold text-text">Register</h4>
                  <p className="text-text-light text-sm">Create your provider account and complete your profile</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">2</div>
                <div>
                  <h4 className="font-semibold text-text">Get Verified</h4>
                  <p className="text-text-light text-sm">Submit your documents for verification</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">3</div>
                <div>
                  <h4 className="font-semibold text-text">Accept Jobs</h4>
                  <p className="text-text-light text-sm">Browse available jobs and accept the ones you want</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">4</div>
                <div>
                  <h4 className="font-semibold text-text">Earn Money</h4>
                  <p className="text-text-light text-sm">Complete jobs and get paid securely through our platform</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BecomeProvider