// Products management script (moved from admin/products.html)
// Requires: auth.js, admin.js, bootstrap

document.addEventListener("DOMContentLoaded", function () {
  if (!requireAuth()) return;

  const user = getCurrentUser();
  if (user) {
    const nameEl = document.getElementById("user-name");
    if (nameEl) nameEl.textContent = `Welcome, ${user.name}`;
  }

  // Load products
  fetch("../data.json")
    .then((response) => response.json())
    .then((data) => {
      const container = document.getElementById("products-list");
      if (!container) return;

      const products = data.products || [];

      if (products.length === 0) {
        container.innerHTML = '<p class="text-muted">No products found.</p>';
        return;
      }

      let tableHTML = `
          <table class="table table-bordered table-striped table-hover">
            <thead>
              <tr>
                <th style="width: 100px;">Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Rating</th>
                <th>Sold</th>
                <th>Stock</th>
                <th style="width: 120px;">Actions</th>
              </tr>
            </thead>
            <tbody>
        `;

      products.forEach((product) => {
        const priceFormatted = new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(product.price);

        const stockBadge =
          product.stock === "available"
            ? '<span class="badge bg-success">Available</span>'
            : '<span class="badge bg-danger">Out of Stock</span>';

        tableHTML += `
            <tr>
              <td><img src="../${product.image}" alt="${escapeHtml(
          product.name
        )}" style="width: 80px; height: 80px; object-fit: cover;" class="img-thumbnail"></td>
              <td><strong>${escapeHtml(product.name)}</strong><br><small class="text-muted">${escapeHtml(
          product.description
        )}</small></td>
              <td>${escapeHtml(product.category)}</td>
              <td>${priceFormatted}</td>
              <td>⭐ ${escapeHtml(String(product.rating))}</td>
              <td>${escapeHtml(String(product.sold))}</td>
              <td>${stockBadge}</td>
              <td>
                <button class="btn btn-sm btn-primary" title="Edit">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" title="Delete">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          `;
      });

      tableHTML += `
            </tbody>
          </table>
        `;

      container.innerHTML = tableHTML;
      // Attach click handlers: show alert for Edit/Delete actions
      container.addEventListener("click", function (ev) {
        const btn = ev.target.closest('button[title="Edit"], button[title="Delete"]');
        if (!btn) return;
        ev.preventDefault();
        const action = btn.getAttribute("title") || "Action";
        alert('Fitur "' + action + '" belum tersedia.');
      });
    })
    .catch((error) => {
      console.error("Error loading products:", error);
      const el = document.getElementById("products-list");
      if (el) el.innerHTML = '<p class="text-danger">Error loading products.</p>';
    });
});

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
