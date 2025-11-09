// Form login
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const result = await loginUserBackend(email, password);
    if (result) setTimeout(() => (window.location.href = "index.html"), 1000);
  });
}

// Form register
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const phone = document.getElementById("regPhone").value.trim();
    const password = document.getElementById("regPassword").value.trim();
    await registerUserBackend(name, email, phone, password);
    registerForm.reset();
  });
}

async function registerUserBackend(name, email, phone, password) {
  try {
    const res = await fetch("http://127.0.0.1:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password }),
    });

    console.log("📨 Status:", res.status);
    const data = await res.json();
    console.log("📨 Response:", data);

    if (res.ok) {
      alert("✅ Registrasi berhasil!");
      return true;
    } else {
      alert("⚠️ Gagal registrasi: " + data.message);
      return false;
    }
  } catch (err) {
    console.error("❌ Error koneksi ke backend:", err);
    alert("Terjadi kesalahan koneksi ke server!");
    return false;
  }
}
