// navbar.js - Reusable navbar component
function renderNavbar(options = {}) {
  const {
    logo = "assets/image/logo.jpg",
    title = "U WINFLY",
    homeLink = "index.html",
    catalogLink = "catalog.html",
    contactLink = "index.html#contact",
    isAdminPage = false,
  } = options;

  const authNav = document.getElementById("auth-nav");
  if (!authNav) return;

  // Render auth section based on login status
  if (isLoggedIn()) {
    const user = getCurrentUser();
    let adminLink = "";

    // Show admin link if user is admin (icon only)
    if (typeof isAdmin === "function" && isAdmin()) {
      const adminHref = isAdminPage ? "index.html" : "admin/index.html";
      const adminTitle = isAdminPage ? "Back to Home" : "Admin Panel";
      adminLink = `
        <a href="${adminHref}" title="${adminTitle}" class="p-2 rounded-lg hover:bg-primary/20 text-primary transition-colors">
          <span class="material-symbols-outlined text-xl">admin_panel_settings</span>
        </a>`;
    }

    // Cart link with count (icon only)
    const cartCount = getCartCount();
    const cartLink = `
      <a href="cart.html" title="Shopping Cart" class="relative p-2 rounded-lg hover:bg-primary/20 text-primary transition-colors">
        <span class="material-symbols-outlined text-xl">shopping_cart</span>
        ${
          cartCount > 0
            ? `<span class="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">${cartCount}</span>`
            : ""
        }
      </a>`;

    // Profile dropdown
    const profileDropdown = `
      <div class="relative group">
        <button title="Profile" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2">
          <span class="material-symbols-outlined text-xl text-gray-600 dark:text-gray-400">person</span>
        </button>
        <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 rounded-lg shadow-xl border border-gray-200 dark:border-neutral-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div class="px-4 py-3 border-b border-gray-200 dark:border-neutral-800">
            <p class="text-sm font-medium text-gray-900 dark:text-white">${user.name}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">${user.email}</p>
          </div>
          <a href="javascript:void(0)" onclick="handleNavLogout()" class="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <span class="material-symbols-outlined text-sm">logout</span>
            Logout
          </a>
        </div>
      </div>`;

    // User info and logout
    authNav.innerHTML = `${adminLink}
      ${cartLink}
      ${profileDropdown}`;
  } else {
    // Not logged in - show login and register links
    authNav.innerHTML = `
      <a href="login.html" class="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition-colors">
        Login
      </a>
      <a href="register.html" class="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-medium transition-colors shadow-md shadow-primary/20">
        Register
      </a>`;
  }
}

function handleNavLogout() {
  if (confirm("Apakah Anda yakin ingin logout?")) {
    logout();
    window.location.reload();
  }
}

function getCartCount() {
  const user = getCurrentUser();
  if (!user || !user.cart) return 0;
  return user.cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
}

// Initialize navbar when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  renderNavbar();

  // Listen for cart updates to refresh count
  if (window.addEventListener) {
    window.addEventListener("cartUpdated", function () {
      renderNavbar();
    });
  }
});
