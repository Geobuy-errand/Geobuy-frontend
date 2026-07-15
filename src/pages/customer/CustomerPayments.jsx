import React from 'react'
import { useGetMyPaymentsQuery } from '../../redux/services/paymentApi'
import { FaCreditCard, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa'

const CustomerPayments = () => {
  const { data: payments, isLoading } = useGetMyPaymentsQuery()

  const getStatusIcon = (status) => {
    switch (status) {
      case 'succeeded': return <FaCheckCircle className="text-green-600" />
      case 'processing': return <FaClock className="text-yellow-600" />
      case 'refunded': return <FaTimesCircle className="text-red-600" />
      default: return <FaClock className="text-gray-600" />
    }
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">Payments</h1>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-20 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : payments?.length === 0 ? (
        <div className="text-center py-12">
          <FaCreditCard className="text-4xl text-text-lighter mx-auto mb-4" />
          <p className="text-text-light">No payment history</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments?.map((payment) => (
            <div key={payment._id} className="card">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">{getStatusIcon(payment.status)}</div>
                  <div>
                    <p className="font-semibold text-text">
                      Booking #{payment.bookingId?.bookingId}
                    </p>
                    <p className="text-sm text-text-light">
                      {payment.bookingId?.serviceType}
                    </p>
                    <p className="text-xs text-text-lighter">
                      {new Date(payment.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right mt-4 md:mt-0">
                  <p className="text-xl font-bold text-primary">
                    £{payment.amount?.toFixed(2)}
                  </p>
                  <p className="text-sm text-text-lighter capitalize">
                    {payment.status}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CustomerPayments