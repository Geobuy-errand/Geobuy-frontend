import React from 'react'
import { Link } from 'react-router-dom'
import { FaClock, FaShieldAlt, FaUserCheck, FaRocket, FaShoppingBag, FaBox, FaFileAlt, FaHeart } from 'react-icons/fa'

const Home = () => {
  const features = [
    {
      icon: FaShieldAlt,
      title: 'Secure and safe',
      description: 'Your details, payments and tasks are fully protected.',
    },
    {
      icon: FaUserCheck,
      title: 'Trusted providers',
      description: 'All helpers are vetted and DBS-checked.',
    },
    {
      icon: FaRocket,
      title: 'Fast and reliable',
      description: 'We deliver on time, every time.',
    },
    {
      icon: FaClock,
      title: 'Save time',
      description: 'Get your errands done without leaving home.',
    },
  ]

  const services = [
    {
      icon: FaShoppingBag,
      title: 'Shopping',
      description: 'Grocery, pharmacy, retail and more',
    },
    {
      icon: FaBox,
      title: 'Parcel Delivery',
      description: 'Pick up and deliver parcels',
    },
    {
      icon: FaFileAlt,
      title: 'Document Delivery',
      description: 'Secure document handling',
    },
    {
      icon: FaHeart,
      title: 'Care & Domestic Support',
      description: 'Basic care and domestic assistance',
    },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-white to-secondary/5 py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-text mb-6">
              Your Time, <span className="text-primary">Delivered.</span>
            </h1>
            <p className="text-lg md:text-xl text-text-light mb-4">
              Shopping, picking up parcels, delivering documents, or basic care and domestic support.
            </p>
            <p className="text-md text-text-light mb-8">
              Connect with verified local providers to get your errands done quickly and efficiently.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register/customer" className="btn-primary">
                Get Started
              </Link>
              <Link to="/services" className="btn-outline">
                Explore Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <h2 className="section-title text-center">What We Offer</h2>
          <p className="section-subtitle text-center max-w-2xl mx-auto mb-12">
            From everyday tasks to specialized support, we've got you covered.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div key={index} className="card text-center hover:shadow-large transition-shadow">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <service.icon className="text-2xl text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                <p className="text-text-light text-sm">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose GEOBUY Section */}
      <section className="py-20">
        <div className="container-custom">
          <h2 className="section-title text-center">Simple, reliable errands—right where you are</h2>
          <p className="section-subtitle text-center max-w-2xl mx-auto mb-12">
            We make it easy to get your errands done with peace of mind.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="card text-center hover:shadow-large transition-shadow">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="text-2xl text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-text-light text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-primary-light text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers and providers on GEOBUY Errands.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register/customer" className="bg-white text-primary px-8 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors">
              I Need Help
            </Link>
            <Link to="/become-provider" className="bg-amber-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-secondary-dark transition-colors">
              I Want to Help
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home