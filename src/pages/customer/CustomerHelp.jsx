import React, { useState } from 'react'
import { FaQuestionCircle, FaPhone, FaEnvelope, FaBook, FaChevronDown, FaChevronUp } from 'react-icons/fa'

const CustomerHelp = () => {
  const [openFaq, setOpenFaq] = useState(null)

  const faqs = [
    {
      question: 'How do I create a booking?',
      answer: 'Go to "Create Booking" in your dashboard, select a service, fill in the details, and submit. Nearby providers will be notified.',
    },
    {
      question: 'How do I track my booking?',
      answer: 'You can track your booking in real-time from the booking details page. You\'ll see the provider\'s location and status updates.',
    },
    {
      question: 'What if my provider doesn\'t show up?',
      answer: 'If your provider doesn\'t arrive on time, please contact support immediately. We\'ll help you find an alternative provider.',
    },
    {
      question: 'How do I cancel a booking?',
      answer: 'You can cancel a booking from the booking details page. Cancellations within 24 hours may be subject to a fee.',
    },
    {
      question: 'How do I leave a review?',
      answer: 'After a booking is completed, you\'ll be prompted to leave a review. You can also review from the Reviews section in your dashboard.',
    },
    {
      question: 'What should I do if I have a complaint?',
      answer: 'Please contact our support team through the app or email. We take all complaints seriously and will investigate promptly.',
    },
  ]

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">Help Center</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card text-center">
          <FaQuestionCircle className="text-3xl text-primary mx-auto mb-3" />
          <h3 className="font-semibold text-text">FAQ</h3>
          <p className="text-sm text-text-light">Find answers to common questions</p>
        </div>
        <div className="card text-center">
          <FaPhone className="text-3xl text-primary mx-auto mb-3" />
          <h3 className="font-semibold text-text">Call Support</h3>
          <p className="text-sm text-text-light">+44 20 1234 5678</p>
          <p className="text-xs text-text-lighter">Mon-Fri 9AM-6PM</p>
        </div>
        <div className="card text-center">
          <FaEnvelope className="text-3xl text-primary mx-auto mb-3" />
          <h3 className="font-semibold text-text">Email Support</h3>
          <p className="text-sm text-text-light">support@geobuy.com</p>
          <p className="text-xs text-text-lighter">Reply within 24 hours</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-text mb-4 flex items-center">
          <FaBook className="mr-2 text-primary" />
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-text">{faq.question}</span>
                {openFaq === index ? (
                  <FaChevronUp className="text-primary flex-shrink-0" />
                ) : (
                  <FaChevronDown className="text-primary flex-shrink-0" />
                )}
              </button>
              {openFaq === index && (
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <p className="text-text-light">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-text-light">
          Can't find what you're looking for?{' '}
          <a href="/contact" className="text-primary hover:underline">
            Contact our support team
          </a>
        </p>
      </div>
    </div>
  )
}

export default CustomerHelp