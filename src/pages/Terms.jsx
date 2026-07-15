import React from 'react'

const Terms = () => {
  return (
    <div className="py-12">
      <div className="container-custom max-w-4xl">
        <div className="card">
          <h1 className="text-3xl font-bold text-text mb-6">Terms of Service</h1>
          <p className="text-text-light mb-6">Last updated: January 2024</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-text mb-3">1. Acceptance of Terms</h2>
            <p className="text-text-light">
              By using GEOBUY Errands, you agree to these Terms of Service. If you do not agree, please do not use our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-text mb-3">2. User Accounts</h2>
            <p className="text-text-light mb-2">To use our services, you must:</p>
            <ul className="list-disc list-inside text-text-light space-y-1">
              <li>Be at least 18 years old</li>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-text mb-3">3. Provider Verification</h2>
            <p className="text-text-light">
              Providers must submit verification documents including identification, proof of address, and right to work documentation. We reserve the right to reject any application that does not meet our standards.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-text mb-3">4. Booking and Payment</h2>
            <p className="text-text-light mb-2">All bookings are subject to:</p>
            <ul className="list-disc list-inside text-text-light space-y-1">
              <li>Provider availability and acceptance</li>
              <li>Payment processing through Stripe</li>
              <li>Escrow holding until service completion</li>
              <li>Our service fee structure</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-text mb-3">5. Cancellation Policy</h2>
            <p className="text-text-light">
              Customers may cancel bookings up to 24 hours before the scheduled time for a full refund. Cancellations within 24 hours may be subject to a cancellation fee. Providers who cancel accepted bookings may face penalties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-text mb-3">6. User Responsibilities</h2>
            <p className="text-text-light mb-2">Users agree to:</p>
            <ul className="list-disc list-inside text-text-light space-y-1">
              <li>Provide accurate information</li>
              <li>Treat providers and customers with respect</li>
              <li>Complete agreed-upon services</li>
              <li>Comply with all applicable laws</li>
              <li>Not use the platform for illegal activities</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-text mb-3">7. Liability</h2>
            <p className="text-text-light">
              GEOBUY Errands acts as a platform connecting customers and providers. We are not liable for the actions of users, but we take reasonable steps to ensure safety and quality.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-text mb-3">8. Termination</h2>
            <p className="text-text-light">
              We reserve the right to suspend or terminate accounts for violations of these terms, fraudulent activity, or any other reason at our discretion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-text mb-3">9. Changes to Terms</h2>
            <p className="text-text-light">
              We may update these terms from time to time. Continued use of the platform constitutes acceptance of updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">10. Contact</h2>
            <p className="text-text-light">
              For questions about these terms, please contact us at:
              <br />
              <strong>Email:</strong> legal@geobuy.com
              <br />
              <strong>Address:</strong> London, United Kingdom
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Terms