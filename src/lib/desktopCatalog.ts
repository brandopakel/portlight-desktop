import type { Game } from './catalog'
export const CATALOG_KEY = 'portlight:windows-catalog:v2'
const strings = (v: unknown): v is string[] => Array.isArray(v) && v.every(x => typeof x === 'string')
export function validateCatalog(input: unknown): Game[] {
  if (!Array.isArray(input) || input.length === 0 || input.length > 10000) throw new Error('Choose a catalog with 1–10,000 games.')
  const ids = new Set<string>(), slugs = new Set<string>()
  return input.map((g, i) => {
    if (!g || typeof g !== 'object') throw new Error(`Entry ${i + 1} is invalid.`)
    if(g.platform!==undefined&&typeof g.platform!=='string')throw new Error(`Entry ${i+1}: platform must be text.`)
    for (const key of ['id', 'slug', 'title', 'shortDescription', 'about', 'developer', 'publisher', 'releaseDate']) {
      if (typeof g[key] !== 'string') throw new Error(`Entry ${i + 1}: ${key} must be text.`)
    }
    if (!/^[a-zA-Z0-9_-]{1,80}$/.test(g.id) || ['__proto__','constructor','prototype'].includes(g.id) || !g.title || !/^[a-zA-Z0-9_-]+$/.test(g.slug) || ids.has(g.id) || slugs.has(g.slug)) throw new Error(`Entry ${i + 1}: use unique IDs and URL-safe slugs.`)
    ids.add(g.id); slugs.add(g.slug)
    for (const key of ['genres', 'features', 'screenshots']) if (!strings(g[key])) throw new Error(`Entry ${i + 1}: ${key} must be a list of text.`)
    for (const key of ['metacritic','ageRating','sizeGb']) if (g[key] !== null && (typeof g[key] !== 'number' || !Number.isFinite(g[key]) || g[key] < 0)) throw new Error(`Entry ${i + 1}: invalid ${key}.`)
    if (typeof g.recommendations !== 'number' || !Number.isFinite(g.recommendations) || g.recommendations < 0) throw new Error(`Entry ${i + 1}: invalid recommendations.`)
    const safeImage = (v: unknown) => typeof v === 'string' && (v === '' || /^https:\/\//.test(v) || /^\.\/(?:demo|artwork)\/[a-zA-Z0-9_-]+\.svg$/.test(v))
    if (!g.images || !['cover','hero','header','logo'].every(k => safeImage(g.images[k])) || !g.screenshots.every(safeImage)) throw new Error(`Entry ${i + 1}: artwork must use HTTPS URLs or bundled demo images.`)
    return g as Game
  })
}
export function readCatalog(fallback: Game[]): Game[] {
  try { const saved = localStorage.getItem(CATALOG_KEY); return saved ? validateCatalog(JSON.parse(saved)) : fallback } catch { return fallback }
}
