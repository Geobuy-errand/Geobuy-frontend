import React from 'react'
import { Link } from 'react-router-dom'
import { FaArrowRight } from 'react-icons/fa'

/** A stat tile that opens the matching section. */
export function StatLink({ to, label, value, hint, icon: Icon, tone = 'primary', testId }) {
  const tones = {
    primary: 'text-primary bg-primary/10',
    blue: 'text-blue-600 bg-blue-100',
    yellow: 'text-yellow-700 bg-yellow-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    red: 'text-red-600 bg-red-100',
  }
  const cls = 'card block w-full text-left hover:shadow-medium hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-primary/40'
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm text-text-light truncate">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${tones[tone].split(' ')[0]}`}>{value}</p>
          {hint && <p className="text-xs text-text-lighter mt-1 truncate">{hint}</p>}
        </div>
        {Icon && (
          <span className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${tones[tone]}`}>
            <Icon />
          </span>
        )}
      </div>
    </>
  )
  // "#section" scrolls to a list on the same page
  if (to?.startsWith('#')) {
    return (
      <button type="button" data-testid={testId} className={cls} onClick={() => document.getElementById(to.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
        {body}
      </button>
    )
  }
  return (
    <Link to={to} data-testid={testId} className={cls}>
      {body}
    </Link>
  )
}

const actionTone = {
  primary: 'bg-primary text-white',
  warning: 'bg-yellow-100 text-yellow-800',
  muted: 'bg-gray-100 text-text-light',
}

/**
 * A list of jobs; each row is one link to the page where the job continues.
 * items: [{ key, to, title, subtitle, amount, status, action: {label, tone} }]
 */
export function JobList({ title, items, empty, viewAllTo, testId, id }) {
  return (
    <div className="card" id={id} data-testid={testId}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text">{title}</h3>
        {viewAllTo && items.length > 0 && (
          <Link to={viewAllTo} className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <FaArrowRight className="text-xs" />
          </Link>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-text-light py-4 text-center">{empty}</p>
      ) : (
        <div className="space-y-2">
          {items.map((it) => (
            <Link
              key={it.key}
              to={it.to}
              data-testid="job-row"
              className="flex items-center justify-between gap-3 p-3 md:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors"
            >
              <div className="min-w-0">
                <p className="font-medium text-text truncate">{it.title}</p>
                {it.subtitle && <p className="text-xs md:text-sm text-text-light truncate">{it.subtitle}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {it.amount && <span className="text-sm font-semibold text-text hidden sm:inline">{it.amount}</span>}
                {it.action ? (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${actionTone[it.action.tone] || actionTone.muted}`}>
                    {it.action.label}
                  </span>
                ) : it.status ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-text-light whitespace-nowrap capitalize">{it.status}</span>
                ) : null}
                <FaArrowRight className="text-text-lighter text-xs" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
