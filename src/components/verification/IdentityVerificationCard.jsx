import React, { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { FaIdCard, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaFlask, FaLock } from 'react-icons/fa'
import {
  useGetIdentityStatusQuery,
  useStartIdentityCheckMutation,
  useConfirmIdentityPaymentMutation,
  useRefreshIdentityCheckMutation,
} from '../../redux/services/identityApi'
import useCountry from '../../hooks/useCountry'

/**
 * Step 1 of verification: an automated identity check.
 *   Nigeria → NIN checked against NIMC (Didit), instant.
 *   UK      → photo ID + selfie (Didit); the person is sent to Didit and back.
 * If the admin has set "worker pays", the fee is taken first (Stripe / Paystack).
 */
export default function IdentityVerificationCard({ onVerified }) {
  const { format } = useCountry()
  const [params, setParams] = useSearchParams()
  const { data: status, isLoading, refetch } = useGetIdentityStatusQuery()
  const [start, { isLoading: starting }] = useStartIdentityCheckMutation()
  const [confirmPayment, { isLoading: confirming }] = useConfirmIdentityPaymentMutation()
  const [refresh] = useRefreshIdentityCheckMutation()
  const [nin, setNin] = useState('')
  const handled = useRef(false)

  // Back from the payment page or from Didit
  useEffect(() => {
    if (handled.current) return
    const paid = params.get('identity_payment')
    const back = params.get('identity')
    if (!paid && !back) return
    handled.current = true
    const clean = () => {
      const next = new URLSearchParams(params)
      ;['identity_payment', 'identity', 'check', 'session_id', 'reference', 'trxref', 'gateway', 'verificationSessionId', 'status'].forEach((k) => next.delete(k))
      setParams(next, { replace: true })
    }

    if (paid === 'cancelled') {
      toast('Payment cancelled — you can try again any time.')
      clean()
      return
    }
    if (paid) {
      confirmPayment({ check: params.get('check'), session_id: params.get('session_id') || undefined, reference: params.get('reference') || params.get('trxref') || undefined })
        .unwrap()
        .then((res) => {
          if (res.redirectUrl) window.location.assign(res.redirectUrl)
          else if (res.verified) {
            toast.success('Identity verified!')
            onVerified?.()
          } else refetch()
        })
        .catch((e) => toast.error(e.data?.message || 'Could not confirm your payment'))
        .finally(clean)
      return
    }
    // identity=return (Didit): the result may take a few seconds
    let tries = 0
    const poll = async () => {
      tries += 1
      try {
        const s = await refresh().unwrap()
        if (s.verified) {
          toast.success('Identity verified!')
          onVerified?.()
          return clean()
        }
        if (s.latest?.status && s.latest.status !== 'pending') return clean()
      } catch {
        /* keep trying */
      }
      if (tries < 6) setTimeout(poll, 4000)
      else clean()
    }
    poll()
  }, [params, setParams, confirmPayment, refresh, refetch, onVerified])

  if (isLoading || !status) return <div className="card mb-6"><div className="skeleton h-24 rounded-xl" /></div>
  if (!status.required && !status.verified) return null

  const latest = status.latest
  const isNG = status.country === 'NG'
  const fee = Number(status.fee || 0)
  const outOfAttempts = status.attemptsLeft === 0 && !status.verified

  const begin = async (e) => {
    e?.preventDefault()
    try {
      const res = await start(isNG ? { nin: nin.replace(/\D/g, '') || undefined } : {}).unwrap()
      if (res.paymentRequired && res.paymentUrl) {
        toast(`Redirecting to pay ${format(res.fee)}…`)
        window.location.assign(res.paymentUrl)
        return
      }
      if (res.redirectUrl) {
        window.location.assign(res.redirectUrl)
        return
      }
      if (res.verified) {
        toast.success('Identity verified!')
        onVerified?.()
      } else if (res.check?.status === 'in_review') toast('Thanks — we need to take a closer look. We will let you know soon.')
      else if (res.check?.status === 'declined') toast.error(res.check.reason || 'We could not verify your identity')
      else if (res.check?.status === 'error') toast.error(res.check.reason || 'The check could not run. Please try again shortly.')
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Could not start the ID check')
    }
  }

  const busy = starting || confirming

  return (
    <div className="card mb-6" data-testid="identity-card">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${status.verified ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
          {status.verified ? <FaCheckCircle className="text-2xl" /> : <FaIdCard className="text-2xl" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-text">Step 1 · Identity check</h2>
            {status.mock && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1" data-testid="identity-mock-badge">
                <FaFlask /> Test mode
              </span>
            )}
          </div>

          {status.verified ? (
            <p className="text-green-700 text-sm mt-1" data-testid="identity-verified">
              ✅ Identity verified{status.verifiedAt ? ` on ${new Date(status.verifiedAt).toLocaleDateString()}` : ''}.
              {status.accountStatus !== 'approved' && ' An admin will approve your account shortly.'}
            </p>
          ) : latest?.status === 'in_review' ? (
            <p className="text-blue-700 text-sm mt-1 flex items-center gap-2"><FaHourglassHalf /> Under review — {latest.reason || 'we need to take a closer look'}. We'll notify you.</p>
          ) : latest?.status === 'pending' && latest.sessionUrl ? (
            <div className="mt-2">
              <p className="text-sm text-text-light">You started an ID check but haven't finished it.</p>
              <a href={latest.sessionUrl} className="btn-primary text-sm py-2 px-4 inline-block mt-2">Continue ID check</a>
            </div>
          ) : (
            <>
              <p className="text-sm text-text-light mt-1">
                {isNG
                  ? 'Enter your National Identification Number (NIN). We check that the name and date of birth match your account — it takes a few seconds.'
                  : "You'll take a photo of your passport or driving licence and a quick selfie. It takes about 2 minutes."}
              </p>
              {latest && ['declined', 'error'].includes(latest.status) && (
                <p className="text-sm text-red-600 mt-2 flex items-center gap-1" data-testid="identity-failed"><FaTimesCircle /> {latest.reason || 'The last check did not pass.'}</p>
              )}
              {fee > 0 && (
                <p className="text-sm text-text mt-2 flex items-center gap-1"><FaLock className="text-text-lighter" /> A one-off fee of <strong>{format(fee)}</strong> applies, paid securely.</p>
              )}
              {outOfAttempts ? (
                <p className="text-sm text-red-600 mt-3">You've used all your attempts. Please contact support so we can help.</p>
              ) : isNG ? (
                <form onSubmit={begin} className="mt-3 flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={11}
                    value={nin}
                    onChange={(e) => setNin(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder={status.ninOnFile ? `NIN on file ${status.ninOnFile} — or enter another` : '11-digit NIN'}
                    className="input-field sm:max-w-xs"
                    data-testid="identity-nin"
                  />
                  <button type="submit" disabled={busy || (!status.ninOnFile && nin.length !== 11)} className="btn-primary text-sm py-2 px-5 disabled:opacity-50" data-testid="identity-start">
                    {busy ? 'Checking…' : fee > 0 ? `Pay ${format(fee)} & verify` : 'Verify NIN'}
                  </button>
                </form>
              ) : (
                <button onClick={begin} disabled={busy} className="btn-primary text-sm py-2 px-5 mt-3 disabled:opacity-50" data-testid="identity-start">
                  {busy ? 'Starting…' : fee > 0 ? `Pay ${format(fee)} & verify my ID` : 'Verify my ID'}
                </button>
              )}
              {status.attemptsLeft != null && status.attempts > 0 && !outOfAttempts && (
                <p className="text-xs text-text-lighter mt-2">{status.attemptsLeft} attempt{status.attemptsLeft === 1 ? '' : 's'} left.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
