document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("jwtToken");
  const btnBack = document.getElementById("btnBack");

  if (!token) {
    alert("Você precisa estar logado para ver o perfil.");
    window.location.href = "/index.html";
    return;
  }

  fetch("http://localhost:8080/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Erro ao buscar os dados do perfil");
      }
      return response.json(); 
    })
    .then(user => {
      document.getElementById("profileName").textContent = user.name || "-";
      document.getElementById("profileEmail").textContent = user.email || "-";
      document.getElementById("profilePhone").textContent = user.phone || "-";
      document.getElementById("profileRole").textContent = user.role || "-";
      document.getElementById("profileResetRequired").textContent = user.passwordResetRequired ? "Sim" : "Não";
    })
    .catch(error => {
      console.error(error);
      alert("Erro ao carregar perfil.");
    });

  btnBack.addEventListener("click", () => {
    window.location.href = "/dashboard/dashboard.html";
  });
});
