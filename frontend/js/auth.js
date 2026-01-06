import { apiFetch } from "./api.js";

/* ---------- LOGIN ---------- */
window.handleLogin = async function (e) {
  e.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const errorEl = document.getElementById("login-error");

  errorEl.textContent = "";

  try {
    // 1️⃣ Login (sets cookie)
    await apiFetch("/api/v1/auth/login", {
  method: "POST",
  body: JSON.stringify({ email, password })
});

await apiFetch("/api/v1/auth/me");

window.location.href = "/app.html";

  } catch (err) {
    errorEl.textContent = err.message;
  }
};

/* ---------- REGISTER ---------- */
window.handleRegister = async function (e) {
  e.preventDefault();

  const name = document.getElementById("reg-name").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;
  const errorEl = document.getElementById("register-error");

  errorEl.textContent = "";

  try {
    await apiFetch("/api/v1/auth/register", {
  method: "POST",
  body: JSON.stringify({ name, email, password })
});


    window.location.href = "/login.html";

  } catch (err) {
    errorEl.textContent = err.message;
  }
};
