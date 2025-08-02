document.addEventListener("DOMContentLoaded", () => {
  const usernameElem = document.getElementById("username");
  const logoutBtn = document.getElementById("logoutBtn");

  const token = localStorage.getItem("jwtToken");
  if (!token) {
    window.location.href = "/index.html";
    return;
  }

  fetch("http://localhost:8080/users/me", {
    headers: {
      Authorization: "Bearer " + token,
    },
  })
    .then(async (response) => {
      if (!response.ok) throw new Error("Erro ao carregar usuário");
      const data = await response.text();
      const usuario = data.split("\n")[0].replace("Usuário logado: ", "").trim();
      usernameElem.textContent = usuario || "Usuário";
    })
    .catch((error) => {
      usernameElem.textContent = "Erro ao carregar";
      console.error("Erro ao buscar usuário:", error);
    });

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("jwtToken");
    window.location.href = "/index.html";
  });
});
