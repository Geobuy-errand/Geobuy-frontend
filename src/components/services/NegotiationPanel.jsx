import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaHandshake, FaExchangeAlt, FaTimes, FaHourglassHalf } from 'react-icons/fa'
import {
  useSelectQuoteMutation,
  useNegotiateQuoteMutation,
  useRejectQuoteMutation,
  useAcceptCounterOfferMutation,
} from '../../redux/services/serviceApi'
import usePublicPricing from '../../hooks/usePublicPricing'

/**
 * Price negotiation on one quote, for the customer or the provider.
 * Turns alternate: whoever didn't make the latest offer can accept it,
 * counter it or decline. Accepting books the job and the customer pays next.
 */
export default function NegotiationPanel({ role, quote, history = [], format, currencySymbol, onBooked, onChanged, compact = false }) {
  const { features, operations } = usePublicPricing()
  const negotiationOn = features?.negotiationEnabled !== false
  const maxCounters = Number(operations?.maxCounterOffers || 0)

  const [selectQuote, { isLoading: accepting }] = useSelectQuoteMutation()
  const [acceptCounter, { isLoading: acceptingCounter }] = useAcceptCounterOfferMutation()
  const [negotiate, { isLoading: countering }] = useNegotiateQuoteMutation()
  const [reject, { isLoading: rejecting }] = useRejectQuoteMutation()
  const [showCounter, setShowCounter] = useState(false)
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')

  if (!quote) return null
  const other = role === 'customer' ? 'provider' : 'customer'
  const lastBy = quote.lastOfferBy || 'provider'
  const open = quote.status === 'pending'
  const myTurn = open && lastBy !== role
  const countersLeft = maxCounters ? Math.max(0, maxCounters - (quote.counterCount || 0)) : null
  const canCounter = myTurn && negotiationOn && countersLeft !== 0
  const busy = accepting || acceptingCounter || countering || rejecting

  const thread = [
    { from: 'provider', amount: quote.originalAmount ?? quote.amount, label: 'Quote', at: quote.createdAt },
    ...history
      .filter((h) => h.status === 'countered' || h.status === 'accepted' || h.status === 'rejected')
      .map((h) => ({ from: h.from, amount: h.amount ?? h.offerAmount, message: h.message, status: h.status, at: h.at ?? h.timestamp })),
  ]

  const handleAccept = async () => {
    const text = role === 'customer'
      ? `Book this provider for ${format(quote.amount)}? You'll pay next — the money is held securely until you confirm the job is done.`
      : `Accept ${format(quote.amount)}? The customer will be asked to pay, then you can start.`
    if (!window.confirm(text)) return
    try {
      if (role === 'customer') await selectQuote(quote._id).unwrap()
      else await acceptCounter({ quoteId: quote._id }).unwrap()
      toast.success(role === 'customer' ? 'Provider booked! Pay now to confirm.' : 'Deal agreed — the customer has been asked to pay.')
      onBooked?.()
    } catch (error) {
      toast.error(error.data?.message || 'Could not accept the offer')
      onChanged?.()
    }
  }

  const handleCounter = async (e) => {
    e.preventDefault()
    const value = parseFloat(amount)
    if (!Number.isFinite(value) || value <= 0) return toast.error('Enter a valid amount')
    try {
      await negotiate({ quoteId: quote._id, counterAmount: value, message: message.trim() || undefined }).unwrap()
      toast.success(`Counter-offer of ${format(value)} sent`)
      setShowCounter(false)
      setAmount('')
      setMessage('')
      onChanged?.()
    } catch (error) {
      toast.error(error.data?.message || 'Could not send the counter-offer')
      onChanged?.()
    }
  }

  const handleDecline = async () => {
    const text = role === 'customer' ? 'Decline this quote?' : 'Withdraw your quote? The customer will no longer be able to book you for this request.'
    if (!window.confirm(text)) return
    try {
      await reject({ quoteId: quote._id }).unwrap()
      toast.success(role === 'customer' ? 'Quote declined' : 'Quote withdrawn')
      onChanged?.()
    } catch (error) {
      toast.error(error.data?.message || 'Could not update the quote')
    }
  }

  return (
    <div className="space-y-3" data-testid={`negotiation-${role}`}>
      {/* Offer history */}
      {thread.length > 1 && !compact && (
        <ol className="space-y-1.5 text-sm" data-testid="negotiation-thread">
          {thread.map((t, i) => (
            <li key={i} className={`flex items-start gap-2 ${t.from === role ? 'justify-end text-right' : ''}`}>
              <span className={`inline-block rounded-lg px-3 py-1.5 ${t.from === role ? 'bg-primary/10' : 'bg-gray-100'}`}>
                <span className="font-medium">
                  {t.from === role ? 'You' : t.from === 'customer' ? 'Customer' : 'Provider'}
                  {t.status === 'accepted' ? ' accepted ' : t.status === 'rejected' ? ' declined' : i === 0 ? ' quoted ' : ' offered '}
                </span>
                {t.status !== 'rejected' && <span className="font-semibold">{format(t.amount)}</span>}
                {t.message && i > 0 && t.status === 'countered' && !/offered/.test(t.message) && (
                  <span className="block text-xs text-text-light mt-0.5">“{t.message}”</span>
                )}
              </span>
            </li>
          ))}
        </ol>
      )}

      {!open ? null : myTurn ? (
        <>
          <p className="text-sm text-text" data-testid="negotiation-turn">
            {lastBy === 'provider' && role === 'customer' && (quote.counterCount || 0) === 0
              ? <>Quoted price: <strong>{format(quote.amount)}</strong></>
              : <>The {other} offered <strong>{format(quote.amount)}</strong>. Accept, counter or decline.</>}
          </p>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleAccept} disabled={busy} className="btn-primary text-sm py-2 px-4 flex items-center gap-2 disabled:opacity-50" data-testid="negotiation-accept">
              <FaHandshake />
              {role === 'customer' ? `Accept & book — ${format(quote.amount)}` : `Accept ${format(quote.amount)}`}
            </button>
            {canCounter && (
              <button onClick={() => setShowCounter((v) => !v)} disabled={busy} className="btn-outline text-sm py-2 px-4 flex items-center gap-2 disabled:opacity-50" data-testid="negotiation-counter-toggle">
                <FaExchangeAlt /> Counter-offer
              </button>
            )}
            <button onClick={handleDecline} disabled={busy} className="text-sm py-2 px-3 text-red-600 hover:text-red-700 flex items-center gap-1 disabled:opacity-50" data-testid="negotiation-decline">
              <FaTimes /> {role === 'customer' ? 'Decline' : 'Withdraw quote'}
            </button>
          </div>
          {countersLeft !== null && negotiationOn && (
            <p className="text-xs text-text-lighter">{countersLeft === 0 ? 'No more counter-offers on this quote — accept or decline.' : `${countersLeft} counter-offer${countersLeft === 1 ? '' : 's'} left on this quote.`}</p>
          )}
          {showCounter && canCounter && (
            <form onSubmit={handleCounter} className="p-3 bg-gray-50 rounded-lg space-y-2" data-testid="negotiation-counter-form">
              <label className="block text-sm font-medium text-text-light">Your price ({currencySymbol})</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field"
                placeholder={`e.g. ${Math.round(Number(quote.amount) * 0.9)}`}
                required
                data-testid="negotiation-amount"
              />
              <input
                type="text"
                maxLength={300}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input-field"
                placeholder="Add a note (optional)"
              />
              <div className="flex gap-2">
                <button type="submit" disabled={busy} className="btn-primary text-sm py-2 px-4 disabled:opacity-50" data-testid="negotiation-send">
                  {countering ? 'Sending…' : 'Send offer'}
                </button>
                <button type="button" onClick={() => setShowCounter(false)} className="btn-outline text-sm py-2 px-4">Cancel</button>
              </div>
            </form>
          )}
        </>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-text-light flex items-center gap-2" data-testid="negotiation-waiting">
            <FaHourglassHalf className="text-yellow-600" />
            Waiting for the {other} to respond to your offer of <strong className="text-text">{format(quote.amount)}</strong>.
          </p>
          {role === 'provider' && (
            <button onClick={handleDecline} disabled={busy} className="text-xs text-red-600 hover:underline">Withdraw quote</button>
          )}
        </div>
      )}
    </div>
  )
}
