document.addEventListener("DOMContentLoaded", () => {
  const usernameElem = document.getElementById("username");
  const logoutBtn = document.getElementById("logoutBtn");
  const settingsLink = document.getElementById("settingsLink");
  const configCard = document.getElementById("configCard");

  const token = localStorage.getItem("jwtToken");
  const username = localStorage.getItem("username");
  const userRole = localStorage.getItem("userRole");

  if (!token) {
    window.location.href = "/index.html";
    return;
  }

  // Mostra o nome do usuário salvo no login
  usernameElem.textContent = username || "Usuário";

  // Esconde configurações se não for ADMIN (proteção simples no front)
  if (userRole !== "ADMIN") {
    if (settingsLink) settingsLink.style.display = "none";
    if (configCard) configCard.style.display = "none";
  }

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    window.location.href = "/index.html";
  });
});
