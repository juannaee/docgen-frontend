document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("jwtToken");
  const btnBack = document.getElementById("btnBack");
  const toast = document.getElementById("toast");
  const skeleton = document.getElementById("skeleton");

  if (!token) {
    showToast("Você precisa estar logado.", true);
    window.location.href = "/index.html";
    return;
  }

  try {
    const res = await fetch("http://localhost:8080/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Erro ao buscar perfil");

    const user = await res.json();
    fillProfile(user);
  } catch (err) {
    console.error(err);
    showToast("Erro ao carregar perfil.", true);
  } finally {
    skeleton.classList.add("hidden");
  }

  btnBack.addEventListener("click", () => {
    window.location.href = "/dashboard/dashboard.html";
  });

  document.getElementById("copyEmailBtn")?.addEventListener("click", async () => {
    const email = document.getElementById("profileEmail").textContent.trim();
    try{
      await navigator.clipboard.writeText(email);
      showToast("Email copiado!");
    }catch{
      showToast("Não foi possível copiar.", true);
    }
  });

  function fillProfile(user){
    const name = user.name || "-";
    const email = user.email || "-";
    const phone = user.phone || "-";
    const role = (user.role || "-").toString().toUpperCase();
    const reset = !!user.passwordResetRequired;

    document.getElementById("profileName").textContent = name;
    document.getElementById("profileEmail").textContent = email;
    document.getElementById("profilePhone").textContent = phone;

    const badge = document.getElementById("roleBadge");
    badge.textContent = role === "ADMIN" ? "Admin" : "User";
    badge.classList.toggle("is-admin", role === "ADMIN");

    const resetBadge = document.getElementById("resetBadge");
    resetBadge.classList.toggle("hidden", !reset);

    const avatar = document.getElementById("avatar");
    avatar.textContent = initials(name || email);
  }

  function initials(str=""){
    return str.trim().split(/\s+/).slice(0,2).map(p=>p[0]?.toUpperCase()||"").join("") || "--";
  }

  function showToast(msg, isError=false){
    toast.textContent = msg;
    toast.classList.toggle("error", !!isError);
    toast.classList.add("show");
    setTimeout(()=> toast.classList.remove("show"), 2600);
  }
});
