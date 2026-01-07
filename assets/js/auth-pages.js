// auth-pages.js - Login and Register page functionality

function handleLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const result = login(email, password);

    if (result.success) {
      alert(result.message);
      // Redirect based on role: admin -> admin dashboard, user -> home
      const user = result.user || getCurrentUser();
      if (user && user.role === "admin") {
        window.location.href = new URLSearchParams(window.location.search).get("redirect") || "admin/index.html";
      } else {
        window.location.href = "index.html";
      }
    } else {
      alert(result.message);
    }
  });
}

function handleRegisterForm() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Validate password length
    if (password.length < 8) {
      alert("Password harus minimal 8 karakter!");
      return;
    }

    const result = register(name, email, password);

    if (result.success) {
      alert(result.message);
      // Auto login after registration
      const loginResult = login(email, password);
      if (loginResult.success) {
        const user = loginResult.user || getCurrentUser();
        if (user && user.role === "admin") {
          window.location.href = "admin/index.html";
        } else {
          window.location.href = "index.html";
        }
      }
    } else {
      alert(result.message);
    }
  });
}

function handleAdminCredentialsToggle() {
  const toggleBtn = document.getElementById("toggleAdminCreds");
  const adminCreds = document.getElementById("adminCreds");
  const copyBtn = document.getElementById("copyAdminCreds");

  if (toggleBtn && adminCreds) {
    toggleBtn.addEventListener("click", function () {
      adminCreds.classList.toggle("hidden");
      this.textContent = adminCreds.classList.contains("hidden")
        ? "Show admin credentials (for assignment)"
        : "Hide admin credentials";
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      const emailInput = document.getElementById("email");
      const pwInput = document.getElementById("password");
      if (emailInput && pwInput) {
        emailInput.value = "admin";
        pwInput.value = "admin";
      }
    });
  }
}

function checkAlreadyLoggedIn() {
  // Check if already logged in and redirect based on role
  if (isLoggedIn()) {
    const u = getCurrentUser();
    if (u && u.role === "admin") {
      window.location.href = "admin/index.html";
    } else {
      window.location.href = "index.html";
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Check what page we're on and handle accordingly
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (loginForm) {
    handleLoginForm();
    handleAdminCredentialsToggle();
  }

  if (registerForm) {
    handleRegisterForm();
  }

  // Check if already logged in
  checkAlreadyLoggedIn();
});
