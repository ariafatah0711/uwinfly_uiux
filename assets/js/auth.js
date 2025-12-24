// auth.js - Authentication System using localStorage

// Storage keys
const STORAGE_KEY_USERS = "uwinfly_users";
const STORAGE_KEY_CURRENT_USER = "uwinfly_current_user";

// Base64 encoding/decoding for password security
function encodePassword(password) {
  try {
    return btoa(unescape(encodeURIComponent(password)));
  } catch (e) {
    console.error("Error encoding password:", e);
    return password; // Fallback to plain if encoding fails
  }
}

function decodePassword(encodedPassword) {
  try {
    return decodeURIComponent(escape(atob(encodedPassword)));
  } catch (e) {
    // If decoding fails, might be plain password (backward compatibility)
    return encodedPassword;
  }
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
    password: encodePassword(password), // Encode password with base64
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

  // Find user by email
  const user = users.find((u) => u.email === email);

  if (!user) {
    return { success: false, message: "Email atau password salah!" };
  }

  // Decode stored password and compare
  const decodedPassword = decodePassword(user.password);
  const encodedInputPassword = encodePassword(password);

  // Check password (support both encoded and plain for backward compatibility)
  const passwordMatch = user.password === encodedInputPassword || decodedPassword === password;

  if (!passwordMatch) {
    return { success: false, message: "Email atau password salah!" };
  }

  // If password was stored as plain, encode it now for security
  if (decodedPassword === password && user.password === password) {
    user.password = encodePassword(password);
    saveUsers(users);
  }

  // Save current user (without password)
  const { password: _, ...userWithoutPassword } = user;
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

// Require authentication (redirect to login if not logged in)
function requireAuth() {
  if (!isLoggedIn()) {
    // Check if we're in admin folder
    const isAdminPage = window.location.pathname.includes("/admin/");
    const loginPath = isAdminPage ? "../login.html" : "login.html";
    window.location.href = loginPath;
    return false;
  }
  return true;
}

// Initialize on page load
initStorage();
