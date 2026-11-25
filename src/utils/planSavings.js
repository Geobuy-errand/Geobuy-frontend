// Savings of a plan compared with paying monthly, worked out from the plan
// prices set in Admin → Subscription Plans (no hard-coded percentages).

const monthsIn = (plan) => {
  if (plan?.metadata?.billingPeriod === '6_months' || /6 ?month/i.test(plan?.name || '')) return 6
  if (plan?.interval === 'year') return 12
  if (plan?.interval === 'month') return 1
  return null
}
const priceOf = (plan) => Number(plan?.localPrice ?? plan?.price)

/** e.g. "38%" or null. An admin-entered metadata.savings label wins. */
export function planSavings(plans = [], plan) {
  if (plan?.metadata?.savings) return plan.metadata.savings
  const monthly = plans.find((p) => monthsIn(p) === 1 && priceOf(p) > 0)
  const months = monthsIn(plan)
  if (!monthly || !months || months <= 1 || !(priceOf(plan) > 0)) return null
  const pct = Math.round((1 - priceOf(plan) / months / priceOf(monthly)) * 100)
  return pct > 0 ? `${pct}%` : null
}

/** Best saving across all plans, e.g. "38%" (null if none). */
export function bestSavings(plans = []) {
  let best = 0
  for (const p of plans) {
    const s = parseInt(planSavings(plans, p), 10)
    if (s > best) best = s
  }
  return best > 0 ? `${best}%` : null
}
