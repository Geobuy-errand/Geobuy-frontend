import React from 'react'
import { Link } from 'react-router-dom'
import { FaCheck } from 'react-icons/fa'

const Pricing = () => {
  const plans = [
    {
      name: 'Basic',
      price: 'Free',
      description: 'For customers who need occasional errands',
      features: [
        'Create up to 5 bookings per month',
        'Basic service selection',
        'Email support',
        'Standard response time',
      ],
      buttonText: 'Get Started',
      buttonLink: '/register/customer',
      popular: false,
    },
    {
      name: 'Pro',
      price: '£9.99',
      period: '/month',
      description: 'For regular customers with frequent errands',
      features: [
        'Unlimited bookings',
        'Priority service selection',
        'Priority support',
        'Fast response time',
        'Booking history',
        'Provider ratings',
      ],
      buttonText: 'Start Pro',
      buttonLink: '/register/customer',
      popular: true,
    },
    {
      name: 'Business',
      price: '£29.99',
      period: '/month',
      description: 'For businesses with regular delivery needs',
      features: [
        'Everything in Pro',
        'Business dashboard',
        'Team member access',
        'Analytics and reports',
        'Dedicated account manager',
        'API access',
      ],
      buttonText: 'Contact Sales',
      buttonLink: '/contact',
      popular: false,
    },
  ]

  return (
    <div className="py-12">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h1 className="section-title">Simple, Transparent Pricing</h1>
          <p className="section-subtitle">
            Choose the plan that works best for you. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`card relative ${plan.popular ? 'border-2 border-primary shadow-large' : ''}`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-semibold">
                  Most Popular
                </span>
              )}
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-text">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-text">{plan.price}</span>
                  {plan.period && (
                    <span className="text-text-light text-sm">{plan.period}</span>
                  )}
                </div>
                <p className="text-text-light text-sm mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start space-x-3">
                    <FaCheck className="text-primary mt-1 flex-shrink-0" />
                    <span className="text-text-light text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={plan.buttonLink}
                className={`w-full block text-center py-3 rounded-xl font-medium transition-colors
                  ${plan.popular
                    ? 'btn-primary'
                    : 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
                  }`}
              >
                {plan.buttonText}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-text-light text-sm">
            All plans include a 14-day money-back guarantee. No questions asked.
          </p>
          <p className="text-text-light text-sm mt-2">
            For providers: We take a 10% service fee on each completed booking.
          </p>
        </div>

        <div className="mt-8 bg-gray-50 rounded-2xl p-6 text-center">
          <p className="text-text-light">
            Need a custom plan?{' '}
            <Link to="/contact" className="text-primary hover:underline">
              Contact our sales team
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Pricing