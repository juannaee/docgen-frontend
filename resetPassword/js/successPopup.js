function showSuccessPopupAndRedirect(seconds = 5, redirectUrl = "/index.html") {
  if (!document.getElementById("popup-animations-style")) {
    const style = document.createElement("style");
    style.id = "popup-animations-style";
    style.textContent = `
    @keyframes pop {
      0% {
        transform: scale(0);
        opacity: 0;
      }
      80% {
        transform: scale(1.1);
        opacity: 1;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
  `;
    document.head.appendChild(style);
  }

  const popupContainer = document.createElement("div");
  popupContainer.style.position = "fixed";
  popupContainer.style.top = "20px";
  popupContainer.style.right = "20px"; // mudou de center para canto direito
  popupContainer.style.backgroundColor = "rgba(75, 181, 67, 0.85)"; // verde suave e semi-transparente
  popupContainer.style.color = "#fff";
  popupContainer.style.padding = "0.8rem 1.2rem"; // menor padding
  popupContainer.style.borderRadius = "10px";
  popupContainer.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)"; // sombra mais leve
  popupContainer.style.fontSize = "0.9rem"; // fonte menor
  popupContainer.style.zIndex = "1000";
  popupContainer.style.fontFamily = "Segoe UI, sans-serif";
  popupContainer.style.display = "flex";
  popupContainer.style.alignItems = "center";
  popupContainer.style.gap = "10px";
  popupContainer.style.minWidth = "250px";
  popupContainer.style.opacity = "0";
  popupContainer.style.transition = "opacity 0.4s ease, transform 0.4s ease";
  popupContainer.style.transform = "translateY(-15px)";

  // Ícone SVG menor e alinhado horizontalmente
  const icon = document.createElement("div");
  icon.innerHTML = `
  <svg class="check-icon" width="32" height="32" viewBox="0 0 24 24" fill="none"
       stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10" stroke-opacity="0.3" />
    <path d="M16 8l-5.5 6L8 11" />
  </svg>
`;
  icon.style.animation = "pop 0.4s ease-out";

  const message = document.createElement("div");
  message.textContent = `Senha alterada com sucesso! Redirecionando em ${seconds}s...`;

  // Barra de progresso discreta e fina
  const progressBar = document.createElement("div");
  progressBar.style.position = "absolute";
  progressBar.style.bottom = "0";
  progressBar.style.left = "0";
  progressBar.style.height = "3px"; // mais fina
  progressBar.style.backgroundColor = "rgba(255, 255, 255, 0.7)";
  progressBar.style.width = "0%";
  progressBar.style.transition = `width ${seconds}s linear`;

  popupContainer.appendChild(icon);
  popupContainer.appendChild(message);
  popupContainer.appendChild(progressBar);

  document.body.appendChild(popupContainer);

  // Força reflow para animar entrada
  setTimeout(() => {
    popupContainer.style.opacity = "1";
    popupContainer.style.transform = "translateY(0)";
    progressBar.style.width = "100%";
  }, 10);

  const interval = setInterval(() => {
    seconds--;
    if (seconds > 0) {
      message.textContent = `Senha alterada com sucesso! Redirecionando em ${seconds}s...`;
    } else {
      clearInterval(interval);
      popupContainer.remove();
      window.location.href = redirectUrl;
    }
  }, 1000);
}
