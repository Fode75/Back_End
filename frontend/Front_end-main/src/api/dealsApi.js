// src/api/dealsApi.js
export function normalizeDeal(deal) {
  const originalPrice = deal.originalPrice ?? deal.original_price ?? null
  return {
    ...deal,
    originalPrice,
    price: Number(deal.price),
    score: Number(deal.score) || 0,
    url: deal.url || '#',
    emoji: deal.emoji || '🏷️',
    category: deal.category || 'Autre',
    brand: deal.brand || '',
  }
}

export async function fetchDeals(apiUrl, { category, token } = {}) {
  if (!apiUrl) return []
  const params = category && category !== 'Tous' ? `?category=${encodeURIComponent(category)}` : ''
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${apiUrl}/api/deals${params}`, { headers })
  if (!res.ok) throw new Error(`API ${res.status}`)
  const data = await res.json()
  return data.map(normalizeDeal)
}

export function getCategoriesFromDeals(deals) {
  const cats = [...new Set(deals.map(d => d.category).filter(Boolean))].sort()
  return ['Tous', ...cats]
}
