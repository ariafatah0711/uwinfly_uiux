// admin.js - Admin Dashboard Functionality using AdminLTE

// Check authentication on page load
document.addEventListener("DOMContentLoaded", function () {
  if (!requireAuth()) {
    return;
  }

  // Load user info
  loadUserInfo();

  // Load dashboard stats (only on dashboard page)
  if (document.getElementById("stat-products")) {
    loadDashboardStats();
  }

  // Load recent products (only on dashboard page)
  if (document.getElementById("recent-products")) {
    loadRecentProducts();
  }
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
      const statProducts = document.getElementById("stat-products");
      if (statProducts) {
        statProducts.textContent = productsCount;
      }
    })
    .catch((error) => {
      console.error("Error loading products:", error);
    });

  // Load users count
  const users = JSON.parse(localStorage.getItem("uwinfly_users") || "[]");
  const statUsers = document.getElementById("stat-users");
  if (statUsers) {
    statUsers.textContent = users.length;
  }

  // Mock data for orders and revenue
  const statOrders = document.getElementById("stat-orders");
  if (statOrders) {
    statOrders.textContent = "0";
  }
  const statRevenue = document.getElementById("stat-revenue");
  if (statRevenue) {
    statRevenue.textContent = "Rp 0";
  }
}

// Load recent products
function loadRecentProducts() {
  fetch("../data.json")
    .then((response) => response.json())
    .then((data) => {
      const container = document.getElementById("recent-products");
      if (!container) return;

      const products = data.products ? data.products.slice(0, 5) : [];

      if (products.length === 0) {
        container.innerHTML = '<p class="text-muted">No products found.</p>';
        return;
      }

      // Create table
      let tableHTML = `
        <table class="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
      `;

      products.forEach((product) => {
        const priceFormatted = formatRupiah(product.price);
        const stockBadge =
          product.stock === "available"
            ? '<span class="badge bg-success">Available</span>'
            : '<span class="badge bg-danger">Out of Stock</span>';

        tableHTML += `
          <tr>
            <td><img src="../${product.image}" alt="${product.name}" style="width: 60px; height: 60px; object-fit: cover;" class="img-thumbnail"></td>
            <td><strong>${product.name}</strong></td>
            <td>${product.category}</td>
            <td>${priceFormatted}</td>
            <td>${stockBadge}</td>
            <td>⭐ ${product.rating}</td>
          </tr>
        `;
      });

      tableHTML += `
          </tbody>
        </table>
      `;

      container.innerHTML = tableHTML;
    })
    .catch((error) => {
      console.error("Error loading recent products:", error);
      const container = document.getElementById("recent-products");
      if (container) {
        container.innerHTML = '<p class="text-danger">Error loading products.</p>';
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
