/**
 * Uso básico (compatível):
 *   showAnimatedNotification("Logado com sucesso!", 4000)
 *
 * Uso avançado:
 *   const n = showAnimatedNotification({
 *     text: "Salvo!",
 *     duration: 6000,
 *     type: "success",                // info | success | warning | error
 *     position: "top-right",          // top-right | top-left | bottom-right | bottom-left
 *     dismissible: true,
 *     pauseOnHover: true,
 *   });
 *   // n.close();
 */
function showAnimatedNotification(a, b) {
  const opts = typeof a === "object"
    ? { text: "", duration: 5000, type: "info", position: "top-right", dismissible: true, pauseOnHover: true, ...a }
    : { text: a ?? "", duration: b ?? 5000, type: "info", position: "top-right", dismissible: true, pauseOnHover: true };

  // ---- estilos (injeção única)
  if (!document.getElementById("notification-style")) {
    const style = document.createElement("style");
    style.id = "notification-style";
    style.textContent = `
      @media (prefers-reduced-motion:no-preference){
        @keyframes slideInTR { from{ transform: translate(0,-8px); opacity:0 } to{ transform:none; opacity:1 } }
        @keyframes slideInBR { from{ transform: translate(0,8px);  opacity:0 } to{ transform:none; opacity:1 } }
      }
      .notif-stack{
        position: fixed; z-index: 1100; display: flex; flex-direction: column; gap: 10px;
        pointer-events: none; /* só os filhos recebem clique */
        padding: 16px;
      }
      .notif-stack[data-pos^="top"]{ top:0 }
      .notif-stack[data-pos^="bottom"]{ bottom:0 }
      .notif-stack[data-pos$="right"]{ right:0 }
      .notif-stack[data-pos$="left"]{ left:0 }

      .notification-banner{
        pointer-events: auto;
        display:flex; align-items:center; gap:10px; overflow:hidden;
        min-width: 280px; max-width: min(92vw, 420px);
        padding: 10px 12px; border-radius: 12px; color: #fff;
        box-shadow: 0 8px 24px rgba(0,0,0,.25); font: 500 14px/1.3 system-ui, Segoe UI, Roboto, Arial;
        position: relative; will-change: transform, opacity;
        background: linear-gradient(180deg, #60a5fa, #2563eb); /* info default */
      }
      .notification-banner[data-type="success"]{ background: linear-gradient(180deg, #22c55e, #16a34a) }
      .notification-banner[data-type="warning"]{ background: linear-gradient(180deg, #eab308, #ca8a04) }
      .notification-banner[data-type="error"]  { background: linear-gradient(180deg, #ef4444, #dc2626) }

      .notification-banner[data-enter="top-right"],
      .notification-banner[data-enter="top-left"]{ animation: slideInTR .25s ease }
      .notification-banner[data-enter="bottom-right"],
      .notification-banner[data-enter="bottom-left"]{ animation: slideInBR .25s ease }

      .notification-icon{ width:20px; height:20px; flex:0 0 auto; opacity:.95 }
      .notification-text{ flex:1 1 auto; word-wrap: break-word }
      .notification-close-btn{
        background: transparent; border: none; color: white; font-size: 18px; line-height:1;
        cursor: pointer; padding: 2px 6px; border-radius: 8px;
      }
      .notification-progress{
        position:absolute; left:0; bottom:0; height:3px; width:0%;
        background: rgba(255,255,255,.85);
      }
      @media (prefers-reduced-motion: reduce){
        .notification-banner{ animation: none !important }
      }
    `;
    document.head.appendChild(style);
  }

  // ---- stack por posição
  const pos = opts.position;
  const stackId = `notif-stack-${pos}`;
  let stack = document.getElementById(stackId);
  if (!stack) {
    stack = document.createElement("div");
    stack.id = stackId;
    stack.className = "notif-stack";
    stack.dataset.pos = pos;
    document.body.appendChild(stack);
  }

  // ---- banner
  const banner = document.createElement("div");
  banner.className = "notification-banner";
  banner.dataset.type = opts.type;
  banner.dataset.enter = pos;
  banner.setAttribute("role", "status");
  banner.setAttribute("aria-live", "polite");

  // ícone minimal por tipo
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.classList.add("notification-icon");
  icon.setAttribute("fill", "none");
  icon.setAttribute("stroke", "white");
  icon.setAttribute("stroke-width", "2");
  icon.innerHTML = ({
    success:`<circle cx="12" cy="12" r="10" stroke-opacity=".35"/><path d="M16 8l-5.5 6L8 11"/>`,
    warning:`<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/>`,
    error:  `<circle cx="12" cy="12" r="10" stroke-opacity=".35"/><path d="M15 9l-6 6M9 9l6 6"/>`,
    info:   `<circle cx="12" cy="12" r="10" stroke-opacity=".35"/><path d="M12 8h.01M11 12h2v4h-2z"/>`,
  })[opts.type] || "";

  const spanText = document.createElement("div");
  spanText.className = "notification-text";
  spanText.textContent = String(opts.text ?? "");

  const closeBtn = document.createElement("button");
  closeBtn.className = "notification-close-btn";
  closeBtn.setAttribute("aria-label", "Fechar notificação");
  closeBtn.textContent = "×";
  if (!opts.dismissible) closeBtn.style.display = "none";

  const progressBar = document.createElement("div");
  progressBar.className = "notification-progress";

  banner.append(icon, spanText, closeBtn, progressBar);
  stack.appendChild(banner);

  // ---- progress preciso com rAF (pausável)
  let duration = Math.max(0, Number(opts.duration) || 0);
  let start = performance.now();
  let elapsed = 0;
  let paused = false;
  let rafId;

  function frame(now) {
    if (!paused) {
      elapsed += now - start;
      const pct = duration ? Math.min(1, elapsed / duration) : 1;
      progressBar.style.width = (pct * 100).toFixed(3) + "%";
      if (pct >= 1) return close(false);
    }
    start = now;
    rafId = requestAnimationFrame(frame);
  }
  if (duration > 0) rafId = requestAnimationFrame(frame);

  // pausa no hover / aba oculta
  function pause(){ paused = true; }
  function resume(){ paused = false; start = performance.now(); }
  if (opts.pauseOnHover) {
    banner.addEventListener("mouseenter", pause);
    banner.addEventListener("mouseleave", resume);
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pause(); else resume();
  });

  // ESC fecha
  const onKey = (e) => { if (e.key === "Escape") close(true); };
  document.addEventListener("keydown", onKey);

  // botão fecha
  closeBtn.addEventListener("click", () => close(true));

  // remove/limpa
  function close(byUser){
    cancelAnimationFrame(rafId);
    document.removeEventListener("keydown", onKey);
    banner.removeEventListener("mouseenter", pause);
    banner.removeEventListener("mouseleave", resume);

    banner.style.transition = "opacity .22s ease, transform .22s ease";
    banner.style.opacity = "0";
    banner.style.transform = pos.startsWith("bottom") ? "translateY(6px)" : "translateY(-6px)";
    setTimeout(() => banner.remove(), 200);

    return { closedByUser: !!byUser };
  }

  return { close: () => close(true) };
}
