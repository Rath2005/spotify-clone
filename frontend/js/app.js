// ==========================================
//  Spotify Clone - Main Application Logic
// ==========================================

// ===== AUTH CHECK =====
(function checkAuth() {
    const token = localStorage.getItem("spotify_token");
    if (!token) {
        window.location.href = "index.html";
        return;
    }
})();

// ===== STATE =====
let allPlaylists = [];
let allSongs = [];
let currentPage = 1;
let totalPages = 1;
let currentView = "home";
let selectedSongId = null;
let favoriteSongIds = [];
let searchDebounceTimer = null;

// ===== INITIALIZATION =====
document.addEventListener("DOMContentLoaded", () => {
    initUser();
    setGreeting();
    loadHome();
    loadSidebarPlaylists();
    loadFavoriteIds();
});

// ===== USER INIT =====
function initUser() {
    const user = getUser();
    if (user) {
        const initial = user.name ? user.name.charAt(0).toUpperCase() : "U";
        const nameDisplay = document.getElementById("user-name-display");
        const userAvatar = document.getElementById("user-avatar");
        const topbarUsername = document.getElementById("topbar-username");

        if (nameDisplay) nameDisplay.textContent = user.name;
        if (userAvatar) userAvatar.textContent = initial;
        if (topbarUsername) topbarUsername.textContent = user.name;
    }
}

function setGreeting() {
    const hour = new Date().getHours();
    let greeting = "Good evening";
    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";
    const el = document.getElementById("greeting-text");
    if (el) el.textContent = greeting;
}

function logout() {
    clearAuth();
    window.location.href = "index.html";
}

// ===== NAVIGATION =====
function navigateTo(view) {
    currentView = view;
    document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
    const target = document.getElementById(`view-${view}`);
    if (target) target.classList.remove("hidden");

    // Update nav active state
    document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
    const navLink = document.getElementById(`nav-${view}`);
    if (navLink) navLink.classList.add("active");

    // Show/hide search bar in topbar
    const searchWrapper = document.getElementById("topbar-search-wrapper");
    if (searchWrapper) {
        searchWrapper.style.display = view === "search" ? "flex" : "none";
    }

    // Load view-specific data
    if (view === "home") loadHome();
    else if (view === "search") document.getElementById("search-input")?.focus();
    else if (view === "library") loadLibrary("playlists");
    else if (view === "profile") loadProfile();
}

// ===== LOAD FAVORITES IDS =====
async function loadFavoriteIds() {
    try {
        const favs = await UserAPI.getFavorites();
        favoriteSongIds = favs.map(s => s._id);
        updateLikeButton();
    } catch (e) {
        favoriteSongIds = [];
    }
}

function updateLikeButton() {
    const likeBtn = document.getElementById("like-btn");
    const currentSong = Player.getCurrentSong();
    if (likeBtn && currentSong) {
        likeBtn.classList.toggle("liked", favoriteSongIds.includes(currentSong._id));
    }
}

async function toggleLike() {
    const currentSong = Player.getCurrentSong();
    if (!currentSong) return;
    try {
        await UserAPI.addFavorite(currentSong._id);
        if (!favoriteSongIds.includes(currentSong._id)) {
            favoriteSongIds.push(currentSong._id);
        }
        updateLikeButton();
    } catch (e) {
        console.error("Failed to toggle like", e);
    }
}

// ===== HOME VIEW =====
async function loadHome() {
    await Promise.all([
        loadHomeSongs(),
        loadRecentlyPlayed(),
        loadHomePlaylists()
    ]);
}

async function loadHomeSongs() {
    try {
        const data = await SongAPI.getAll(currentPage, 12);
        allSongs = data.songs || [];
        totalPages = data.totalPages || 1;
        renderSongsGrid("home-songs-grid", allSongs, allSongs);
        renderPagination();
    } catch (e) {
        console.error("Failed to load songs", e);
    }
}

async function loadRecentlyPlayed() {
    const grid = document.getElementById("recently-played-grid");
    if (!grid) return;
    try {
        const songs = await UserAPI.getRecentlyPlayed();
        if (!songs || songs.length === 0) {
            grid.innerHTML = "";
            return;
        }
        grid.innerHTML = songs.slice(0, 6).map(song => `
            <div class="quick-card" onclick="playSongFromCard('${song._id}')">
                <div class="quick-card-art">
                    ${song.coverImage
                        ? `<img src="${song.coverImage}" alt="${song.title}">`
                        : `<svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M9 19V6l12-3v13M9 19c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zm12-3c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zM9 10l12-3"/></svg>`
                    }
                </div>
                <span class="quick-card-name">${escapeHtml(song.title)}</span>
                <button class="quick-card-play" onclick="event.stopPropagation(); playSongFromCard('${song._id}')">
                    <svg viewBox="0 0 24 24" width="16" height="16"><path d="M8 5v14l11-7z" fill="black"/></svg>
                </button>
            </div>
        `).join("");
    } catch (e) {
        grid.innerHTML = "";
    }
}

async function loadHomePlaylists() {
    const grid = document.getElementById("home-playlists-grid");
    if (!grid) return;
    try {
        allPlaylists = await PlaylistAPI.getAll();
        if (!allPlaylists || allPlaylists.length === 0) {
            grid.innerHTML = '<p style="color:var(--text-subdued); font-size:14px;">No playlists yet. Create one!</p>';
            return;
        }
        grid.innerHTML = allPlaylists.map(pl => `
            <div class="playlist-card" onclick="openPlaylistDetail('${pl._id}')">
                <div class="playlist-card-art">
                    <svg viewBox="0 0 24 24" width="48" height="48" fill="#b3b3b3"><path d="M9 19V6l12-3v13M9 19c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zm12-3c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zM9 10l12-3"/></svg>
                </div>
                <div class="playlist-card-name">${escapeHtml(pl.name)}</div>
                <div class="playlist-card-meta">${pl.songs ? pl.songs.length : 0} songs</div>
            </div>
        `).join("");
    } catch (e) {
        grid.innerHTML = "";
    }
}

// ===== SONGS GRID RENDERER =====
function renderSongsGrid(containerId, songs, queueSongs) {
    const grid = document.getElementById(containerId);
    if (!grid) return;
    if (!songs || songs.length === 0) {
        grid.innerHTML = '<p style="color:var(--text-subdued); font-size:14px;">No songs found.</p>';
        return;
    }
    grid.innerHTML = songs.map((song, idx) => `
        <div class="song-card" onclick="playSongDirect(${idx}, '${containerId}')">
            <button class="song-card-more" onclick="event.stopPropagation(); openSongActionModal('${song._id}', '${escapeAttr(song.title)}')" title="More options">⋯</button>
            <div class="song-card-art">
                ${song.coverImage
                    ? `<img src="${song.coverImage}" alt="${escapeAttr(song.title)}">`
                    : `<div class="song-art-placeholder"><svg viewBox="0 0 24 24" width="48" height="48" fill="#535353"><path d="M9 19V6l12-3v13M9 19c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zm12-3c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zM9 10l12-3"/></svg></div>`
                }
                <div class="song-card-play-overlay">
                    <button class="card-play-btn" onclick="event.stopPropagation(); playSongDirect(${idx}, '${containerId}')">
                        <svg viewBox="0 0 24 24" width="20" height="20"><path d="M8 5v14l11-7z" fill="black"/></svg>
                    </button>
                </div>
            </div>
            <div class="song-card-title">${escapeHtml(song.title)}</div>
            <div class="song-card-artist">${escapeHtml(song.artist)}</div>
        </div>
    `).join("");

    // Store the songs data on the grid for later retrieval
    grid._songsData = songs;
}

function playSongDirect(index, containerId) {
    const grid = document.getElementById(containerId);
    if (!grid || !grid._songsData) return;
    const songs = grid._songsData;
    Player.playSong(songs[index], songs);
    updateLikeButton();
}

async function playSongFromCard(songId) {
    try {
        const song = await SongAPI.getById(songId);
        Player.playSong(song, [song]);
        updateLikeButton();
    } catch (e) {
        console.error("Failed to play song", e);
    }
}

// ===== PAGINATION =====
function renderPagination() {
    const prevBtn = document.getElementById("prev-page-btn");
    const nextBtn = document.getElementById("next-page-btn");
    const pageInfo = document.getElementById("page-info");

    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
    if (pageInfo) pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

function changePage(delta) {
    const newPage = currentPage + delta;
    if (newPage < 1 || newPage > totalPages) return;
    currentPage = newPage;
    loadHomeSongs();
    // Scroll to top
    document.getElementById("main-content")?.scrollTo({ top: 0, behavior: "smooth" });
}

// ===== SEARCH =====
function handleSearch(query) {
    clearTimeout(searchDebounceTimer);
    const label = document.getElementById("search-results-label");
    const grid = document.getElementById("search-songs-grid");
    const empty = document.getElementById("search-empty");

    if (!query || query.trim().length === 0) {
        if (label) label.textContent = "";
        if (grid) grid.innerHTML = "";
        if (empty) empty.classList.remove("hidden");
        return;
    }

    searchDebounceTimer = setTimeout(async () => {
        try {
            if (empty) empty.classList.add("hidden");
            if (label) label.textContent = `Results for "${query}"`;
            const songs = await SongAPI.search(query);
            renderSongsGrid("search-songs-grid", songs, songs);
            if (songs.length === 0) {
                if (empty) {
                    empty.classList.remove("hidden");
                    empty.querySelector("p").textContent = `No results for "${query}"`;
                }
            }
        } catch (e) {
            console.error("Search failed", e);
        }
    }, 350);
}

// ===== LIBRARY =====
async function loadLibrary(tab) {
    const content = document.getElementById("library-content");
    if (!content) return;

    if (tab === "playlists") {
        try {
            const playlists = await PlaylistAPI.getAll();
            allPlaylists = playlists;
            if (!playlists || playlists.length === 0) {
                content.innerHTML = `
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="#535353" stroke-width="1.5"><path d="M9 19V6l12-3v13M9 19c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zm12-3c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zM9 10l12-3"/></svg>
                        <p>Create your first playlist</p>
                    </div>`;
                return;
            }
            content.innerHTML = `<div class="playlists-grid">${playlists.map(pl => `
                <div class="playlist-card" onclick="openPlaylistDetail('${pl._id}')">
                    <div class="playlist-card-art">
                        <svg viewBox="0 0 24 24" width="48" height="48" fill="#b3b3b3"><path d="M9 19V6l12-3v13M9 19c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zm12-3c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zM9 10l12-3"/></svg>
                    </div>
                    <div class="playlist-card-name">${escapeHtml(pl.name)}</div>
                    <div class="playlist-card-meta">${pl.songs ? pl.songs.length : 0} songs</div>
                </div>
            `).join("")}</div>`;
        } catch (e) {
            content.innerHTML = '<p style="color:var(--text-subdued)">Failed to load playlists.</p>';
        }
    } else if (tab === "favorites") {
        try {
            const favs = await UserAPI.getFavorites();
            if (!favs || favs.length === 0) {
                content.innerHTML = `
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="#535353" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                        <p>Songs you like will appear here</p>
                    </div>`;
                return;
            }
            content.innerHTML = '<div class="songs-grid" id="library-favs-grid"></div>';
            renderSongsGrid("library-favs-grid", favs, favs);
        } catch (e) {
            content.innerHTML = '<p style="color:var(--text-subdued)">Failed to load favorites.</p>';
        }
    }
}

function filterLibrary(tab, btn) {
    document.querySelectorAll(".lib-tab").forEach(t => t.classList.remove("active"));
    if (btn) btn.classList.add("active");
    loadLibrary(tab);
}

// ===== SIDEBAR PLAYLISTS =====
async function loadSidebarPlaylists() {
    const list = document.getElementById("sidebar-playlist-list");
    if (!list) return;
    try {
        allPlaylists = await PlaylistAPI.getAll();
        if (!allPlaylists || allPlaylists.length === 0) {
            list.innerHTML = '<li class="playlist-item-loading">No playlists yet</li>';
            return;
        }
        list.innerHTML = allPlaylists.map(pl => `
            <li class="playlist-list-item" onclick="openPlaylistDetail('${pl._id}')">${escapeHtml(pl.name)}</li>
        `).join("");
    } catch (e) {
        list.innerHTML = '<li class="playlist-item-loading">Failed to load</li>';
    }
}

// ===== PLAYLIST DETAIL =====
async function openPlaylistDetail(playlistId) {
    navigateTo("playlist");
    try {
        const pl = await PlaylistAPI.getById(playlistId);
        const nameEl = document.getElementById("playlist-detail-name");
        const ownerEl = document.getElementById("playlist-owner");
        const countEl = document.getElementById("playlist-song-count");
        const songList = document.getElementById("playlist-song-list");

        if (nameEl) nameEl.textContent = pl.name;
        if (ownerEl) ownerEl.textContent = pl.user ? pl.user.name : "Unknown";
        if (countEl) countEl.textContent = `• ${pl.songs ? pl.songs.length : 0} songs`;

        // Store playlist songs for play-all
        document.getElementById("view-playlist")._playlistSongs = pl.songs || [];
        document.getElementById("view-playlist")._playlistId = playlistId;

        if (songList) {
            if (!pl.songs || pl.songs.length === 0) {
                songList.innerHTML = '<p style="color:var(--text-subdued); padding:20px; font-size:14px;">This playlist is empty. Add songs from the home page!</p>';
                return;
            }
            songList.innerHTML = pl.songs.map((song, idx) => `
                <div class="song-list-item" onclick="playPlaylistSong(${idx})">
                    <div>
                        <span class="song-list-idx">${idx + 1}</span>
                        <span class="play-inline" style="color:var(--text-primary); cursor:pointer;">▶</span>
                    </div>
                    <div>
                        <div class="song-list-name">${escapeHtml(song.title)}</div>
                        <div class="song-list-artist">${escapeHtml(song.artist)}</div>
                    </div>
                    <span class="song-list-duration">${formatDuration(song.duration)}</span>
                </div>
            `).join("");
        }
    } catch (e) {
        console.error("Failed to load playlist detail", e);
    }
}

function playPlaylistSong(index) {
    const view = document.getElementById("view-playlist");
    if (!view || !view._playlistSongs) return;
    Player.playSong(view._playlistSongs[index], view._playlistSongs);
    updateLikeButton();
}

function playPlaylistFromStart() {
    playPlaylistSong(0);
}

// ===== PROFILE =====
async function loadProfile() {
    try {
        const user = await UserAPI.getProfile();
        const avatarEl = document.getElementById("profile-avatar-large");
        const nameEl = document.getElementById("profile-display-name");
        const nameInput = document.getElementById("profile-name");
        const emailInput = document.getElementById("profile-email");

        const initial = user.name ? user.name.charAt(0).toUpperCase() : "U";
        if (avatarEl) avatarEl.textContent = initial;
        if (nameEl) nameEl.textContent = user.name;
        if (nameInput) nameInput.value = user.name;
        if (emailInput) emailInput.value = user.email;

        // Load recently played for profile
        try {
            const recent = await UserAPI.getRecentlyPlayed();
            renderSongsGrid("profile-recently-played", recent.slice(0, 6), recent);
        } catch (e) {
            const el = document.getElementById("profile-recently-played");
            if (el) el.innerHTML = '<p style="color:var(--text-subdued); font-size:13px;">No recently played songs.</p>';
        }

        // Load favorites for profile
        try {
            const favs = await UserAPI.getFavorites();
            renderSongsGrid("profile-favorites", favs.slice(0, 6), favs);
        } catch (e) {
            const el = document.getElementById("profile-favorites");
            if (el) el.innerHTML = '<p style="color:var(--text-subdued); font-size:13px;">No liked songs.</p>';
        }
    } catch (e) {
        console.error("Failed to load profile", e);
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    const name = document.getElementById("profile-name").value.trim();
    const email = document.getElementById("profile-email").value.trim();
    const msgEl = document.getElementById("profile-msg");

    if (msgEl) {
        msgEl.classList.add("hidden");
        msgEl.classList.remove("success", "error");
    }

    try {
        const data = await UserAPI.updateProfile({ name, email });
        // Update local storage
        const user = getUser();
        if (user) {
            user.name = name;
            user.email = email;
            localStorage.setItem("spotify_user", JSON.stringify(user));
            initUser();
        }
        if (msgEl) {
            msgEl.textContent = "Profile updated successfully!";
            msgEl.classList.remove("hidden");
            msgEl.classList.add("success");
        }
        const displayName = document.getElementById("profile-display-name");
        if (displayName) displayName.textContent = name;
        const avatarEl = document.getElementById("profile-avatar-large");
        if (avatarEl) avatarEl.textContent = name.charAt(0).toUpperCase();
    } catch (e) {
        if (msgEl) {
            msgEl.textContent = e.message || "Update failed";
            msgEl.classList.remove("hidden");
            msgEl.classList.add("error");
        }
    }
}

// ===== PLAYLIST MODAL =====
function openPlaylistModal() {
    document.getElementById("playlist-modal")?.classList.remove("hidden");
    document.getElementById("playlist-name-input")?.focus();
}

function closePlaylistModal() {
    document.getElementById("playlist-modal")?.classList.add("hidden");
    const input = document.getElementById("playlist-name-input");
    if (input) input.value = "";
    document.getElementById("playlist-create-error")?.classList.add("hidden");
}

async function handleCreatePlaylist(e) {
    e.preventDefault();
    const name = document.getElementById("playlist-name-input").value.trim();
    const errorEl = document.getElementById("playlist-create-error");

    if (!name) {
        if (errorEl) { errorEl.textContent = "Please enter a playlist name"; errorEl.classList.remove("hidden"); }
        return;
    }

    try {
        await PlaylistAPI.create(name);
        closePlaylistModal();
        loadSidebarPlaylists();
        if (currentView === "home") loadHomePlaylists();
        if (currentView === "library") loadLibrary("playlists");
    } catch (e) {
        if (errorEl) { errorEl.textContent = e.message || "Failed to create playlist"; errorEl.classList.remove("hidden"); }
    }
}

// ===== SONG ACTION MODAL =====
function openSongActionModal(songId, songTitle) {
    selectedSongId = songId;
    const modal = document.getElementById("song-action-modal");
    const titleEl = document.getElementById("song-action-title");
    const playlistList = document.getElementById("add-to-playlist-list");

    if (titleEl) titleEl.textContent = songTitle;

    // Build playlist add options
    if (playlistList) {
        if (!allPlaylists || allPlaylists.length === 0) {
            playlistList.innerHTML = '<p style="color:var(--text-subdued); font-size:13px; padding:8px 0;">No playlists. Create one first!</p>';
        } else {
            playlistList.innerHTML = '<p style="color:var(--text-subdued); font-size:11px; font-weight:700; letter-spacing:1px; padding:8px 0 4px;">ADD TO PLAYLIST</p>' +
                allPlaylists.map(pl => `
                    <button class="action-item" onclick="addToPlaylist('${pl._id}')">
                        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>
                        ${escapeHtml(pl.name)}
                    </button>
                `).join("");
        }
    }

    if (modal) modal.classList.remove("hidden");
}

function closeSongActionModal() {
    document.getElementById("song-action-modal")?.classList.add("hidden");
    selectedSongId = null;
}

async function addSelectedToFavorites() {
    if (!selectedSongId) return;
    try {
        await UserAPI.addFavorite(selectedSongId);
        if (!favoriteSongIds.includes(selectedSongId)) {
            favoriteSongIds.push(selectedSongId);
        }
        updateLikeButton();
        closeSongActionModal();
    } catch (e) {
        console.error("Failed to add favorite", e);
    }
}

async function addToPlaylist(playlistId) {
    if (!selectedSongId) return;
    try {
        await PlaylistAPI.addSong(playlistId, selectedSongId);
        closeSongActionModal();
        loadSidebarPlaylists();
    } catch (e) {
        console.error("Failed to add to playlist", e);
    }
}

// ===== UTILITY FUNCTIONS =====
function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function escapeAttr(str) {
    if (!str) return "";
    return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

function formatDuration(seconds) {
    if (!seconds) return "—";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}
