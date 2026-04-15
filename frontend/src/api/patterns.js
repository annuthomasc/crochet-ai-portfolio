import api from './axios'

// Fetch all published patterns
export const getPatterns = async (params = {}) => {
  const response = await api.get('/patterns/', { params })
  return response.data
}

// Fetch a single pattern (also increments view count)
export const getPattern = async (id) => {
  const response = await api.get(`/patterns/${id}/`)
  return response.data
}

// Fetch colour palettes for a pattern
export const getColourPalettes = async (patternId) => {
  const response = await api.get(`/patterns/${patternId}/colour_palettes/`)
  return response.data
}

// Track when user downloads a pattern
export const incrementDownload = async (patternId) => {
  const response = await api.post(`/patterns/${patternId}/increment_download/`)
  return response.data
}

// Filter by difficulty
export const getPatternsByDifficulty = async (difficulty) => {
  const response = await api.get(`/patterns/by_difficulty/?difficulty=${difficulty}`)
  return response.data
}

// Fetch only the logged-in user's patterns
export const getMyPatterns = async () => {
  const response = await api.get('/patterns/my_patterns/')
  return response.data
}