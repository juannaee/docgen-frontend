document.addEventListener("DOMContentLoaded", () => {
  const items = [...document.querySelectorAll(".faq-item")];
  const btns = document.querySelectorAll(".faq-question");
  const search = document.getElementById("searchInput");
  const empty = document.getElementById("emptyState");

  // Acessibilidade: ARIA
  btns.forEach((btn, idx) => {
    const answer = btn.nextElementSibling;
    const id = `faq-answer-${idx}`;
    btn.setAttribute("aria-controls", id);
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("role", "button");
    answer.id = id;
    answer.setAttribute("role", "region");
    answer.setAttribute("aria-hidden", "true");

    btn.addEventListener("click", () => toggleItem(btn.parentElement));
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleItem(btn.parentElement); }
    });
  });

  function toggleItem(activeItem){
    // fecha outros
    items.forEach(item => {
      const ans = item.querySelector(".faq-answer");
      const btn = item.querySelector(".faq-question");
      if (item !== activeItem){
        item.classList.remove("active");
        animateClose(ans);
        btn.setAttribute("aria-expanded","false");
        ans.setAttribute("aria-hidden","true");
      }
    });
    // alterna o atual
    const ans = activeItem.querySelector(".faq-answer");
    const btn = activeItem.querySelector(".faq-question");
    const isActive = activeItem.classList.toggle("active");
    if (isActive){
      animateOpen(ans);
      btn.setAttribute("aria-expanded","true");
      ans.setAttribute("aria-hidden","false");
    } else {
      animateClose(ans);
      btn.setAttribute("aria-expanded","false");
      ans.setAttribute("aria-hidden","true");
    }
  }

  function animateOpen(el){
    el.style.maxHeight = "0px";
    requestAnimationFrame(() => {
      el.style.maxHeight = el.scrollHeight + "px";
      el.style.opacity = "1";
    });
  }
  function animateClose(el){
    el.style.maxHeight = el.scrollHeight + "px";
    requestAnimationFrame(() => {
      el.style.maxHeight = "0px";
      el.style.opacity = "0";
    });
  }

  // Busca
  if (search){
    search.addEventListener("input", e => {
      const q = e.target.value.toLowerCase().trim();
      let visible = 0;
      items.forEach(item => {
        const txt = item.innerText.toLowerCase();
        const show = txt.includes(q);
        item.style.display = show ? "" : "none";
        if (show) visible++;
      });
      empty.classList.toggle("hidden", visible !== 0);
    });
  }
});
