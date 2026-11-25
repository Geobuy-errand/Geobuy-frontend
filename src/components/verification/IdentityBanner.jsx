import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FaIdCard, FaArrowRight } from 'react-icons/fa'
import { useGetIdentityStatusQuery } from '../../redux/services/identityApi'

/** "Verify your identity" prompt for providers and runners who haven't yet. */
export default function IdentityBanner({ status: given }) {
  const { user } = useSelector((s) => s.auth)
  const skip = !!given || !['provider', 'errand_runner'].includes(user?.role)
  const { data: fetched } = useGetIdentityStatusQuery(undefined, { skip })
  const status = given || fetched
  if (!status?.required || status.verified) return null

  const base = user?.role === 'provider' ? '/provider' : '/errand-runner'
  const latest = status.latest?.status
  const text =
    latest === 'in_review'
      ? 'Your ID check is being reviewed — we will let you know soon.'
      : latest === 'declined'
      ? 'Your ID check did not pass. Check your details and try again.'
      : user?.role === 'provider'
      ? 'Verify your identity to send quotes and take jobs.'
      : 'Verify your identity to start accepting errands.'

  return (
    <Link
      to={`${base}/verification`}
      data-testid="identity-banner"
      className="flex items-center justify-between gap-3 p-4 mb-6 rounded-xl border border-yellow-300 bg-yellow-50 hover:bg-yellow-100 transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-10 h-10 rounded-full bg-yellow-200 text-yellow-800 flex items-center justify-center flex-shrink-0">
          <FaIdCard />
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-text">{latest === 'in_review' ? 'ID check under review' : 'Verify your identity'}</p>
          <p className="text-sm text-text-light">{text}</p>
        </div>
      </div>
      {latest !== 'in_review' && (
        <span className="text-sm font-medium text-primary flex items-center gap-1 whitespace-nowrap">
          {status.country === 'NG' ? 'Verify NIN' : 'Verify ID'} <FaArrowRight className="text-xs" />
        </span>
      )}
    </Link>
  )
}
