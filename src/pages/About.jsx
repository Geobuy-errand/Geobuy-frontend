import React from 'react'
import { FaCheckCircle, FaUsers, FaShieldAlt, FaClock } from 'react-icons/fa'

const About = () => {
  const values = [
    {
      icon: FaCheckCircle,
      title: 'Reliability',
      description: 'We connect you with verified providers you can trust.',
    },
    {
      icon: FaUsers,
      title: 'Community',
      description: 'Building a community of helpers and those who need help.',
    },
    {
      icon: FaShieldAlt,
      title: 'Safety',
      description: 'All providers are background checked and verified.',
    },
    {
      icon: FaClock,
      title: 'Efficiency',
      description: 'Get your errands done quickly and efficiently.',
    },
  ]

  return (
    <div className="py-12">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="section-title">About GEOBUY Errands</h1>
          <p className="section-subtitle">
            Your time, delivered. We're on a mission to make errand-running simple, safe, and efficient.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div>
            <img
              src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&h=400&fit=crop"
              alt="About GEOBUY"
              className="rounded-2xl shadow-soft w-full h-64 object-cover"
            />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-text mb-4">Our Mission</h2>
            <p className="text-text-light mb-4">
              At GEOBUY Errands, we believe that everyone deserves to have their time back. 
              Whether you're a busy professional, a senior citizen, or someone who just needs 
              a helping hand, we connect you with trusted local providers who can get the job done.
            </p>
            <p className="text-text-light">
              Our platform is built on trust, transparency, and a commitment to making life 
              easier for everyone in our community.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <div key={index} className="card text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <value.icon className="text-2xl text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">{value.title}</h3>
              <p className="text-text-light text-sm">{value.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-primary/5 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-text mb-4">Ready to Get Started?</h2>
          <p className="text-text-light mb-6">
            Join thousands of satisfied customers and providers in our community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/register/customer" className="btn-primary">Join as Customer</a>
            <a href="/become-provider" className="btn-secondary">Join as Provider</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About