import React from 'react'

const PrivacyPolicy = () => {
  return (
    <div className="py-12">
      <div className="container-custom max-w-4xl">
        <div className="card">
          <h1 className="text-3xl font-bold text-text mb-6">Privacy Policy</h1>
          <p className="text-text-light mb-6">Last updated: January 2024</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-text mb-3">1. Introduction</h2>
            <p className="text-text-light">
              At GEOBUY Errands, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-text mb-3">2. Information We Collect</h2>
            <p className="text-text-light mb-2">We collect the following types of information:</p>
            <ul className="list-disc list-inside text-text-light space-y-1">
              <li>Personal identification information (name, email, phone number, address)</li>
              <li>Payment information (processed securely through Stripe)</li>
              <li>Booking and transaction history</li>
              <li>Communication history with providers and support</li>
              <li>Device and usage information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-text mb-3">3. How We Use Your Information</h2>
            <p className="text-text-light mb-2">We use your information to:</p>
            <ul className="list-disc list-inside text-text-light space-y-1">
              <li>Create and manage your account</li>
              <li>Process bookings and payments</li>
              <li>Communicate with you about bookings and updates</li>
              <li>Verify providers and ensure platform safety</li>
              <li>Improve our services and user experience</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-text mb-3">4. Information Sharing</h2>
            <p className="text-text-light">
              We do not sell, trade, or rent your personal information to third parties. We may share information with:
            </p>
            <ul className="list-disc list-inside text-text-light space-y-1 mt-2">
              <li>Providers to fulfill your bookings</li>
              <li>Payment processors (Stripe) for payment processing</li>
              <li>Legal authorities when required by law</li>
              <li>Service providers who assist in our operations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-text mb-3">5. Data Security</h2>
            <p className="text-text-light">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-text mb-3">6. Your Rights</h2>
            <p className="text-text-light mb-2">You have the right to:</p>
            <ul className="list-disc list-inside text-text-light space-y-1">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-text mb-3">7. Contact Us</h2>
            <p className="text-text-light">
              If you have any questions about this Privacy Policy, please contact us at:
              <br />
              <strong>Email:</strong> privacy@geobuy.com
              <br />
              <strong>Address:</strong> London, United Kingdom
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy