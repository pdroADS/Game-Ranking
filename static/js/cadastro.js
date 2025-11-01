document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#registerForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.querySelector("#usuario").value;
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#senha-cadastro").value;

    const res = await fetch("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();

    if (data.message) {
      alert(data.message);
      window.location.href = "/login.html"; // redireciona para login
    } else {
      alert(data.error);
    }
  });
});
