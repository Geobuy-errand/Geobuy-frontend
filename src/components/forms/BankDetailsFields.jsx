import React, { useEffect, useState } from 'react'
import { FaUniversity } from 'react-icons/fa'
import http from '../../services/http'

/** Load the Nigerian bank list (Paystack) once per session. */
let bankCache = null
export function useNigerianBanks(enabled = true) {
  const [banks, setBanks] = useState(bankCache || [])
  const [error, setError] = useState('')
  useEffect(() => {
    if (!enabled || bankCache) return
    http
      .get('/wallet/banks?country=NG')
      .then((r) => {
        bankCache = r.data || []
        setBanks(bankCache)
      })
      .catch(() => setError('Could not load banks — you can add your bank later from your wallet.'))
  }, [enabled])
  return { banks, error }
}

/**
 * Bank inputs for payouts.
 *   UK:      Bank name, sort code, 8-digit account number
 *   Nigeria: Bank (from Paystack list), 10-digit NUBAN account number
 *
 * Works with the forms' existing handleChange via `name="bankDetails.<field>"`.
 * `setBankDetails(partial)` is used for the Nigerian bank dropdown (sets name + code).
 */
const BankDetailsFields = ({ country = 'GB', bankDetails = {}, onChange, setBankDetails, required = true }) => {
  const isNG = country === 'NG'
  const { banks, error } = useNigerianBanks(isNG)

  if (isNG) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-light mb-1">Bank{required ? ' *' : ''}</label>
          <div className="relative">
            <FaUniversity className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
            <select
              value={bankDetails.bankCode || ''}
              onChange={(e) => {
                const bank = banks.find((b) => b.code === e.target.value)
                setBankDetails?.({ bankCode: e.target.value, bankName: bank?.name || '' })
              }}
              className="input-field pl-10"
              required={required}
            >
              <option value="">{banks.length ? 'Select your bank...' : 'Loading banks...'}</option>
              {banks.map((b) => (
                <option key={`${b.code}-${b.name}`} value={b.code}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-xs text-amber-600 mt-1">{error}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-text-light mb-1">Account Number (NUBAN){required ? ' *' : ''}</label>
          <input
            type="text"
            name="bankDetails.accountNumber"
            value={bankDetails.accountNumber || ''}
            onChange={onChange}
            className="input-field"
            placeholder="0123456789"
            inputMode="numeric"
            maxLength={10}
            pattern="\d{10}"
            title="10-digit account number"
            required={required}
          />
          <p className="text-xs text-text-lighter mt-1">We verify the account name with your bank before paying out.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-text-light mb-1">Bank Name{required ? ' *' : ''}</label>
        <div className="relative">
          <FaUniversity className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
          <input
            type="text"
            name="bankDetails.bankName"
            value={bankDetails.bankName || ''}
            onChange={onChange}
            className="input-field pl-10"
            placeholder="e.g. Barclays"
            required={required}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-light mb-1">Sort Code{required ? ' *' : ''}</label>
        <input
          type="text"
          name="bankDetails.sortCode"
          value={bankDetails.sortCode || ''}
          onChange={onChange}
          className="input-field"
          placeholder="12-34-56"
          required={required}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-light mb-1">Account Number{required ? ' *' : ''}</label>
        <input
          type="text"
          name="bankDetails.accountNumber"
          value={bankDetails.accountNumber || ''}
          onChange={onChange}
          className="input-field"
          placeholder="12345678"
          inputMode="numeric"
          maxLength={8}
          required={required}
        />
      </div>
    </div>
  )
}

export default BankDetailsFields
