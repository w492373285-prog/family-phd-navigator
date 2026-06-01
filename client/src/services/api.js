const API_BASE = import.meta.env.VITE_API_BASE || '/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `请求失败：${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return response.json();
  return response.blob();
}

export const api = {
  getCountries: () => request('/countries'),
  saveCountry: country => request(`/countries/${country.id || ''}`, {
    method: country.id ? 'PUT' : 'POST',
    body: JSON.stringify(country)
  }),
  deleteCountry: id => request(`/countries/${id}`, { method: 'DELETE' }),
  getSchools: () => request('/schools'),
  saveSchool: school => request(`/schools/${school.id || ''}`, {
    method: school.id ? 'PUT' : 'POST',
    body: JSON.stringify(school)
  }),
  getMentors: () => request('/mentors'),
  saveMentor: mentor => request(`/mentors/${mentor.id || ''}`, {
    method: mentor.id ? 'PUT' : 'POST',
    body: JSON.stringify(mentor)
  }),
  getBudgets: () => request('/budgets'),
  saveBudget: budget => request(`/budgets/${budget.id || ''}`, {
    method: budget.id ? 'PUT' : 'POST',
    body: JSON.stringify(budget)
  }),
  getMaterials: () => request('/materials'),
  saveMaterial: material => request(`/materials/${material.id || ''}`, {
    method: material.id ? 'PUT' : 'POST',
    body: JSON.stringify(material)
  }),
  getStages: () => request('/stages'),
  saveStage: stage => request(`/stages/${stage.id || ''}`, {
    method: stage.id ? 'PUT' : 'POST',
    body: JSON.stringify(stage)
  }),
  generatePlan: payload => request('/plan', { method: 'POST', body: JSON.stringify(payload) }),
  downloadPdf: async payload => {
    const blob = await request('/report/pdf', { method: 'POST', body: JSON.stringify(payload) });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'family-phd-plan-report.pdf';
    link.click();
    URL.revokeObjectURL(url);
  }
};
