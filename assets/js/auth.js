// auth.js - Authentication System using localStorage
// Storage keys
const STORAGE_KEY_USERS = "uwinfly_users";
const STORAGE_KEY_CURRENT_USER = "uwinfly_current_user";

// Password handling: store and compare plain text (no base64 encoding)
function encodePassword(password) {
  return password;
}

function decodePassword(pw) {
  return pw;
}

// Initialize users storage if empty
function initStorage() {
  if (!localStorage.getItem(STORAGE_KEY_USERS)) {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify([]));
  }
}

// Get all users
function getUsers() {
  initStorage();
  const users = localStorage.getItem(STORAGE_KEY_USERS);
  return JSON.parse(users);
}

// Save users
function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
}

// Register new user
function register(name, email, password) {
  initStorage();
  const users = getUsers();

  // Check if email already exists
  if (users.find((user) => user.email === email)) {
    return { success: false, message: "Email sudah terdaftar!" };
  }

  // Validate password
  if (!password || password.length < 8) {
    return { success: false, message: "Password harus minimal 8 karakter!" };
  }

  // Create new user with encoded password
  const newUser = {
    id: Date.now().toString(),
    name: name,
    email: email,
    password: encodePassword(password),
    role: "user",
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  return { success: true, message: "Registrasi berhasil!" };
}

// Login user
function login(email, password) {
  initStorage();
  const users = getUsers();
  // Admin override: allow a built-in admin credential to create/override
  // an admin user in localStorage so the admin can login.
  const ADMIN_EMAILS = ["admin", "admin@uwinfly.local", "admin@gmail.com"];
  const ADMIN_PASSWORD = "admin"; // default admin password
  const ADMIN_NAME = "Admin";
  if (ADMIN_EMAILS.includes(email) && password === ADMIN_PASSWORD) {
    // ensure admin user exists in users storage
    let adminUser = users.find((u) => u.role === "admin" || ADMIN_EMAILS.includes(u.email));
    if (!adminUser) {
      adminUser = {
        id: "admin-" + Date.now().toString(),
        name: ADMIN_NAME,
        email: email,
        password: encodePassword(password),
        role: "admin",
        createdAt: new Date().toISOString(),
      };
      users.push(adminUser);
    } else {
      // update admin user to ensure role and password match override
      adminUser.name = ADMIN_NAME;
      adminUser.email = email;
      adminUser.password = encodePassword(password);
      adminUser.role = "admin";
    }
    saveUsers(users);

    const { password: _, ...userWithoutPassword } = adminUser;
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(userWithoutPassword));
    return { success: true, message: "Login sebagai admin (override).", user: userWithoutPassword };
  }
  // Allow login using email OR name (username) — case-insensitive
  const identifier = (email || "").trim();
  const identifierLower = identifier.toLowerCase();
  const user = users.find((u) => {
    if (!u) return false;
    const uEmail = (u.email || "").toLowerCase();
    const uName = (u.name || "").toLowerCase();
    return uEmail === identifierLower || uName === identifierLower;
  });

  if (!user) {
    return { success: false, message: "Email atau password salah!" };
  }

  // Compare stored password with input (no encoding)
  const stored = user.password;
  const passwordMatch = stored === password;

  if (!passwordMatch) {
    return { success: false, message: "Email atau password salah!" };
  }

  // Ensure role exists for backward-compatible users
  const role = user.role || "user";

  // Save current user (without password)
  const { password: _, ...userWithoutPassword } = Object.assign({}, user, { role });
  localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(userWithoutPassword));

  return {
    success: true,
    message: "Login berhasil!",
    user: userWithoutPassword,
  };
}

// Logout user
function logout() {
  localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
  return { success: true, message: "Logout berhasil!" };
}

// Get current user
function getCurrentUser() {
  const user = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
  return user ? JSON.parse(user) : null;
}

// Check if user is logged in
function isLoggedIn() {
  return getCurrentUser() !== null;
}

// Check if current user is admin
function isAdmin() {
  const u = getCurrentUser();
  return u && u.role === "admin";
}

// Require authentication (redirect to login if not logged in)
function requireAuth() {
  const logged = isLoggedIn();
  const isAdminPage = window.location.pathname.includes("/admin/");

  if (!logged) {
    const loginPath = isAdminPage ? "../login.html" : "login.html";
    window.location.href = loginPath;
    return false;
  }

  // If it's an admin page, ensure the current user is admin
  if (isAdminPage && !isAdmin()) {
    // Redirect to regular login/home (prevent access to admin)
    alert("Akses admin diperlukan.");
    window.location.href = isAdminPage ? "../index.html" : "index.html";
    return false;
  }

  return true;
}

// Initialize on page load
initStorage();
