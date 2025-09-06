document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const errorGlobal = document.getElementById("errorMessage"); // global
  const emailError = document.getElementById("emailError");
  const passError  = document.getElementById("passError");
  const btn = document.getElementById("submitBtn");
  const spinner = document.getElementById("spinner");
  const formContainer = document.querySelector(".form-container");
  const togglePass = document.getElementById("togglePass");
  const capsHint = document.getElementById("capsHint");

  // Autofill do último email usado (UX)
  const lastEmail = localStorage.getItem("lastEmail");
  if (lastEmail && !email.value) email.value = lastEmail;
  if (!email.value) email.focus();

  // Helpers
  const setErr = (el, msg) => { el.textContent = msg || ""; };
  const clearAllErrors = () => { setErr(emailError,""); setErr(passError,""); setErr(errorGlobal,""); };



  // Caps Lock hint
  password.addEventListener("keydown", (e) => {
    const caps = e.getModifierState && e.getModifierState("CapsLock");
    capsHint.classList.toggle("show", !!caps);
  });
  password.addEventListener("blur", () => capsHint.classList.remove("show"));

  // Mostrar/ocultar senha
  togglePass.addEventListener("click", () => {
    const visible = password.getAttribute("type") === "text";
    password.setAttribute("type", visible ? "password":"text");
    togglePass.setAttribute("aria-pressed", !visible);
  });

  // Form submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAllErrors();
    formContainer.classList.remove("shake");

    const mail = email.value.trim();
    const pass = password.value;

    // Validação simples
    let hasError = false;
    if (!mail) { setErr(emailError, "Informe seu e-mail."); hasError = true; }
    if (!pass) { setErr(passError, "Informe sua senha."); hasError = true; }

    if (hasError) { formContainer.classList.add("shake"); return; }

    // Loading state
    btn.disabled = true;
    btn.classList.add("loading");
    spinner.style.display = "inline-block";

    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type":"application/json", "Accept":"application/json" },
        body: JSON.stringify({ email: mail, password: pass })
      });

      let result = null;
      try { result = await response.json(); } catch { result = {}; }

      if (!response.ok) {
        const msg = result.message || result.error || "Erro ao fazer login.";
        setErr(errorGlobal, msg);
        formContainer.classList.add("shake");
        return;
      }

      // Persistência
      localStorage.setItem("userRole", result.userRole);
      localStorage.setItem("username", result.username);
      localStorage.setItem("jwtToken", result.token);
      localStorage.setItem("lastEmail", mail);

      // Força troca de senha
      if (result.passwordResetRequired) {
        if (typeof showAnimatedNotification === "function") {
          showAnimatedNotification(
            "É necessário redefinir sua senha. Você será redirecionado para alterar.",
            6000
          );
        }
        setTimeout(() => {
          window.location.href = "/resetPassword/reset-password.html";
        }, 6000);
        return;
      }

      // OK → dashboard
      window.location.href = "/dashboard/dashboard.html";

    } catch (err) {
      console.error("Erro no fetch login:", err);
      setErr(errorGlobal, "Erro de conexão com o servidor. Tente novamente.");
      formContainer.classList.add("shake");
    } finally {
      btn.disabled = false;
      btn.classList.remove("loading");
      spinner.style.display = "none";
    }
  });

  // Limpa mensagens enquanto digita
  [email, password].forEach(inp => inp.addEventListener("input", clearAllErrors));
});
