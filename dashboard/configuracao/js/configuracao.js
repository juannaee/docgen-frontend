document.addEventListener("DOMContentLoaded", () => {
  const container    = document.getElementById("userCardsContainer");
  const userCount    = document.getElementById("userCount");
  const emptyState   = document.getElementById("emptyState");
  const searchInput  = document.getElementById("searchInput");
  const openCreate   = document.getElementById("openCreate");

  // Modals
  const editModal    = document.getElementById("editModal");
  const createModal  = document.getElementById("createModal");

  // Forms
  const editForm     = document.getElementById("editUserForm");
  const createForm   = document.getElementById("createUserForm");
  const cErrors      = document.getElementById("cErrors");
  const cSubmitBtn   = document.getElementById("cSubmit");

  let allUsers = [];

  // ========= Helpers =========
  const initials = (name="") =>
    name.trim().split(/\s+/).slice(0,2).map(p=>p[0]?.toUpperCase()||"").join("");

  const shield = (role="") => {
    const r = (role||"").toUpperCase();
    return `<span class="role-badge" data-role="${r}">${r}</span>`;
  };

  const icon = (d) => ({
    mail:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5L4 8V6l8 5 8-5Z"/></svg>`,
    phone:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M6.6 10.8a15.05 15.05 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24 11.36 11.36 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 8a1 1 0 0 1 1-1h3.4a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .6 3.6 1 1 0 0 1-.24 1Z"/></svg>`
  }[d] || "");

  const token = localStorage.getItem("jwtToken");
  if (!token) {
    window.location.href = "/index.html";
    return;
  }

  // ========= Render =========
  function render(users){
    container.innerHTML = "";
    if(!users.length){
      emptyState.classList.remove("hidden");
      userCount.textContent = "0";
      return;
    }
    emptyState.classList.add("hidden");
    userCount.textContent = users.length;

    users.forEach(user => {
      const card = document.createElement("div");
      card.className = "user-card";
      card.innerHTML = `
        <div class="card-actions">
          <button class="icon-btn edit-btn" title="Editar" data-user='${JSON.stringify(user)}'>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"
                 stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
            </svg>
          </button>
        </div>

        <div class="user-head">
          <div class="avatar" aria-hidden="true">${initials(user.name || user.email)}</div>
          <div class="user-title">
            <h3 class="user-name">${user.name || "-"}</h3>
            ${shield(user.role)}
          </div>
        </div>

        <div class="user-meta">
          <div class="meta-row">${icon("mail")} <span>${user.email}</span></div>
          <div class="meta-row">${icon("phone")} <span>${user.phone || "-"}</span></div>
        </div>
      `;
      container.appendChild(card);
    });

    container.querySelectorAll(".edit-btn").forEach(button => {
      button.addEventListener("click", () => {
        const user = JSON.parse(button.getAttribute("data-user"));
        openEditModal(user);
        document.querySelectorAll(".user-card").forEach(c => c.classList.remove("editing"));
        button.closest(".user-card")?.classList.add("editing");
      });
    });
  }

  // ========= Fetch inicial =========
  fetch("http://localhost:8080/users", {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => {
      if (!res.ok) throw new Error("Erro ao buscar usuários");
      return res.json();
    })
    .then(users => { allUsers = users || []; render(allUsers); })
    .catch(err => { container.innerHTML = ""; showToast(err.message || "Falha ao carregar usuários."); });

  // ========= Busca dinâmica =========
  searchInput?.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    const filtered = allUsers.filter(u =>
      u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
    render(filtered);
  });

  // ========= Editar =========
  function openEditModal(user) {
    document.getElementById("editUserId").value = user.id;
    document.getElementById("editName").value = user.name || "";
    document.getElementById("editPhone").value = user.phone || "";
    document.getElementById("editEmail").value = user.email || "";
    document.getElementById("editRole").value = user.role || "";
    editModal.classList.remove("hidden");
  }

  editForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const userId = document.getElementById("editUserId").value;
    const name   = document.getElementById("editName").value.trim();
    const phone  = document.getElementById("editPhone").value.trim();

    if (name.length < 3 || name.length > 25) {
      showToast("O nome deve ter entre 3 e 25 caracteres.");
      return;
    }

    fetch(`http://localhost:8080/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, phone }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            const msg = data.message || "Erro ao atualizar usuário.";
            throw new Error(msg);
          });
        }
        return res.json();
      })
      .then((updatedUser) => {
        const idx = allUsers.findIndex(u => u.id === updatedUser.id);
        if (idx >= 0) allUsers[idx] = updatedUser;
        render(allUsers);
        editModal.classList.add("hidden");
        showToast("Usuário atualizado com sucesso!", { success:true });
      })
      .catch((err) => showToast(err.message));
  });

  // ========= Criar =========
  openCreate.addEventListener("click", () => {
    clearCreateForm();
    createModal.classList.remove("hidden");
    document.getElementById("cName").focus();
  });

  createForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    cErrors.classList.add("hidden");
    cErrors.innerHTML = "";

    const name  = getVal("cName").trim();
    const email = getVal("cEmail").trim();
    const birth = formatToDDMMYYYY(getVal("cBirth"));
    const phone = normalizeDigits(getVal("cPhone"));
    const cpf   = normalizeDigits(getVal("cCpf"));

    // validações simples no front
    const errs = [];
    if (!name) errs.push("Nome é obrigatório.");
    if (!email) errs.push("E-mail é obrigatório.");
    if (!birth) errs.push("Data de nascimento é obrigatória.");
    if (phone.length < 8) errs.push("Telefone inválido.");
    if (cpf.length !== 11) errs.push("CPF deve ter 11 dígitos.");

    if (errs.length) {
      showFieldErrors(errs);
      return;
    }

    toggleCreateLoading(true);
    try {
      const res = await fetch("http://localhost:8080/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          birthDate: birth,      // dd/MM/yyyy (como seu DTO espera)
          phone,
          cpf
        }),
      });

      if (!res.ok) {
        // tenta extrair mensagens amigáveis de validação do backend
        let msg = "Erro ao criar usuário.";
        try {
          const data = await res.json();
          if (data?.errors) {
            msg = Object.values(data.errors).join("<br/>");
          } else if (data?.message) {
            msg = data.message;
          }
        } catch(_) {}
        showFieldErrors([msg]);
        return;
      }

      const created = await res.json();
      allUsers.unshift(created);
      render(allUsers);
      createModal.classList.add("hidden");
      showToast("Usuário criado!", { success: true });

    } catch (err) {
      showFieldErrors(["Erro de conexão."]);
      console.error(err);
    } finally {
      toggleCreateLoading(false);
    }
  });

  // fechar modais por botão "Cancelar" e clique no backdrop
  document.querySelectorAll("[data-close]").forEach(btn => {
    btn.addEventListener("click", e => {
      const sel = e.currentTarget.getAttribute("data-close");
      const modal = document.querySelector(sel);
      modal?.classList.add("hidden");
    });
  });
  [editModal, createModal].forEach(m => {
    m.addEventListener("click", (e) => { if (e.target === m) m.classList.add("hidden"); });
  });

  // ========= Utilitários de formulário =========
  function getVal(id){ return document.getElementById(id).value || ""; }

  function normalizeDigits(str=""){ return (str.match(/\d+/g) || []).join(""); }

  function formatToDDMMYYYY(dateStr){
    // se input type=date -> yyyy-mm-dd
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const [y,m,d] = parts;
      return `${d.padStart(2,"0")}/${m.padStart(2,"0")}/${y}`;
    }
    // se já vier dd/MM/yyyy, mantem
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
    return "";
  }

  function showFieldErrors(list){
    cErrors.innerHTML = list.map(m => `<div>• ${m}</div>`).join("");
    cErrors.classList.remove("hidden");
  }

  function clearCreateForm(){
    createForm.reset();
    cErrors.classList.add("hidden");
    cErrors.innerHTML = "";
  }

  function toggleCreateLoading(on){
    cSubmitBtn.disabled = !!on;
    cSubmitBtn.textContent = on ? "Enviando..." : "Criar";
  }

  // ========= Máscaras leves (opcional) =========
  const phoneInput = document.getElementById("cPhone");
  const cpfInput   = document.getElementById("cCpf");

  phoneInput.addEventListener("input", () => {
    let v = normalizeDigits(phoneInput.value).slice(0,11);
    if (v.length >= 11) phoneInput.value = v.replace(/(\d{2})(\d{5})(\d{4})/,"($1) $2-$3");
    else if (v.length >= 10) phoneInput.value = v.replace(/(\d{2})(\d{4})(\d{4})/,"($1) $2-$3");
    else if (v.length >= 6) phoneInput.value = v.replace(/(\d{2})(\d{0,5})/,"($1) $2");
    else phoneInput.value = v;
  });

  cpfInput.addEventListener("input", () => {
    let v = normalizeDigits(cpfInput.value).slice(0,11);
    if (v.length >= 10) cpfInput.value = v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/,"$1.$2.$3-$4");
    else if (v.length >= 7) cpfInput.value = v.replace(/(\d{3})(\d{3})(\d{0,3})/,"$1.$2.$3");
    else if (v.length >= 4) cpfInput.value = v.replace(/(\d{3})(\d{0,3})/,"$1.$2");
    else cpfInput.value = v;
  });

  // ========= Toast =========
  function showToast(message, opts = {}) {
    const toast = document.getElementById("toast");
    if(!toast) return;
    toast.textContent = message;
    toast.style.background = opts.success
      ? "linear-gradient(180deg, rgba(34,197,94,.95), rgba(22,163,74,.95))"
      : "linear-gradient(180deg, rgba(239,68,68,.95), rgba(220,38,38,.95))";
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2800);
  }
});
