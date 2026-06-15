// ==========================================
//  Auth Page Logic (Login / Register)
// ==========================================

// Redirect to app if already logged in
(function checkAuth() {
    const token = localStorage.getItem("spotify_token");
    if (token) {
        window.location.href = "app.html";
    }
})();

// Tab Switching
function switchTab(tab) {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const loginTab = document.getElementById("login-tab");
    const registerTab = document.getElementById("register-tab");
    const switchText = document.getElementById("switch-text");

    if (tab === "login") {
        loginForm.classList.remove("hidden");
        registerForm.classList.add("hidden");
        loginTab.classList.add("active");
        registerTab.classList.remove("active");
        switchText.innerHTML = 'Don\'t have an account? <a href="#" onclick="switchTab(\'register\')">Sign up</a>';
    } else {
        loginForm.classList.add("hidden");
        registerForm.classList.remove("hidden");
        loginTab.classList.remove("active");
        registerTab.classList.add("active");
        switchText.innerHTML = 'Already have an account? <a href="#" onclick="switchTab(\'login\')">Log in</a>';
    }

    // Clear errors
    document.getElementById("login-error").classList.add("hidden");
    document.getElementById("register-error").classList.add("hidden");
}

// Toggle Password Visibility
function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input.type === "password") {
        input.type = "text";
        btn.textContent = "🙈";
    } else {
        input.type = "password";
        btn.textContent = "👁";
    }
}

// Show Error
function showError(elementId, message) {
    const el = document.getElementById(elementId);
    el.textContent = message;
    el.classList.remove("hidden");
}

// Set Loading State
function setLoading(btnId, loading) {
    const btn = document.getElementById(btnId);
    const text = btn.querySelector(".btn-text");
    const loader = btn.querySelector(".btn-loader");
    btn.disabled = loading;
    text.classList.toggle("hidden", loading);
    loader.classList.toggle("hidden", !loading);
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const errorEl = "login-error";

    document.getElementById(errorEl).classList.add("hidden");
    setLoading("login-btn", true);

    try {
        const res = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            let msg = data.message || "Login failed";
            if (data.errors) {
                msg = data.errors.map(e => e.message).join(". ");
            }
            showError(errorEl, msg);
            setLoading("login-btn", false);
            return;
        }

        localStorage.setItem("spotify_token", data.token);
        localStorage.setItem("spotify_user", JSON.stringify(data.user));
        window.location.href = "app.html";
    } catch (err) {
        showError(errorEl, "Network error. Is the server running?");
        setLoading("login-btn", false);
    }
}

// Handle Register
async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value;
    const errorEl = "register-error";

    document.getElementById(errorEl).classList.add("hidden");
    setLoading("register-btn", true);

    try {
        const res = await fetch("http://localhost:5000/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            let msg = data.message || "Registration failed";
            if (data.errors) {
                msg = data.errors.map(e => e.message).join(". ");
            }
            showError(errorEl, msg);
            setLoading("register-btn", false);
            return;
        }

        // Auto-login after registration
        const loginRes = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const loginData = await loginRes.json();

        if (loginRes.ok) {
            localStorage.setItem("spotify_token", loginData.token);
            localStorage.setItem("spotify_user", JSON.stringify(loginData.user));
            window.location.href = "app.html";
        } else {
            // Registration succeeded but auto-login failed, redirect to login
            switchTab("login");
            showError("login-error", "Account created! Please log in.");
        }
    } catch (err) {
        showError(errorEl, "Network error. Is the server running?");
        setLoading("register-btn", false);
    }
}
