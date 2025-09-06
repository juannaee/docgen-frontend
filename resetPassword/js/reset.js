document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("resetForm");
  const newPassword = document.getElementById("newPassword");
  const confirmPassword = document.getElementById("confirmPassword");
  const errorGlobal = document.getElementById("errorMessage");
  const toggle1 = document.getElementById("togglePass1");
  const toggle2 = document.getElementById("togglePass2");
  const capsHint = document.getElementById("capsHint");
  const btn = document.getElementById("submitBtn");
  const spinner = document.getElementById("spinner");
  const bar = document.getElementById("strengthBar");

  const reqs = {
    len: document.getElementById("reqLen"),
    upper: document.getElementById("reqUpper"),
    lower: document.getElementById("reqLower"),
    num: document.getElementById("reqNum"),
    special: document.getElementById("reqSpecial"),
    match: document.getElementById("reqMatch"),
  };

  // helpers
  const setError = (msg) => { errorGlobal.textContent = msg || ""; };
  const mark = (el, ok) => el.classList.toggle("ok", !!ok);

  // caps lock hint
  [newPassword, confirmPassword].forEach(inp => {
    inp.addEventListener("keydown", (e) => {
      const caps = e.getModifierState && e.getModifierState("CapsLock");
      capsHint.classList.toggle("show", !!caps);
    });
    inp.addEventListener("blur", () => capsHint.classList.remove("show"));
  });

  // toggle visibility
  toggle1.addEventListener("click", () => toggleVisibility(newPassword, toggle1));
  toggle2.addEventListener("click", () => toggleVisibility(confirmPassword, toggle2));
  function toggleVisibility(input, btn){
    const isText = input.type === "text";
    input.type = isText ? "password" : "text";
    btn.setAttribute("aria-pressed", String(!isText));
  }

  // força da senha + requisitos
  function evaluateStrength(pass, confirm){
    const tests = {
      len: pass.length >= 8,
      upper: /[A-Z]/.test(pass),
      lower: /[a-z]/.test(pass),
      num: /\d/.test(pass),
      special: /[^A-Za-z0-9]/.test(pass),
      match: pass.length > 0 && pass === confirm
    };
    mark(reqs.len, tests.len);
    mark(reqs.upper, tests.upper);
    mark(reqs.lower, tests.lower);
    mark(reqs.num, tests.num);
    mark(reqs.special, tests.special);
    mark(reqs.match, tests.match);

    // pontuação simples (0-5)
    const score = ['len','upper','lower','num','special'].reduce((s,k)=> s + (tests[k]?1:0), 0);
    const pct = (score/5)*100;
    bar.style.width = pct + "%";
    if (score <= 2) bar.style.background = "#ef4444";
    else if (score === 3) bar.style.background = "#eab308";
    else if (score >= 4) bar.style.background = "#16a34a";
    return tests;
  }

  function isCommonPassword(p){
    // pequena lista para evitar as piores
    const common = ["123456","12345678","123456789","password","qwerty","111111","123123","admin","senha","1234567890"];
    return common.includes(p.toLowerCase());
  }

  const recalc = () => evaluateStrength(newPassword.value, confirmPassword.value);
  newPassword.addEventListener("input", recalc);
  confirmPassword.addEventListener("input", recalc);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("jwtToken");
    if (!token) { setError("Usuário não autenticado."); return; }

    const pass = newPassword.value;
    const conf = confirmPassword.value;

    const t = evaluateStrength(pass, conf);
    if (!t.len || !t.upper || !t.lower || !t.num || !t.special) {
      setError("A senha não atende aos requisitos.");
      return;
    }
    if (!t.match) { setError("As senhas não coincidem."); return; }
    if (isCommonPassword(pass)) { setError("Senha muito comum. Escolha outra."); return; }

    // loading
    btn.disabled = true; btn.classList.add("loading"); spinner.style.display = "inline-block";

    try {
      const res = await fetch("http://localhost:8080/auth/new-password", {
        method: "POST",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ newPassword: pass, confirmPassword: conf })
      });

      // tenta extrair mensagem útil
      let payload = {};
      try { payload = await res.json(); } catch { /* pode ser texto */ }
      if (!res.ok) {
        setError(payload.message || payload.error || "Erro ao atualizar senha.");
        return;
      }

      newPassword.value = "";
      confirmPassword.value = "";
      recalc();

      // sucesso → popup + redirect
      if (typeof showSuccessPopupAndRedirect === "function") {
        showSuccessPopupAndRedirect(5, "/index.html");
      } else {
        // fallback
        alert("Senha atualizada com sucesso. Você será redirecionado.");
        window.location.href = "/index.html";
      }

    } catch (err) {
      console.error("Erro no fetch reset password:", err);
      setError("Erro de conexão com o servidor. Tente novamente.");
    } finally {
      btn.disabled = false; btn.classList.remove("loading"); spinner.style.display = "none";
    }
  });
});
