// Ripple melhorado: evita acúmulo, funciona em teclado e respeita disabled
(function attachButtonEffects(){
  const buttons = document.querySelectorAll('.btn');

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function createRipple(e, btn){
    if (prefersReduced || btn.disabled || btn.getAttribute('disabled') !== null) return;

    // remove ripple anterior (se ainda existe)
    const old = btn.querySelector('.ripple');
    if (old) old.remove();

    const rect = btn.getBoundingClientRect();
    const size = Math.ceil(Math.max(rect.width, rect.height) * 1.15); // levemente maior
    const ripple = document.createElement('span');
    ripple.className = 'ripple';

    // coordenadas do clique ou centro (teclado)
    let cx = rect.width / 2, cy = rect.height / 2;
    if (e && ('clientX' in e)) {
      cx = e.clientX - rect.left;
      cy = e.clientY - rect.top;
    }

    // posiciona via CSS vars (mais performático)
    ripple.style.setProperty('--rs', size + 'px');
    ripple.style.setProperty('--rx', (cx - size/2) + 'px');
    ripple.style.setProperty('--ry', (cy - size/2) + 'px');

    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once:true });
  }

  // Ponteiros têm feedback mais ágil que click
  buttons.forEach(btn => {
    btn.style.position = btn.style.position || 'relative';

    btn.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return; // só botão principal do mouse
      createRipple(e, btn);
    });

    // teclado: Enter/Space
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        createRipple(null, btn);
      }
    });
  });
})();

// Botão "voltar" (se existir)
const backButton = document.getElementById('btnBack');
if (backButton) {
  backButton.addEventListener('click', () => window.history.back());
}
