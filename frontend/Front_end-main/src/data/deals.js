// src/data/deals.js
export function getDiscount(price, original) {
  if (!original || original <= price) return 0
  return Math.round((1 - price / original) * 100)
}
