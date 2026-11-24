import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { FaLock, FaCheckCircle, FaSpinner, FaCreditCard, FaHourglassHalf, FaUndo, FaListUl } from 'react-icons/fa'
import http from '../../services/http'
import useCountry from '../../hooks/useCountry'
import { useCompleteServiceRequestMutation, useCancelServiceRequestMutation } from '../../redux/services/serviceApi'

/**
 * Customer-side booking & payment panel for a provider (service) request.
 *
 *   quotes in        -> "Compare quotes" link
 *   provider chosen  -> "Pay now" (Stripe in the UK, Paystack in Nigeria)
 *   paid             -> money held securely until the customer confirms
 *   provider done    -> "Confirm job is done" releases the provider's earnings
 *
 * Older bookings (no paymentStatus) were paid to the provider directly.
 */
const ServiceBookingPanel = ({ request, refetch }) => {
  const { format, country } = useCountry()
  const [searchParams, setSearchParams] = useSearchParams()
  const [busy, setBusy] = useState(false)
  const [completeRequest, { isLoading: completing }] = useCompleteServiceRequestMutation()
  const [cancelRequest, { isLoading: cancelling }] = useCancelServiceRequestMutation()

  const gatewayName = country.code === 'NG' ? 'Paystack' : 'Stripe'
  const status = request?.status
  const paymentStatus = request?.paymentStatus
  const inAppPayment = paymentStatus !== undefined && paymentStatus !== null
  const price = request?.finalPrice

  // Coming back from the payment page: confirm with the server
  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref') || searchParams.get('session_id')
    if (searchParams.get('payment') === 'cancelled') {
      toast('Payment was cancelled — you can try again any time.')
      setSearchParams({}, { replace: true })
      return
    }
    if (!reference) return
    let cancelled = false
    ;(async () => {
      setBusy(true)
      try {
        const { data } = await http.get(`/payments/verify?reference=${encodeURIComponent(reference)}`)
        if (cancelled) return
        if (data.paid) toast.success('Payment successful! Your provider has been told they can start.')
        else toast.error('Payment not completed yet. If you were charged, it will update shortly.')
      } catch (error) {
        if (!cancelled) toast.error(error.response?.data?.message || 'Could not confirm payment')
      } finally {
        if (!cancelled) {
          setBusy(false)
          setSearchParams({}, { replace: true })
          refetch?.()
        }
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePay = async () => {
    setBusy(true)
    try {
      const { data } = await http.post('/payments/service-request/checkout', { serviceRequestId: request._id })
      window.location.assign(data.url)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not start payment')
      setBusy(false)
    }
  }

  const handleConfirm = async () => {
    if (!window.confirm("Confirm the job is done? Your provider will be paid and this can't be undone.")) return
    try {
      const res = await completeRequest(request._id).unwrap()
      toast.success(res.fundsReleased ? 'Thanks! Your provider has been paid.' : 'Job marked as completed')
      refetch?.()
    } catch (error) {
      toast.error(error.data?.message || 'Could not complete this booking')
    }
  }

  const handleCancel = async () => {
    const reason = window.prompt(
      paymentStatus === 'paid' ? 'Cancel this booking? You will be refunded in full. Reason (optional):' : 'Cancel this request? Reason (optional):'
    )
    if (reason === null) return
    try {
      const res = await cancelRequest({ id: request._id, reason }).unwrap()
      toast.success(res.message || 'Cancelled')
      refetch?.()
    } catch (error) {
      toast.error(error.data?.message || 'Could not cancel')
    }
  }

  if (!request) return null

  const canCompare = ['pending', 'quotes_received', 'negotiating'].includes(status)
  const isClosed = ['completed', 'cancelled', 'expired'].includes(status)

  return (
    <div className="card mb-6 border border-primary/20" data-testid="service-booking-panel">
      <h2 className="text-lg font-semibold text-text mb-3">Booking & payment</h2>

      {canCompare && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-text-light text-sm">
            {status === 'pending'
              ? 'Providers near you are being invited to quote.'
              : 'You have quotes from providers. Compare them and choose one.'}
          </p>
          <Link to={`/customer/quote-comparison/${request._id}`} className="btn-primary text-sm py-2 px-4 flex items-center gap-2 justify-center">
            <FaListUl /> <span>Compare quotes</span>
          </Link>
        </div>
      )}

      {!canCompare && price > 0 && (
        <div className="flex items-center justify-between mb-3">
          <span className="text-text-light">Agreed price</span>
          <span className="text-xl font-bold text-primary">{format(price)}</span>
        </div>
      )}

      {/* Needs payment */}
      {status === 'provider_selected' && paymentStatus === 'pending' && (
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
            <FaLock className="text-yellow-600 mt-1 flex-shrink-0" />
            <p className="text-sm text-yellow-800">
              Pay now to confirm your booking. Your money is held securely by Geobuy and only released to the provider after you confirm
              the job is done.
            </p>
          </div>
          <button onClick={handlePay} disabled={busy} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
            {busy ? <FaSpinner className="animate-spin" /> : <FaCreditCard />}
            <span>{busy ? 'Opening secure checkout…' : `Pay ${format(price)} with ${gatewayName}`}</span>
          </button>
        </div>
      )}

      {/* Paid, waiting for / during the job */}
      {paymentStatus === 'paid' && ['provider_selected', 'in_progress'].includes(status) && (
        <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
          <FaCheckCircle className="text-green-600 mt-1 flex-shrink-0" />
          <p className="text-sm text-green-800">
            Paid — {format(price)} is held securely.{' '}
            {status === 'in_progress' ? 'Your provider is working on the job.' : 'Your provider has been told they can start.'}
          </p>
        </div>
      )}

      {/* Provider says it's done */}
      {status === 'awaiting_confirmation' && (
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <FaHourglassHalf className="text-blue-600 mt-1 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              Your provider has marked the job as done. Please check the work and confirm. If there's a problem, contact support before
              confirming — if you don't respond, it is confirmed automatically after a set time (48 hours by default).
            </p>
          </div>
          <button onClick={handleConfirm} disabled={completing} className="btn-primary w-full disabled:opacity-50">
            {completing ? 'Confirming…' : 'Confirm job is done'}
          </button>
        </div>
      )}

      {/* Older bookings paid directly to the provider */}
      {!inAppPayment && ['provider_selected', 'in_progress'].includes(status) && (
        <button onClick={handleConfirm} disabled={completing} className="btn-primary w-full disabled:opacity-50">
          {completing ? 'Confirming…' : 'Mark job as completed'}
        </button>
      )}

      {status === 'completed' && (
        <p className="text-sm text-green-700 flex items-center gap-2">
          <FaCheckCircle /> Completed{paymentStatus === 'released' ? ' — your provider has been paid.' : '.'}
        </p>
      )}

      {['refunded', 'refund_pending'].includes(paymentStatus) && (
        <p className="text-sm text-text-light flex items-center gap-2 mt-2">
          <FaUndo /> {paymentStatus === 'refunded' ? 'Refunded to your original payment method.' : 'Refund in progress.'}
        </p>
      )}

      {!isClosed && ['pending', 'quotes_received', 'negotiating', 'provider_selected'].includes(status) && (
        <button onClick={handleCancel} disabled={cancelling} className="text-sm text-red-600 hover:underline mt-4">
          {cancelling ? 'Cancelling…' : paymentStatus === 'paid' ? 'Cancel booking and get a refund' : 'Cancel request'}
        </button>
      )}
    </div>
  )
}

export default ServiceBookingPanel
