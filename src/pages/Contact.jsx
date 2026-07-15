import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      toast.success('Message sent successfully! We\'ll get back to you soon.')
      setFormData({ name: '', email: '', subject: '', message: '' })
      setIsSubmitting(false)
    }, 1500)
  }

  const contactInfo = [
    {
      icon: FaPhone,
      label: 'Phone',
      value: '+44 20 1234 5678',
      description: 'Mon-Fri 9AM-6PM',
    },
    {
      icon: FaEnvelope,
      label: 'Email',
      value: 'support@geobuy.com',
      description: 'We reply within 24 hours',
    },
    {
      icon: FaMapMarkerAlt,
      label: 'Address',
      value: 'London, United Kingdom',
      description: 'Visit our office',
    },
    {
      icon: FaClock,
      label: 'Working Hours',
      value: '24/7 Support',
      description: 'Always here to help',
    },
  ]

  return (
    <div className="py-12">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h1 className="section-title">Contact Us</h1>
          <p className="section-subtitle">
            Have questions or need help? We're here to support you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="card">
            <h2 className="text-2xl font-bold text-text mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="How can we help?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  className="input-field resize-none"
                  placeholder="Tell us about your issue or question..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-2xl font-bold text-text mb-6">Get in Touch</h2>
              <div className="space-y-4">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <info.icon className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-text-lighter">{info.label}</p>
                      <p className="text-text font-medium">{info.value}</p>
                      <p className="text-sm text-text-light">{info.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card bg-primary/5 border border-primary/10">
              <h3 className="text-lg font-semibold text-text mb-3">Emergency Support</h3>
              <p className="text-text-light text-sm mb-3">
                For urgent issues with an ongoing errand, please call our emergency support line.
              </p>
              <a href="tel:+442012345678" className="btn-primary text-sm py-2 inline-block">
                Call Emergency Support
              </a>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-text mb-3">Follow Us</h3>
              <p className="text-text-light text-sm">
                Stay updated with the latest news and updates from GEOBUY Errands.
              </p>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-text-light hover:text-primary transition-colors">Twitter</a>
                <a href="#" className="text-text-light hover:text-primary transition-colors">Facebook</a>
                <a href="#" className="text-text-light hover:text-primary transition-colors">Instagram</a>
                <a href="#" className="text-text-light hover:text-primary transition-colors">LinkedIn</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact