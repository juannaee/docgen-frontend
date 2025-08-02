document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("resetForm");
  const newPassword = document.getElementById("newPassword");
  const confirmPassword = document.getElementById("confirmPassword");
  const errorMessage = document.getElementById("errorMessage");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMessage.textContent = "";

    // Validação simples das senhas
    if (newPassword.value !== confirmPassword.value) {
      errorMessage.textContent = "As senhas não coincidem.";
      return;
    }

    // Pega o token JWT do localStorage
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      errorMessage.textContent = "Usuário não autenticado.";
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/auth/new-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Envia o token no header
        },
        body: JSON.stringify({
          newPassword: newPassword.value,
          confirmPassword: confirmPassword.value,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        errorMessage.textContent = `Erro: ${errorText}`;
        return;
      }

      newPassword.value = "";
      confirmPassword.value = "";

      showSuccessPopupAndRedirect(5, "/index.html");
      
    } catch (error) {
      errorMessage.textContent = "Erro ao atualizar senha. Tente novamente.";
      console.error("Erro no fetch reset password:", error);
    }
  });
});
