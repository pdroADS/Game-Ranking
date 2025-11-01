document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("resetForm");
  const emailInput = document.getElementById("email-reset");
  const novaSenhaInput = document.getElementById("nova-senha");
  const confirmaSenhaInput = document.getElementById("confirmar-senha");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const novaSenha = novaSenhaInput.value.trim();
    const confirmaSenha = confirmaSenhaInput.value.trim();

    if (!email || !novaSenha || !confirmaSenha) {
      alert("Preencha todos os campos.");
      return;
    }

    if (novaSenha !== confirmaSenha) {
      alert("As senhas não coincidem.");
      return;
    }

    // Envia requisição para o servidor
    try {
      const res = await fetch("/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: novaSenha }),
      });

      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        alert(data.message);
        window.location.href = "/login.html";
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao redefinir a senha.");
    }
  });
});
