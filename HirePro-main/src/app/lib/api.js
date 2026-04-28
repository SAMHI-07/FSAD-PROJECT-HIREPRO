const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '/api' : 'http://127.0.0.1:5000/api');
const AUTH_STORAGE_KEY = 'hirepro-auth';

function getAuthHeaders() {
  try {
    const savedAuth = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!savedAuth) {
      return {};
    }

    const parsed = JSON.parse(savedAuth);
    if (!parsed?.token) {
      return {};
    }

    return {
      Authorization: `Bearer ${parsed.token}`,
    };
  } catch (error) {
    return {};
  }
}

async function request(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...(options.headers || {}),
      },
      ...options,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || 'Request failed.');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Unable to reach the server right now. Please try again.');
  }
}

export function loginUser(payload) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function registerUser(payload) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchProfessionals(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      searchParams.set(key, value);
    }
  });

  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : '';
  return request(`/professionals${suffix}`);
}

export function fetchProfessionalById(id) {
  return request(`/professionals/${id}`);
}

export function fetchUsers() {
  return request('/users');
}

export function fetchUserById(id) {
  return request(`/users/${id}`);
}

export function createUser(payload) {
  return request('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateUser(id, payload) {
  return request(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteUser(id) {
  return request(`/users/${id}`, {
    method: 'DELETE',
  });
}

export function createProfessional(payload) {
  return request('/professionals', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateProfessional(id, payload) {
  return request(`/professionals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteProfessional(id) {
  return request(`/professionals/${id}`, {
    method: 'DELETE',
  });
}
