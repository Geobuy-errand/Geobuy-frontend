// ============================================================
// Supported countries (mirror of backend config/countries.js)
// ============================================================

export const COUNTRIES = {
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    shortName: 'UK',
    flag: '🇬🇧',
    currency: 'GBP',
    currencySymbol: '£',
    locale: 'en-GB',
    distanceUnit: 'mi',
    distanceUnitLabel: 'miles',
    paymentGateway: 'stripe',
    paymentGatewayLabel: 'Stripe (card)',
    phonePrefix: '+44',
    phonePlaceholder: '07700 900123',
    postcodeLabel: 'Postcode',
    postcodeRequired: true,
    postcodePlaceholder: 'SW1A 1AA',
    regionLabel: 'County / Region',
    regionRequired: false,
    geocodeCountryCode: 'gb',
    defaultCenter: { lat: 51.5074, lng: -0.1278 },
    bounds: { minLat: 49.8, maxLat: 60.95, minLng: -8.7, maxLng: 1.8 },
    roadFactor: 1.25,
    fallbackSpeedKmh: 30,
    radiusOptions: [1, 3, 5, 10, 25, 50],
    supportEmail: 'support@geobuy.com',
    supportPhone: '+44 20 1234 5678',
    bank: { accountLength: 8, needsSortCode: true },
  },
  NG: {
    code: 'NG',
    name: 'Nigeria',
    shortName: 'Nigeria',
    flag: '🇳🇬',
    currency: 'NGN',
    currencySymbol: '₦',
    locale: 'en-NG',
    distanceUnit: 'km',
    distanceUnitLabel: 'km',
    paymentGateway: 'paystack',
    paymentGatewayLabel: 'Paystack (card, transfer, USSD)',
    phonePrefix: '+234',
    phonePlaceholder: '0803 123 4567',
    postcodeLabel: 'Postal code (optional)',
    postcodeRequired: false,
    postcodePlaceholder: '100001',
    regionLabel: 'State',
    regionRequired: true,
    geocodeCountryCode: 'ng',
    defaultCenter: { lat: 6.5244, lng: 3.3792 },
    bounds: { minLat: 4.0, maxLat: 14.0, minLng: 2.6, maxLng: 14.8 },
    roadFactor: 1.35,
    fallbackSpeedKmh: 20,
    radiusOptions: [2, 5, 10, 15, 25, 50],
    supportEmail: 'support.ng@geobuy.com',
    supportPhone: '+234 800 000 0000',
    bank: { accountLength: 10, needsSortCode: false },
  },
}

export const DEFAULT_COUNTRY = 'GB'
export const COUNTRY_LIST = Object.values(COUNTRIES)

export const normalizeCountry = (value) => {
  const v = String(value || '').trim().toUpperCase()
  if (COUNTRIES[v]) return v
  if (v === 'UK' || v === 'UNITED KINGDOM') return 'GB'
  if (v === 'NIGERIA') return 'NG'
  return DEFAULT_COUNTRY
}

export const getCountry = (code) => COUNTRIES[normalizeCountry(code)]

export const getCountryByCurrency = (currency) =>
  COUNTRY_LIST.find((c) => c.currency === String(currency || '').toUpperCase()) || COUNTRIES[DEFAULT_COUNTRY]

export const isWithinCountry = (lat, lng, code) => {
  const b = getCountry(code).bounds
  return lat >= b.minLat && lat <= b.maxLat && lng >= b.minLng && lng <= b.maxLng
}

// Phone patterns (same rules as the backend)
export const PHONE_PATTERNS = {
  GB: /^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|\+)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:[\d]{5}\)?[\s-]?[\d]{4,5})|(?:[\d]{4}\)?[\s-]?(?:[\d]{5}|[\d]{3}[\s-]?[\d]{3}))|(?:[\d]{3}\)?[\s-]?[\d]{3}[\s-]?[\d]{3,4})|(?:[\d]{2}\)?[\s-]?[\d]{4}[\s-]?[\d]{4}))(?:[\s-]?(?:x|ext\.?|#)\d{3,4})?$/,
  NG: /^(?:\+?234[\s-]?|0)[789][01]\d[\s-]?\d{3}[\s-]?\d{4}$/,
}

export const POSTCODE_PATTERNS = {
  GB: /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i,
  NG: /^\d{6}$/,
}

// Verification documents per country
export const VERIFICATION_DOCUMENTS = {
  GB: [
    { id: 'passport', name: 'Passport or Photo ID', description: 'Valid passport or UK photocard driving licence', required: true },
    { id: 'proofOfAddress', name: 'Proof of Address', description: 'Utility bill or bank statement from the last 3 months', required: true },
    { id: 'rightToWork', name: 'Right to Work', description: 'Share code or document proving your right to work in the UK', required: true },
  ],
  NG: [
    { id: 'ninSlip', name: 'NIN Slip / National ID', description: 'NIN slip, National ID card or international passport', required: true },
    { id: 'utilityBill', name: 'Utility Bill (Proof of Address)', description: 'PHCN/electricity, water or waste bill from the last 3 months', required: true },
  ],
}

export const OPTIONAL_DOCUMENTS = {
  GB: [
    { id: 'drivingLicence', name: 'Driving Licence', description: 'Required if you drive for errands' },
    { id: 'vehicleInsurance', name: 'Vehicle Insurance', description: 'Required if you use a vehicle' },
  ],
  NG: [
    { id: 'drivingLicence', name: "Driver's Licence (FRSC)", description: 'Required if you drive or ride for errands' },
    { id: 'vehicleRegistration', name: 'Vehicle Papers', description: 'Vehicle licence / proof of ownership for your car, bike or keke' },
  ],
}

// "DBS" is a UK-only check. Nigerian users see "Background checked".
export const backgroundCheckLabel = (code) => (normalizeCountry(code) === 'NG' ? 'Background Checked' : 'DBS Checked')
