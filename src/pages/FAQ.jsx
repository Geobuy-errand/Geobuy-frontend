import React, { useState } from 'react'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: 'What is GEOBUY Errands?',
      answer: 'GEOBUY Errands is an online marketplace connecting customers who need errands completed with verified local providers. Think of it like Uber, but for errands instead of rides.',
    },
    {
      question: 'How does the booking process work?',
      answer: 'Simply create a booking with your errand details, choose a service, and set your preferred time. Nearby providers will be notified, and you can choose the best one for your needs.',
    },
    {
      question: 'How are providers verified?',
      answer: 'All providers undergo a thorough verification process including identity verification, background checks, and document verification. We ensure only trusted providers join our platform.',
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept all major debit and credit cards through our secure Stripe payment system. Payments are held in escrow and released to the provider only after you confirm the errand is complete.',
    },
    {
      question: 'Can I cancel a booking?',
      answer: 'Yes, you can cancel a booking up to 24 hours before the scheduled time for a full refund. Cancellations within 24 hours may be subject to a cancellation fee.',
    },
    {
      question: 'How do I become a provider?',
      answer: 'You can register as a provider by clicking "Become a Provider" and completing the registration form. You\'ll need to provide identification, proof of address, and bank details for payments.',
    },
    {
      question: 'Is my personal information secure?',
      answer: 'Yes, we take data security seriously. All information is encrypted, and we never share your personal information without your explicit consent. We comply with UK privacy regulations.',
    },
    {
      question: 'What happens if something goes wrong?',
      answer: 'We have a dedicated support team available 24/7 to help resolve any issues. You can contact us through the app, email, or phone for immediate assistance.',
    },
  ]

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="py-12">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h1 className="section-title">Frequently Asked Questions</h1>
          <p className="section-subtitle">
            Find answers to the most common questions about GEOBUY Errands.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="card hover:shadow-medium transition-shadow">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between text-left"
              >
                <h3 className="text-lg font-semibold text-text pr-4">{faq.question}</h3>
                {openIndex === index ? (
                  <FaChevronUp className="text-primary flex-shrink-0" />
                ) : (
                  <FaChevronDown className="text-primary flex-shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-text-light">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-text-light">
            Still have questions?{' '}
            <a href="/contact" className="text-primary hover:underline">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default FAQ