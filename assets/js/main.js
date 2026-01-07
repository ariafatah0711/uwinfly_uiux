// main.js for U WINFLY Frontend Interactivity
document.addEventListener("DOMContentLoaded", function () {
  // --- Load Products from JSON ---
  loadProducts();

  // Update cart count
  updateCartCount();

  // --- Carousel Interactivity (Manual Scroll) ---
  const carousel = document.querySelector(".flex.overflow-x-auto");
  if (carousel) {
    let isDown = false;
    let startX, scrollLeft;
    carousel.addEventListener("mousedown", (e) => {
      isDown = true;
      carousel.classList.add("cursor-grabbing");
      startX = e.pageX - carousel.offsetLeft;
      scrollLeft = carousel.scrollLeft;
    });
    carousel.addEventListener("mouseleave", () => {
      isDown = false;
      carousel.classList.remove("cursor-grabbing");
    });
    carousel.addEventListener("mouseup", () => {
      isDown = false;
      carousel.classList.remove("cursor-grabbing");
    });
    carousel.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - carousel.offsetLeft;
      const walk = (x - startX) * 2; //scroll-fast
      carousel.scrollLeft = scrollLeft - walk;
    });
  }
});

// --- Load and Display Products ---
async function loadProducts() {
  try {
    const response = await fetch("data.json");
    const data = await response.json();
    const productGrid = document.getElementById("product-grid");
    // expose products globally for cart page or other scripts
    window.__uwinfly_products = data.products || [];

    if (productGrid && data.products) {
      // Clear existing products
      productGrid.innerHTML = "";

      // Check if we're on index.html (limit to 3 products) or catalog.html (show all)
      const isCatalogPage = window.location.pathname.includes("catalog.html");
      const productsToShow = isCatalogPage ? data.products : data.products.slice(0, 3);

      // Render products
      productsToShow.forEach((product) => {
        const productCard = createProductCard(product);
        productGrid.appendChild(productCard);
      });

      // update cart buttons/count after rendering
      updateCartCount();
    }
  } catch (error) {
    console.error("Error loading products:", error);
  }
}

// --- Create Product Card HTML ---
function createProductCard(product) {
  const card = document.createElement("div");
  card.className =
    "group bg-white dark:bg-neutral-900 rounded-2xl p-4 transition-all hover:shadow-xl hover:-translate-y-1 border border-gray-100 dark:border-neutral-800";

  const stockBadge =
    product.stock === "out_of_stock"
      ? '<span class="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">Habis</span>'
      : "";

  const priceFormatted = formatRupiah(product.price);
  const soldText = product.sold >= 1000 ? `${(product.sold / 1000).toFixed(1)}RB+ terjual` : `${product.sold} terjual`;

  card.innerHTML = `
    <div class="relative w-full aspect-square bg-gray-100 dark:bg-neutral-800 rounded-xl overflow-hidden mb-4">
      ${stockBadge}
      <div class="absolute top-3 right-3 z-10 bg-white dark:bg-black/50 backdrop-blur rounded-full p-2 cursor-pointer hover:text-red-500 transition-colors">
        <span class="material-symbols-outlined text-xl">favorite</span>
      </div>
      <div class="w-full h-full bg-center bg-cover bg-no-repeat transition-transform duration-700 group-hover:scale-110"
        style='background-image: url("${product.image}");'>
      </div>
    </div>
    <div class="space-y-2">
      <div class="flex justify-between items-start">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
          ${product.name}
        </h3>
        <span class="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded">${product.category}</span>
      </div>
      <p class="text-sm text-slate-500 dark:text-gray-400">${product.description}</p>
      <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400">
        <span class="material-symbols-outlined text-yellow-500 text-sm">star</span>
        <span>${product.rating}</span>
        <span class="text-slate-400">•</span>
        <span>${soldText}</span>
      </div>
      <div class="flex items-center justify-between pt-2">
        <p class="text-xl font-bold text-slate-900 dark:text-white">${priceFormatted}</p>
        <button
          class="rounded-lg bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white px-4 py-2 text-sm font-bold transition-colors ${
            product.stock === "out_of_stock" ? "opacity-50 cursor-not-allowed" : ""
          }"
          ${product.stock === "out_of_stock" ? "disabled" : ""}
          onclick="addToCart(${product.id})">
          ${product.stock === "out_of_stock" ? "Habis" : "Add to Cart"}
        </button>
      </div>
    </div>
  `;

  return card;
}

// --- Format Rupiah ---
function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
}

// --- Cart Utilities ---
const CART_KEY = "uwinfly_cart";

function getCart() {
  const user = getCurrentUser();
  if (!user) return [];
  return user.cart || [];
}

function saveCart(cart) {
  const user = getCurrentUser();
  if (!user) return;

  // Update user's cart in uwinfly_users
  const users = JSON.parse(localStorage.getItem("uwinfly_users") || "[]");
  const userIndex = users.findIndex((u) => u.id === user.id);
  if (userIndex !== -1) {
    users[userIndex].cart = cart;
    localStorage.setItem("uwinfly_users", JSON.stringify(users));
    // Update current user in session
    user.cart = cart;
    localStorage.setItem("uwinfly_current_user", JSON.stringify(user));
  }
  updateCartCount();

  // Trigger navbar update to refresh cart count
  if (window.renderNavbar) {
    window.renderNavbar();
  }
}

function addToCart(productId) {
  // Check if user is logged in
  if (!isLoggedIn()) {
    alert("Silakan login terlebih dahulu untuk menambahkan ke keranjang!");
    window.location.href = "login.html";
    return;
  }

  // Ensure products loaded
  const products = window.__uwinfly_products || [];
  const product = products.find((p) => p.id === productId);
  if (!product) {
    alert("Produk tidak ditemukan.");
    return;
  }

  if (product.stock === "out_of_stock") {
    alert("Produk sedang habis.");
    return;
  }

  const cart = getCart();
  const existing = cart.find((c) => c.id === productId);
  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }
  saveCart(cart);

  // small feedback
  showToast("Berhasil ditambahkan ke keranjang");
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter((c) => c.id !== productId);
  saveCart(cart);
}

function changeQuantity(productId, qty) {
  const cart = getCart();
  const item = cart.find((c) => c.id === productId);
  if (!item) return;
  item.quantity = Math.max(1, qty);
  saveCart(cart);
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((s, it) => s + (it.quantity || 0), 0);
  const badge = document.getElementById("uw-cart-count");
  if (badge) badge.textContent = String(count);
}

function showToast(message, timeout = 1800) {
  const t = document.createElement("div");
  t.className = "fixed right-6 top-20 z-60 bg-black/80 text-white px-4 py-2 rounded-lg";
  t.textContent = message;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), timeout);
}
