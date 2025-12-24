// admin.js - Admin Dashboard Functionality

// Check authentication on page load
document.addEventListener("DOMContentLoaded", function () {
  if (!requireAuth()) {
    return;
  }

  // Load user info
  loadUserInfo();

  // Load dashboard stats
  loadDashboardStats();

  // Load recent products
  loadRecentProducts();
});

// Load user info
function loadUserInfo() {
  const user = getCurrentUser();
  if (user) {
    const userNameEl = document.getElementById("user-name");
    if (userNameEl) {
      userNameEl.textContent = `Welcome, ${user.name}`;
    }
  }
}

// Load dashboard statistics
function loadDashboardStats() {
  // Load products count
  fetch("../data.json")
    .then((response) => response.json())
    .then((data) => {
      const productsCount = data.products ? data.products.length : 0;
      document.getElementById("stat-products").textContent = productsCount;
    })
    .catch((error) => {
      console.error("Error loading products:", error);
    });

  // Load users count
  const users = JSON.parse(localStorage.getItem("uwinfly_users") || "[]");
  document.getElementById("stat-users").textContent = users.length;

  // Mock data for orders and revenue (in real app, this would come from API)
  document.getElementById("stat-orders").textContent = "0";
  document.getElementById("stat-revenue").textContent = "Rp 0";
}

// Load recent products
function loadRecentProducts() {
  fetch("../data.json")
    .then((response) => response.json())
    .then((data) => {
      const container = document.getElementById("recent-products");
      if (!container) return;

      container.innerHTML = "";

      const products = data.products ? data.products.slice(0, 5) : [];

      if (products.length === 0) {
        container.innerHTML = '<p class="text-gray-500 dark:text-gray-400">No products found.</p>';
        return;
      }

      products.forEach((product) => {
        const productEl = document.createElement("div");
        productEl.className = "flex items-center gap-4 p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg";

        const priceFormatted = formatRupiah(product.price);

        productEl.innerHTML = `
                    <div class="w-16 h-16 bg-gray-200 dark:bg-neutral-700 rounded-lg bg-cover bg-center"
                         style="background-image: url('../${product.image}')"></div>
                    <div class="flex-1">
                        <h4 class="font-bold">${product.name}</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400">${product.category}</p>
                    </div>
                    <div class="text-right">
                        <p class="font-bold">${priceFormatted}</p>
                        <span class="text-xs px-2 py-1 rounded ${
                          product.stock === "available"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }">
                            ${product.stock === "available" ? "Available" : "Out of Stock"}
                        </span>
                    </div>
                `;

        container.appendChild(productEl);
      });
    })
    .catch((error) => {
      console.error("Error loading recent products:", error);
      const container = document.getElementById("recent-products");
      if (container) {
        container.innerHTML = '<p class="text-red-500">Error loading products.</p>';
      }
    });
}

// Handle logout
function handleLogout() {
  if (confirm("Apakah Anda yakin ingin logout?")) {
    logout();
    window.location.href = "../login.html";
  }
}

// Format Rupiah
function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
}
