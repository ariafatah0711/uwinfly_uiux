// cart.js - Cart page functionality
function getCartLocal() {
  const user = getCurrentUser();
  if (!user) return [];
  return user.cart || [];
}

async function fetchProducts() {
  try {
    const res = await fetch("data.json");
    const d = await res.json();
    return d.products || [];
  } catch (e) {
    console.error(e);
    return [];
  }
}

function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
}

// Orders localStorage helpers
function getOrdersLocal() {
  return JSON.parse(localStorage.getItem("uwinfly_orders") || "[]");
}

function saveOrdersLocal(orders) {
  localStorage.setItem("uwinfly_orders", JSON.stringify(orders));
}

function renderCart(products, cart) {
  const root = document.getElementById("cart-root");
  const summary = document.getElementById("cart-summary");
  const emptyState = document.getElementById("empty-state");
  const emptyMsg = document.getElementById("empty-msg");

  if (!root) return;

  // Remove previously rendered item rows (preserve empty-state / empty-msg)
  const preservedIds = new Set(["empty-state", "empty-msg"]);
  const preserved = [];
  for (const child of Array.from(root.children)) {
    if (child.id && preservedIds.has(child.id)) {
      preserved.push(child);
    }
  }
  // Clear root and re-append preserved nodes in original order
  root.innerHTML = "";
  preserved.forEach((n) => root.appendChild(n));

  // Handle empty cart
  if (!cart || cart.length === 0) {
    if (emptyState) emptyState.classList.remove("hidden");
    if (emptyMsg) emptyMsg.classList.add("hidden");
    if (summary) summary.classList.add("hidden");
    return;
  }

  // Hide empty state and show items
  if (emptyState) emptyState.classList.add("hidden");
  if (emptyMsg) emptyMsg.classList.add("hidden");

  let total = 0;
  cart.forEach((item) => {
    const p = products.find((pp) => pp.id === item.id);
    if (!p) return;
    const row = document.createElement("div");
    row.className =
      "bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-gray-100 dark:border-neutral-800 flex items-center gap-4";

    const img = document.createElement("div");
    img.className = "w-32 h-20 bg-center bg-cover rounded-lg";
    img.style.backgroundImage = `url(${p.image})`;

    const info = document.createElement("div");
    info.className = "flex-1";
    info.innerHTML = `<div class="flex justify-between items-start"><div><h3 class="font-bold">${
      p.name
    }</h3><p class="text-sm text-gray-500">${p.category}</p></div><div class="text-lg font-bold">${formatRupiah(
      p.price
    )}</div></div><p class="text-sm text-gray-500 mt-2">${p.description}</p>`;

    const controls = document.createElement("div");
    controls.className = "flex flex-col items-end gap-2";

    const qtyWrap = document.createElement("div");
    qtyWrap.className = "flex items-center gap-2";
    const dec = document.createElement("button");
    dec.className = "px-2 py-1 border rounded";
    dec.textContent = "-";
    dec.onclick = () => {
      const freshCart = getCartLocal();
      const freshItem = freshCart.find((c) => c.id === item.id);
      if (freshItem) {
        freshItem.quantity = Math.max(1, freshItem.quantity - 1);
        saveCartLocal(freshCart);
        refresh();
      }
    };
    const qty = document.createElement("span");
    qty.textContent = String(item.quantity);
    const inc = document.createElement("button");
    inc.className = "px-2 py-1 border rounded";
    inc.textContent = "+";
    inc.onclick = () => {
      const freshCart = getCartLocal();
      const freshItem = freshCart.find((c) => c.id === item.id);
      if (freshItem) {
        freshItem.quantity = (freshItem.quantity || 1) + 1;
        saveCartLocal(freshCart);
        refresh();
      }
    };
    qtyWrap.appendChild(dec);
    qtyWrap.appendChild(qty);
    qtyWrap.appendChild(inc);

    const remove = document.createElement("button");
    remove.className = "text-sm text-red-500";
    remove.textContent = "Hapus";
    remove.onclick = () => {
      const newCart = getCartLocal().filter((c) => c.id !== item.id);
      saveCartLocal(newCart);
      refresh();
    };

    controls.appendChild(qtyWrap);
    controls.appendChild(remove);

    row.appendChild(img);
    row.appendChild(info);
    row.appendChild(controls);

    root.appendChild(row);

    total += p.price * (item.quantity || 1);
  });

  const totalEl = document.getElementById("cart-total");
  if (totalEl) totalEl.textContent = formatRupiah(total);
  if (summary) summary.classList.remove("hidden");
}

function saveCartLocal(cartParam) {
  const user = getCurrentUser();
  if (!user) {
    alert("Silakan login terlebih dahulu!");
    window.location.href = "login.html";
    return;
  }

  const c = cartParam || getCartLocal();

  // Update user's cart in uwinfly_users
  const users = JSON.parse(localStorage.getItem("uwinfly_users") || "[]");
  const userIndex = users.findIndex((u) => u.id === user.id);
  if (userIndex !== -1) {
    users[userIndex].cart = c;
    localStorage.setItem("uwinfly_users", JSON.stringify(users));
    // Update current user in session
    user.cart = c;
    localStorage.setItem("uwinfly_current_user", JSON.stringify(user));
  }

  // Trigger navbar update to refresh cart count
  if (window.renderNavbar) {
    window.renderNavbar();
  }
}

async function refresh() {
  const products = await fetchProducts();
  const cart = getCartLocal();
  renderCart(products, cart);
  // update floating count if present
  if (window.updateCartCount) window.updateCartCount();
}

// Checkout Modal Handler
function generateFakeQRIS(amount) {
  // Fake QRIS string (00020126 is standard QR header)
  const timestamp = Date.now().toString().slice(-6);
  return `00020126360014br.gov.bcb.brcode0136123456789${timestamp}5204481153039651065407${String(amount).padStart(
    10,
    "0"
  )}6304${Math.random().toString(16).slice(2, 6).toUpperCase()}`;
}

let currentCheckoutTotal = 0;

document.addEventListener("DOMContentLoaded", function () {
  // Check if logged in, redirect if not
  if (!isLoggedIn()) {
    alert("Silakan login terlebih dahulu untuk melihat keranjang!");
    window.location.href = "login.html";
  }

  const checkoutBtn = document.getElementById("checkout-btn");
  const checkoutModal = document.getElementById("checkout-modal");
  const closeCheckoutBtn = document.getElementById("close-checkout");
  const confirmPaymentBtn = document.getElementById("confirm-payment");

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
      const cart = getCartLocal();
      if (!cart || cart.length === 0) {
        alert("Keranjang Anda kosong!");
        return;
      }

      // Calculate total
      const products = window.__uwinfly_products || [];
      let total = 0;
      cart.forEach((item) => {
        const p = products.find((pp) => pp.id === item.id);
        if (p) total += p.price * (item.quantity || 1);
      });

      currentCheckoutTotal = total;

      // Generate reference and save a pending order
      const refNumber = Math.random().toString(36).substring(2, 11).toUpperCase();
      const user = getCurrentUser();
      const order = {
        id: `order_${Date.now()}`,
        refNumber,
        userId: user?.id || null,
        items: cart,
        total,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      const orders = getOrdersLocal();
      orders.push(order);
      saveOrdersLocal(orders);

      // Show modal
      checkoutModal.classList.remove("hidden");

      // Generate QR Code
      document.getElementById("qr-code-container").innerHTML = "";
      const qrisData = generateFakeQRIS(total);
      new QRCode(document.getElementById("qr-code-container"), {
        text: qrisData,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H,
      });

      // Update display
      document.getElementById("checkout-total").textContent = formatRupiah(total);
      document.getElementById("ref-number").textContent = refNumber;
    });
  }

  if (closeCheckoutBtn) {
    closeCheckoutBtn.addEventListener("click", function () {
      checkoutModal.classList.add("hidden");
    });
  }

  if (confirmPaymentBtn) {
    confirmPaymentBtn.addEventListener("click", function () {
      alert("Pembayaran berhasil! Terima kasih telah berbelanja. Keranjang Anda telah dikosongkan.");

      // Clear cart
      const ref = document.getElementById("ref-number").textContent;
      // Mark order as paid
      const orders = getOrdersLocal();
      const idx = orders.findIndex((o) => o.refNumber === ref);
      if (idx !== -1) {
        orders[idx].status = "sudah bayar";
        orders[idx].paidAt = new Date().toISOString();
        saveOrdersLocal(orders);
      }

      const user = getCurrentUser();
      if (user) {
        user.cart = [];
        const users = JSON.parse(localStorage.getItem("uwinfly_users") || "[]");
        const userIndex = users.findIndex((u) => u.id === user.id);
        if (userIndex !== -1) {
          users[userIndex].cart = [];
          localStorage.setItem("uwinfly_users", JSON.stringify(users));
          localStorage.setItem("uwinfly_current_user", JSON.stringify(user));
        }
      }

      checkoutModal.classList.add("hidden");
      // Refresh UI and navbar
      refresh();
      window.location.href = "index.html";
    });
  }

  // Close modal when clicking outside
  if (checkoutModal) {
    checkoutModal.addEventListener("click", function (e) {
      if (e.target === this) {
        this.classList.add("hidden");
      }
    });
  }

  // Initial render
  refresh();
});
