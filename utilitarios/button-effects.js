document.querySelectorAll('.btn').forEach(button => {
  button.addEventListener('click', e => {
    const circle = document.createElement('span');
    circle.classList.add('ripple');
    button.appendChild(circle);

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    circle.style.width = circle.style.height = size + 'px';

    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    circle.style.left = x + 'px';
    circle.style.top = y + 'px';

    circle.addEventListener('animationend', () => {
      circle.remove();
    });
  });
});

// Botão específico para voltar
const backButton = document.getElementById("btnBack");
if (backButton) {
  backButton.addEventListener("click", () => {
    window.history.back();
  });
}
