import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { 
  FaHeart, FaUsers, FaCalendar, FaMapMarkerAlt, FaClock, 
  FaCheckCircle, FaArrowRight, FaGift,
  FaHandsHelping, FaStar, FaUserFriends, FaGlobe
} from 'react-icons/fa'

const ConnectLanding = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const [showMore, setShowMore] = useState(false)

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/customer/connect')
    } else {
      navigate('/login', { state: { from: '/customer/connect' } })
    }
  }

  const features = [
    {
      icon: FaCalendar,
      title: 'Weekly Sunday Group Dates',
      description: 'Every Sunday, we organize group meetups at carefully selected spots near your location. Meet new people in a relaxed, fun environment.',
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      icon: FaHeart,
      title: 'Find Your Connection',
      description: 'Whether you\'re looking for love, friendship, or just to mingle, our group dates are designed to help you connect with like-minded people.',
      color: 'text-red-500',
      bg: 'bg-red-50',
    },
    {
      icon: FaMapMarkerAlt,
      title: 'Local Meetups',
      description: 'We organize meetups in your area so you can connect with people who live nearby. Your next connection could be just around the corner!',
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      icon: FaUsers,
      title: 'Your Choice, Your Pace',
      description: 'Choose from casual dating, friendship, serious relationships, or just mingling. You decide what you\'re looking for.',
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
  ]

  const purposeOptions = [
    { icon: '😊', label: 'Casual date', description: 'Relaxed, fun, no pressure' },
    { icon: '🔥', label: 'Flirting & fun', description: 'Lighthearted chats, good vibes' },
    { icon: '❤️', label: 'Serious relationship', description: 'Long-term, genuine connection' },
    { icon: '☕', label: 'Friendship first', description: 'Start as friends, see where it goes' },
    { icon: '🧭', label: 'Open to anything', description: 'Keep it easy, see how it flows' },
    { icon: '💃', label: 'Group meetups only', description: 'Enjoy the gathering, no pressure' },
    { icon: '🤝', label: 'Meaningful connections', description: 'Real chats, no games' },
    { icon: '🎉', label: 'Just to mingle', description: 'Meet new people, have a great time' },
    { icon: '💍', label: 'Ready for commitment', description: 'Looking for my person' },
  ]

  const howItWorks = [
    {
      step: 1,
      title: 'Sign Up & Tell Us What You\'re Looking For',
      description: 'Create your profile and let us know what kind of connection you\'re seeking.',
      icon: FaUserFriends,
    },
    {
      step: 2,
      title: 'Pay the One-Time Fee',
      description: 'A small £1.99 fee unlocks unlimited access to all our connect events.',
      icon: FaGift,
    },
    {
      step: 3,
      title: 'Get Your Sunday Meetup Spot',
      description: 'Every Sunday, we\'ll send you a location near you for the group meetup.',
      icon: FaMapMarkerAlt,
    },
    {
      step: 4,
      title: 'Show Up & Connect!',
      description: 'Meet new people, have fun, and see where the connection takes you.',
      icon: FaGlobe,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-white to-secondary/10 py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-primary/10 rounded-full px-4 py-1 mb-6">
              <span className="text-primary font-medium text-sm">✨ GEOBUY Connect</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-text mb-6">
              Weekly Group Dates
              <br />
              <span className="text-primary">Right Around the Corner</span>
            </h1>
            <p className="text-lg md:text-xl text-text-light mb-6 max-w-2xl mx-auto">
              Register your location, and every Sunday we'll share a meetup spot near you. 
              Come meet new people, mingle, and see who you click with — your next connection 
              could be closer than you think.
            </p>
            <p className="text-md text-text-light mb-8 max-w-xl mx-auto">
              🌍 Meet neighbours and build real connections in your community
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
                onClick={handleGetStarted}
                className="btn-primary flex items-center space-x-2 text-lg px-8 py-3"
              >
                <span>Get Started</span>
                <FaArrowRight />
              </button>
              <Link
                to="/customer/connect"
                className="btn-outline flex items-center space-x-2"
              >
                <span>Learn More</span>
              </Link>
            </div>
            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-text-light">
              <span className="flex items-center gap-1">
                <FaCheckCircle className="text-primary" /> One-time fee £1.99
              </span>
              <span className="flex items-center gap-1">
                <FaCheckCircle className="text-primary" /> Weekly Sunday meetups
              </span>
              <span className="flex items-center gap-1">
                <FaCheckCircle className="text-primary" /> Your local area
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* What You're Looking For */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text">What Are You Looking For?</h2>
            <p className="text-text-light mt-2">Choose what matters to you — we'll match you with the right vibe</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {purposeOptions.map((option, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/20"
              >
                <span className="text-2xl">{option.icon}</span>
                <div>
                  <p className="font-medium text-text text-sm">{option.label}</p>
                  <p className="text-xs text-text-light">{option.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card text-center hover:shadow-large transition-shadow"
              >
                <div className={`w-14 h-14 rounded-full ${feature.bg} flex items-center justify-center mx-auto mb-4`}>
                  <feature.icon className={`text-2xl ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-text mb-2">{feature.title}</h3>
                <p className="text-text-light text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text">How It Works</h2>
            <p className="text-text-light mt-2">Four simple steps to start connecting</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item) => (
              <div key={item.step} className="relative">
                <div className="card text-center hover:shadow-large transition-shadow h-full">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="text-2xl text-primary" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-text mb-2">{item.title}</h3>
                  <p className="text-text-light text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sunday Group Date Highlight */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block bg-primary/10 rounded-full px-4 py-1 mb-4">
              <span className="text-primary font-medium text-sm">🌟 Every Sunday</span>
            </div>
            <h2 className="text-3xl font-bold text-text mb-4">
              Sunday Group Dates — Your Weekly Connection
            </h2>
            <p className="text-text-light text-lg mb-6">
              Every Sunday, we curate a meetup spot in your area. Come mingle, 
              enjoy good vibes, and meet amazing people. No pressure — just 
              great conversations and new connections.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 shadow-soft">
                <FaCalendar className="text-2xl text-primary mx-auto mb-2" />
                <p className="text-sm font-medium text-text">Every Sunday</p>
                <p className="text-xs text-text-light">Weekly meetups</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-soft">
                <FaMapMarkerAlt className="text-2xl text-primary mx-auto mb-2" />
                <p className="text-sm font-medium text-text">Local Spots</p>
                <p className="text-xs text-text-light">Near you</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-soft">
                <FaUsers className="text-2xl text-primary mx-auto mb-2" />
                <p className="text-sm font-medium text-text">Group Setting</p>
                <p className="text-xs text-text-light">Relaxed & fun</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-soft">
                <FaHeart className="text-2xl text-primary mx-auto mb-2" />
                <p className="text-sm font-medium text-text">Your Choice</p>
                <p className="text-xs text-text-light">Find your vibe</p>
              </div>
            </div>
            <p className="text-sm text-text-light">
              💡 Can't make Sunday? No worries — you can also schedule individual meetups 
              Monday through Saturday. We're flexible!
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Connect?
          </h2>
          <p className="text-primary-light text-lg mb-8 max-w-2xl mx-auto">
            Join the community. Find your people. Your next connection is waiting.
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-primary px-8 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors flex items-center space-x-2 mx-auto"
          >
            <span>Get Started Now</span>
            <FaArrowRight />
          </button>
          <p className="text-white/60 text-sm mt-4">
            £1.99 one-time fee • Unlimited connections • Local meetups
          </p>
        </div>
      </section>
    </div>
  )
}

export default ConnectLanding