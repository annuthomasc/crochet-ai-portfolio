import api from './axios'

export const getProjects = async (params = {}) => {
  const response = await api.get('/projects/', { params })
  return response.data
}

export const getProject = async (id) => {
  const response = await api.get(`/projects/${id}/`)
  return response.data
}

export const createProject = async (projectData) => {
  const formData = new FormData()
  Object.keys(projectData).forEach(key => {
    if (projectData[key] !== null && projectData[key] !== undefined) {
      if (key === 'yarn_colors') {
        formData.append(key, JSON.stringify(projectData[key]))
      } else {
        formData.append(key, projectData[key])
      }
    }
  })
  const response = await api.post('/projects/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const getMyProjects = async () => {
  const response = await api.get('/projects/my_projects/')
  return response.data
}

export const getProjectsByCategory = async (category) => {
  const response = await api.get(`/projects/by_category/?category=${category}`)
  return response.data
}

export const deleteProject = async (id) => {
  await api.delete(`/projects/${id}/`)
}