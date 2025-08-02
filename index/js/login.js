document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const errorMessage = document.getElementById("errorMessage");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMessage.textContent = "";

    if (!email.value || !password.value) {
      errorMessage.textContent = "Preencha todos os campos.";
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.value,
          password: password.value,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        errorMessage.textContent =
          result.message || result.error || "Erro ao fazer login.";
        return;
      }

      localStorage.setItem("jwtToken", result.token);

      if (result.passwordResetRequired) {
        showNotification(
          "É necessário redefinir sua senha. Você será redirecionado para alterar.",
          3000
        );
        setTimeout(() => {
          window.location.href = "/resetPassword/reset-password.html";
        }, 3000);
        return;
      }

      window.location.href = "/dashboard/dashboard.html";
    } catch (error) {
      errorMessage.textContent =
        "Erro de conexão com o servidor. Tente novamente mais tarde.";
      console.error("Erro no fetch login:", error);
    }
  });
});
function showNotification(text, duration = 5000) {
  const banner = document.createElement("div");
  banner.classList.add("notification-banner");

  const spanText = document.createElement("span");
  spanText.textContent = text;

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "×";

  closeBtn.addEventListener("click", () => {
    fadeOutAndRemove(banner);
  });

  banner.appendChild(spanText);
  banner.appendChild(closeBtn);
  document.body.appendChild(banner);

  function fadeOutAndRemove(el) {
    el.style.opacity = "0";
    el.addEventListener("transitionend", () => el.remove());
  }

  setTimeout(() => {
    fadeOutAndRemove(banner);
  }, duration);
}

