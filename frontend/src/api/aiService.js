import api from './axios'

// Generate a pattern from a project photo using Claude AI
// Why might this take time? Claude is analyzing the image —
// can take 5-15 seconds, so we show a loading state in the UI
export const generatePattern = async (projectId) => {
  const response = await api.post('/ai/generate-pattern/', {
    project_id: projectId
  })
  return response.data
}

// Generate colour palette suggestions for a pattern
export const generateColourSuggestions = async (patternId, mood = null) => {
  const response = await api.post('/ai/colour-suggestions/', {
    pattern_id: patternId,
    mood
  })
  return response.data
}

// Detect stitches in a project photo
export const detectStitches = async (projectId) => {
  const response = await api.post('/ai/detect-stitches/', {
    project_id: projectId
  })
  return response.data
}

// Check Claude AI is connected and healthy
export const checkAIHealth = async () => {
  const response = await api.get('/ai/health/')
  return response.data
}