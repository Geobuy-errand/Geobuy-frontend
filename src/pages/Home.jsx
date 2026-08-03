import React from 'react'
import { Link } from 'react-router-dom'
import { FaClock, FaShieldAlt, FaUserCheck, FaRocket, FaShoppingBag, FaBox, FaFileAlt, FaHeart, FaRunning, FaHandsHelping } from 'react-icons/fa'

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

  const exploreOptions = [
    {
      icon: FaRunning,
      title: 'Book an Errand',
      description: 'Get your errands done quickly by trusted local providers. Shopping, deliveries, pickups and more.',
      link: '/book-errand',
      color: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600',
      hoverColor: 'hover:border-blue-300',
    },
    {
      icon: FaHandsHelping,
      title: 'Find Local Services',
      description: 'Connect with trusted local professionals for care, trades, personal services and more.',
      link: '/find-services',
      color: 'bg-purple-50 border-purple-200',
      iconColor: 'text-purple-600',
      hoverColor: 'hover:border-purple-300',
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
              <Link to="/book-errand" className="btn-outline">
                Book an Errand
              </Link>
              <Link to="/find-services" className="btn-secondary">
                Find Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Options Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <h2 className="section-title text-center">How Can We Help You?</h2>
          <p className="section-subtitle text-center max-w-2xl mx-auto mb-12">
            Choose the service that fits your needs. From quick errands to professional services.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {exploreOptions.map((option, index) => (
              <Link
                key={index}
                to={option.link}
                className={`card p-8 border-2 ${option.color} ${option.hoverColor} transition-all duration-300 hover:shadow-large group`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-full ${option.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <option.icon className={`text-3xl ${option.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-text mb-2">{option.title}</h3>
                  <p className="text-text-light text-sm leading-relaxed">{option.description}</p>
                  <span className="mt-4 text-primary font-medium flex items-center space-x-1 group-hover:space-x-2 transition-all duration-300">
                    <span>Learn More</span>
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview Section */}
      <section className="py-16">
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
          <div className="text-center mt-8">
            <Link to="/services" className="text-primary hover:underline font-medium inline-flex items-center space-x-1">
              <span>View all services</span>
              <span className="inline-block">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose GEOBUY Section */}
      <section className="py-20 bg-gray-50">
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
            <Link to="/become-provider" className="bg-amber-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-amber-700 transition-colors">
              I Want to Help
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home