// ==========================================
//  API Helper - Centralized HTTP client
// ==========================================

const BASE_URL = "https://spotify-clone-c6b2.onrender.com";

function getToken() {
    return localStorage.getItem("spotify_token");
}

function getUser() {
    const u = localStorage.getItem("spotify_user");
    return u ? JSON.parse(u) : null;
}

function saveAuth(token, user) {
    localStorage.setItem("spotify_token", token);
    localStorage.setItem("spotify_user", JSON.stringify(user));
}

function clearAuth() {
    localStorage.removeItem("spotify_token");
    localStorage.removeItem("spotify_user");
}

async function apiRequest(method, path, body = null, isFormData = false) {
    const headers = {};
    const token = getToken();
    if (token) headers["Authorization"] = token;
    if (!isFormData && body) headers["Content-Type"] = "application/json";

    const opts = { method, headers };
    if (body) opts.body = isFormData ? body : JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${path}`, opts);
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
}

// ==========================================
//  Auth API
// ==========================================
const AuthAPI = {
    register: (name, email, password) =>
        apiRequest("POST", "/register", { name, email, password }),
    login: (email, password) =>
        apiRequest("POST", "/login", { email, password }),
};

// ==========================================
//  Song API
// ==========================================
const SongAPI = {
    getAll: (page = 1, limit = 12, filters = {}) => {
        const params = new URLSearchParams({ page, limit, ...filters });
        return apiRequest("GET", `/songs?${params}`);
    },
    search: (q) => apiRequest("GET", `/songs/search?q=${encodeURIComponent(q)}`),
    getById: (id) => apiRequest("GET", `/songs/${id}`),
    create: (data) => apiRequest("POST", "/songs", data),
    update: (id, data) => apiRequest("PUT", `/songs/${id}`, data),
    delete: (id) => apiRequest("DELETE", `/songs/${id}`),
    uploadCover: (id, formData) =>
        apiRequest("POST", `/songs/${id}/upload-cover`, formData, true),
};

// ==========================================
//  Playlist API
// ==========================================
const PlaylistAPI = {
    getAll: () => apiRequest("GET", "/playlists"),
    getById: (id) => apiRequest("GET", `/playlists/${id}`),
    create: (name) => apiRequest("POST", "/playlists", { name }),
    addSong: (playlistId, songId) =>
        apiRequest("POST", `/playlists/${playlistId}/add-song/${songId}`),
    removeSong: (playlistId, songId) =>
        apiRequest("DELETE", `/playlists/${playlistId}/remove-song/${songId}`),
};

// ==========================================
//  User API
// ==========================================
const UserAPI = {
    getProfile: () => apiRequest("GET", "/profile"),
    updateProfile: (data) => apiRequest("PUT", "/profile", data),
    addFavorite: (songId) => apiRequest("POST", `/favorites/${songId}`),
    getFavorites: () => apiRequest("GET", "/favorites"),
    getRecentlyPlayed: () => apiRequest("GET", "/recently-played"),
};
