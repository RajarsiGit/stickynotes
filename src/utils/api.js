const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

async function apiFetch(endpoint, options = {}) {
  const config = {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const authApi = {
  register: (name, email, password) =>
    apiFetch("/auth", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email, password) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () => apiFetch("/auth/logout", { method: "POST" }),

  getCurrentUser: () => apiFetch("/auth/me"),
};

export const notesApi = {
  getAll: () => apiFetch("/notes"),

  create: (data) =>
    apiFetch("/notes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id, updates) =>
    apiFetch("/notes", {
      method: "PUT",
      body: JSON.stringify({ id, ...updates }),
    }),

  delete: (id) => apiFetch(`/notes?id=${id}`, { method: "DELETE" }),
};
