// /dashboard/js/dashboard.js
document.addEventListener("DOMContentLoaded", async () => {
  // --- Seletores
  const usernameEls = document.querySelectorAll("[data-username]");
  const logoutBtn    = document.getElementById("logoutBtn");
  const settingsLink = document.getElementById("settingsLink");
  const configCard   = document.getElementById("configCard");
  const roleBadge    = document.getElementById("roleBadge");
  const avatar       = document.querySelector(".avatar");

  // --- Estado
  let token      = localStorage.getItem("jwtToken");
  let userRole   = localStorage.getItem("userRole");
  let displayName= localStorage.getItem("username");

  // --- Guard: precisa estar logado
  if (!token) return redirectToLogin();

  // --- Se faltar nome/role, busca no backend
  if (!displayName || !userRole) {
    try {
      const res = await fetch("http://localhost:8080/users/me", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 401 || res.status === 403) {
        return redirectToLogin(); // token inválido/expirado
      }
      if (!res.ok) throw new Error("Falha ao buscar /users/me");

      const me = await res.json();
      displayName = me.name || me.email || "Usuário";
      userRole    = (me.role || "USER").toString().toUpperCase();

      localStorage.setItem("username", displayName);
      localStorage.setItem("userRole", userRole);
    } catch (e) {
      console.error(e);
      return redirectToLogin();
    }
  }

  // --- Render UI
  usernameEls.forEach(el => el.textContent = displayName || "Usuário");

  if (avatar) avatar.textContent = getInitials(displayName);

  if (roleBadge) {
    const isAdmin = userRole === "ADMIN";
    roleBadge.textContent = isAdmin ? "Administrador" : "Usuário";
    roleBadge.classList.toggle("is-admin", isAdmin);
  }

  // Esconde configurações se não for ADMIN
  if (userRole !== "ADMIN") {
    if (settingsLink) settingsLink.style.display = "none";
    if (configCard)   configCard.style.display   = "none";
  }

  // Marca item ativo no menu (com base no pathname)
  highlightActiveMenuItem();

  // --- Logout
  logoutBtn?.addEventListener("click", () => {
    clearAuth();
    redirectToLogin();
  });

  // =========================
  // Helpers
  // =========================
  function getInitials(name = "") {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(p => p[0]?.toUpperCase() || "")
      .join("") || "U";
  }

  function clearAuth() {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
  }

  function redirectToLogin() {
    clearAuth();
    window.location.href = "/index.html";
  }

  function highlightActiveMenuItem() {
    const path = window.location.pathname;
    document.querySelectorAll(".menu a.menu-item").forEach(a => {
      // normaliza URL do href para comparar só o pathname
      const aUrl = new URL(a.href, window.location.origin);
      a.removeAttribute("aria-current");
      if (aUrl.pathname === path) {
        a.setAttribute("aria-current", "page");
      }
    });
  }
});
