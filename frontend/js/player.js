// ==========================================
//  Music Player Engine
// ==========================================

const Player = (() => {
    let currentSong = null;
    let queue = [];
    let queueIndex = -1;
    let isShuffled = false;
    let isRepeating = false;
    let shuffledQueue = [];
    let progressInterval = null;

    // DOM refs
    const audioEl = new Audio();
    audioEl.volume = 0.8;

    const playerTitle = document.getElementById("player-title");
    const playerArtist = document.getElementById("player-artist");
    const playerArt = document.getElementById("player-art");
    const playIcon = document.getElementById("play-icon");
    const pauseIcon = document.getElementById("pause-icon");
    const progressFill = document.getElementById("progress-fill");
    const progressThumb = document.getElementById("progress-thumb");
    const currentTimeEl = document.getElementById("current-time");
    const durationEl = document.getElementById("duration-label");
    const shuffleBtn = document.getElementById("shuffle-btn");
    const repeatBtn = document.getElementById("repeat-btn");

    function formatTime(secs) {
        if (!secs || isNaN(secs)) return "0:00";
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s.toString().padStart(2, "0")}`;
    }

    function updateProgressUI() {
        if (!audioEl.duration) return;
        const pct = (audioEl.currentTime / audioEl.duration) * 100;
        if (progressFill) progressFill.style.width = pct + "%";
        if (progressThumb) progressThumb.style.left = pct + "%";
        if (currentTimeEl) currentTimeEl.textContent = formatTime(audioEl.currentTime);
        if (durationEl) durationEl.textContent = formatTime(audioEl.duration);
    }

    function updatePlayerUI(song) {
        if (!song) return;
        if (playerTitle) playerTitle.textContent = song.title;
        if (playerArtist) playerArtist.textContent = song.artist;
        if (playerArt) {
            if (song.coverImage) {
                playerArt.innerHTML = `<img src="${song.coverImage}" alt="${song.title}">`;
            } else {
                playerArt.innerHTML = `<svg viewBox="0 0 24 24" width="36" height="36" fill="#535353"><path d="M9 19V6l12-3v13M9 19c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zm12-3c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zM9 10l12-3"/></svg>`;
            }
        }
        document.title = `${song.title} • Spotify Clone`;
    }

    function setPlayingState(playing) {
        if (playIcon) playIcon.classList.toggle("hidden", playing);
        if (pauseIcon) pauseIcon.classList.toggle("hidden", !playing);
    }

    function playSong(song, songList = null) {
        if (!song) return;
        currentSong = song;

        // If a new queue is provided, update it
        if (songList) {
            queue = songList;
            queueIndex = queue.findIndex(s => s._id === song._id);
            shuffledQueue = [...queue].sort(() => Math.random() - 0.5);
        }

        updatePlayerUI(song);
        // We can't truly stream without audio URLs, so we simulate playback
        // In production the song.audioUrl field would be set
        if (song.audioUrl) {
            audioEl.src = song.audioUrl;
            audioEl.play().catch(() => {});
        } else {
            // Simulate time progress for demo
            audioEl.src = "";
            simulateProgress(song.duration || 240);
        }
        setPlayingState(true);

        // Try to auto-track via API (if logged in)
        const token = getToken();
        if (token && song._id) {
            SongAPI.getById(song._id).catch(() => {});
        }
    }

    function simulateProgress(duration) {
        clearInterval(progressInterval);
        let elapsed = 0;
        if (durationEl) durationEl.textContent = formatTime(duration);
        progressInterval = setInterval(() => {
            elapsed++;
            if (elapsed >= duration) {
                clearInterval(progressInterval);
                handleSongEnd();
                return;
            }
            const pct = (elapsed / duration) * 100;
            if (progressFill) progressFill.style.width = pct + "%";
            if (progressThumb) progressThumb.style.left = pct + "%";
            if (currentTimeEl) currentTimeEl.textContent = formatTime(elapsed);
        }, 1000);
    }

    function handleSongEnd() {
        if (isRepeating) {
            playSong(currentSong);
        } else {
            playNext();
        }
    }

    function playNext() {
        const activeQueue = isShuffled ? shuffledQueue : queue;
        if (!activeQueue.length) return;
        const currentIdx = activeQueue.findIndex(s => s._id === currentSong?._id);
        const nextIdx = currentIdx + 1 < activeQueue.length ? currentIdx + 1 : 0;
        playSong(activeQueue[nextIdx]);
    }

    function playPrev() {
        const activeQueue = isShuffled ? shuffledQueue : queue;
        if (!activeQueue.length) return;
        const currentIdx = activeQueue.findIndex(s => s._id === currentSong?._id);
        const prevIdx = currentIdx - 1 >= 0 ? currentIdx - 1 : activeQueue.length - 1;
        playSong(activeQueue[prevIdx]);
    }

    function togglePlay() {
        if (!currentSong) return;
        if (audioEl.src && !audioEl.paused) {
            audioEl.pause();
            clearInterval(progressInterval);
            setPlayingState(false);
        } else if (audioEl.src) {
            audioEl.play().catch(() => {});
            setPlayingState(true);
        } else {
            // Resume simulation
            setPlayingState(true);
        }
    }

    function toggleShuffle() {
        isShuffled = !isShuffled;
        if (shuffleBtn) shuffleBtn.classList.toggle("active", isShuffled);
    }

    function toggleRepeat() {
        isRepeating = !isRepeating;
        if (repeatBtn) repeatBtn.classList.toggle("active", isRepeating);
    }

    function seekTo(e) {
        const bar = document.getElementById("progress-bar");
        if (!bar || !audioEl.duration) return;
        const rect = bar.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        audioEl.currentTime = pct * audioEl.duration;
        updateProgressUI();
    }

    function setVolume(e) {
        const bar = document.getElementById("volume-bar");
        const fill = document.getElementById("volume-fill");
        if (!bar) return;
        const rect = bar.getBoundingClientRect();
        const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
        audioEl.volume = pct;
        if (fill) fill.style.width = (pct * 100) + "%";
    }

    audioEl.addEventListener("timeupdate", updateProgressUI);
    audioEl.addEventListener("ended", handleSongEnd);

    return {
        playSong,
        togglePlay,
        playNext,
        playPrev,
        toggleShuffle,
        toggleRepeat,
        seekTo,
        setVolume,
        getCurrentSong: () => currentSong,
        setQueue: (songs) => { queue = songs; shuffledQueue = [...songs].sort(() => Math.random() - 0.5); }
    };
})();

// Global bindings for HTML onclick attributes
function togglePlay() { Player.togglePlay(); }
function playNext() { Player.playNext(); }
function playPrev() { Player.playPrev(); }
function toggleShuffle() { Player.toggleShuffle(); }
function toggleRepeat() { Player.toggleRepeat(); }
function seekTo(e) { Player.seekTo(e); }
function setVolume(e) { Player.setVolume(e); }
