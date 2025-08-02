function showAnimatedNotification(text, duration = 5000) {
  if (!document.getElementById("notification-style")) {
    const style = document.createElement("style");
    style.id = "notification-style";
    style.textContent = `
      @keyframes slideDown {
        0% {
          transform: translateY(-20px);
          opacity: 0;
        }
        100% {
          transform: translateY(0);
          opacity: 1;
        }
      }

      .notification-banner {
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #2d9cdb;
        color: white;
        padding: 0.7rem 1rem;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 10px;
        width: 300px;
        z-index: 1100;
        animation: slideDown 0.3s ease forwards;
        overflow: hidden;
      }

      .notification-banner svg {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        stroke: white;
        stroke-width: 2;
      }

      .notification-text {
        flex-grow: 1;
        user-select: none;
      }

      .notification-close-btn {
        background: transparent;
        border: none;
        color: white;
        font-size: 1.2rem;
        font-weight: bold;
        cursor: pointer;
        line-height: 1;
        padding: 0 6px 2px 6px;
        user-select: none;
      }

      .notification-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background-color: rgba(255,255,255,0.7);
        width: 0%;
        transition: width linear;
      }
    `;
    document.head.appendChild(style);
  }

  const banner = document.createElement("div");
  banner.classList.add("notification-banner");
  banner.style.position = "fixed";
  banner.style.top = "20px";
  banner.style.right = "20px";

  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("fill", "none");
  icon.innerHTML = `
    <circle cx="12" cy="12" r="10" stroke-opacity="0.3" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <circle cx="12" cy="16" r="1" fill="white" />
  `;

  const spanText = document.createElement("div");
  spanText.className = "notification-text";
  spanText.textContent = text;

  const closeBtn = document.createElement("button");
  closeBtn.className = "notification-close-btn";
  closeBtn.textContent = "×";
  closeBtn.setAttribute("aria-label", "Fechar notificação");
  closeBtn.addEventListener("click", () => {
    fadeOutAndRemove(banner);
  });

  const progressBar = document.createElement("div");
  progressBar.className = "notification-progress";

  banner.appendChild(icon);
  banner.appendChild(spanText);
  banner.appendChild(closeBtn);
  banner.appendChild(progressBar);
  document.body.appendChild(banner);

  setTimeout(() => {
    progressBar.style.transition = `width ${duration}ms linear`;
    progressBar.style.width = "100%";
  }, 10);

  function fadeOutAndRemove(el) {
    el.style.transition = "opacity 0.3s ease";
    el.style.opacity = "0";
    el.addEventListener("transitionend", () => el.remove());
  }

  const timeout = setTimeout(() => {
    fadeOutAndRemove(banner);
  }, duration);

  closeBtn.addEventListener("click", () => clearTimeout(timeout));
}
