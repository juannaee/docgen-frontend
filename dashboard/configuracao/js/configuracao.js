document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("userCardsContainer");
  const modal = document.getElementById("editModal");
  const form = document.getElementById("editUserForm");
  const closeModalBtn = document.getElementById("closeModal");

  // Requisição para buscar todos os usuários
  fetch("http://localhost:8080/users", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Erro ao buscar usuários");
      return res.json();
    })
    .then((users) => {
      users.forEach((user) => {
        const card = document.createElement("div");
        card.classList.add("user-card");

        // Cria conteúdo HTML do card com botão e ícone SVG
        card.innerHTML = `
          <h2>${user.name}</h2>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Telefone:</strong> ${user.phone || "-"}</p>
          <p><strong>Função:</strong> ${user.role || "-"}</p>
          <button class="btn edit-btn" data-user='${JSON.stringify(user)}'>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" class="icon"
            style="width:16px;height:16px;vertical-align:middle;margin-right:5px;">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
          </svg>
</button>
        `;

        container.appendChild(card);
      });

      // Adiciona eventos aos botões "Editar"
      container.querySelectorAll(".edit-btn").forEach((button) => {
        button.addEventListener("click", () => {
          const user = JSON.parse(button.getAttribute("data-user"));
          openEditModal(user);
        });
      });
    })
    .catch((err) => {
      container.innerHTML = `<p style="color:red;">Erro: ${err.message}</p>`;
    });

  // Função para abrir modal com os dados preenchidos
  function openEditModal(user) {
    document.getElementById("editUserId").value = user.id;
    document.getElementById("editName").value = user.name;
    document.getElementById("editPhone").value = user.phone || "";
    document.getElementById("editEmail").value = user.email;
    document.getElementById("editRole").value = user.role;
    modal.classList.remove("hidden");
  }

  // Botão de fechar o modal
  closeModalBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // Submissão do formulário de edição
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const id = document.getElementById("editUserId").value;
    const name = document.getElementById("editName").value;
    const phone = document.getElementById("editPhone").value;

    fetch(`http://localhost:8080/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      },
      body: JSON.stringify({ name, phone }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao atualizar usuário");
        return res.json();
      })
      .then(() => {
        modal.classList.add("hidden");
        location.reload(); // Atualiza a lista após editar
      })
      .catch((err) => alert("Erro: " + err.message));
  });
});
