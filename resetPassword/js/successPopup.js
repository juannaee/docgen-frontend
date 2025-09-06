function showSuccessPopupAndRedirect(a = 5, b = "/index.html") {
  const opts = typeof a === "object"
    ? { seconds: 5, redirectUrl: "/index.html", message: "Senha alterada com sucesso!", type: "success", ...a }
    : { seconds: a ?? 5, redirectUrl: b ?? "/index.html", message: "Senha alterada com sucesso!", type: "success" };

  // ---- cria popup básico
  const el = document.createElement("div");
  el.style.position = "fixed";
  el.style.top = "20px";
  el.style.right = "20px";
  el.style.background = "rgba(34,197,94,.95)";
  el.style.color = "#fff";
  el.style.padding = "12px 16px";
  el.style.borderRadius = "10px";
  el.style.fontFamily = "Segoe UI, sans-serif";
  el.style.boxShadow = "0 4px 12px rgba(0,0,0,.2)";
  el.style.zIndex = "9999";

  const msg = document.createElement("div");
  msg.textContent = `${opts.message} Redirecionando em ${opts.seconds}s...`;
  el.appendChild(msg);

  const progress = document.createElement("div");
  progress.style.height = "3px";
  progress.style.background = "rgba(255,255,255,0.7)";
  progress.style.marginTop = "6px";
  progress.style.width = "0%";
  progress.style.transition = `width ${opts.seconds}s linear`;
  el.appendChild(progress);

  document.body.appendChild(el);

  // força animação da barra
  requestAnimationFrame(() => progress.style.width = "100%");

  // contador de segundos
  let remaining = opts.seconds;
  const interval = setInterval(() => {
    remaining--;
    if (remaining > 0) {
      msg.textContent = `${opts.message} Redirecionando em ${remaining}s...`;
    } else {
      clearInterval(interval);
      el.remove();
      if (opts.redirectUrl) window.location.href = opts.redirectUrl;
    }
  }, 1000);
}
