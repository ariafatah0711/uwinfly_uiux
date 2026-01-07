// Users management script (moved from admin/users.html)
// Requires: auth.js, admin.js, bootstrap

// Render, edit and delete users stored in localStorage
document.addEventListener("DOMContentLoaded", function () {
  if (!requireAuth()) return;

  const user = getCurrentUser();
  if (user) {
    const nameEl = document.getElementById("user-name");
    if (nameEl) nameEl.textContent = `Welcome, ${user.name}`;
  }

  // initial render
  renderUsers();
});

function renderUsers() {
  const users = JSON.parse(localStorage.getItem("uwinfly_users") || "[]");
  const container = document.getElementById("users-list");

  if (!container) return;

  if (users.length === 0) {
    container.innerHTML = '<p class="text-muted">No users found.</p>';
    return;
  }

  let tableHTML = `
		<table class="table table-bordered table-striped table-hover">
			<thead>
				<tr>
					<th style="width: 50px;">#</th>
					<th>Name</th>
					<th>Email</th>
					<th>Registered</th>
					<th style="width: 120px;">Actions</th>
				</tr>
			</thead>
			<tbody>
	`;

  users.forEach((userData, index) => {
    const createdAt = userData.createdAt
      ? new Date(userData.createdAt).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "-";

    tableHTML += `
			<tr>
				<td>${index + 1}</td>
				<td><strong>${escapeHtml(userData.name)}</strong></td>
				<td>${escapeHtml(userData.email)}</td>
				<td>${createdAt}</td>
				<td>
					<button class="btn btn-sm btn-primary" title="Edit" onclick="openEditModal('${userData.id}')">
						<i class="bi bi-pencil"></i>
					</button>
					<button class="btn btn-sm btn-danger" title="Delete" onclick="openDeleteModal('${userData.id}')">
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
}

// Simple HTML escape for insertion into table
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Message helper (show bootstrap alerts)
function showMessage(type, text, timeout = 4000) {
  const container = document.getElementById("users-message");
  if (!container) return;
  const id = "msg-" + Date.now();
  container.innerHTML = `
		<div id="${id}" class="alert alert-${type} alert-dismissible fade show" role="alert">
			${escapeHtml(text)}
			<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
		</div>
	`;
  if (timeout > 0)
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.classList.remove("show");
    }, timeout);
}

// Edit modal handling
let editingUserId = null;
let deletingUserId = null;

function openEditModal(id) {
  const users = JSON.parse(localStorage.getItem("uwinfly_users") || "[]");
  const user = users.find((u) => u.id === id);
  if (!user) return showMessage("warning", "User tidak ditemukan.");

  editingUserId = id;
  document.getElementById("edit-name").value = user.name || "";
  document.getElementById("edit-email").value = user.email || "";
  document.getElementById("edit-password").value = "";
  const modalEl = document.getElementById("editUserModal");
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

document.addEventListener("DOMContentLoaded", function () {
  const saveBtn = document.getElementById("edit-save");
  if (saveBtn) {
    saveBtn.addEventListener("click", function () {
      const users = JSON.parse(localStorage.getItem("uwinfly_users") || "[]");
      const idx = users.findIndex((u) => u.id === editingUserId);
      if (idx === -1) return showMessage("danger", "User tidak ditemukan.");

      const name = document.getElementById("edit-name").value.trim();
      const email = document.getElementById("edit-email").value.trim();
      const pw = document.getElementById("edit-password").value;

      if (!name) return showMessage("warning", "Nama tidak boleh kosong.");
      if (!email) return showMessage("warning", "Email tidak boleh kosong.");

      const exists = users.some((u, i) => i !== idx && (u.email || "").toLowerCase() === email.toLowerCase());
      if (exists) return showMessage("warning", "Email sudah dipakai oleh user lain.");

      users[idx].name = name;
      users[idx].email = email;
      if (pw) {
        if (pw.length < 8) return showMessage("warning", "Password minimal 8 karakter.");
        users[idx].password = encodePassword(pw);
      }

      localStorage.setItem("uwinfly_users", JSON.stringify(users));

      // update current user if same
      const current = JSON.parse(localStorage.getItem("uwinfly_current_user") || "null");
      if (current && current.id === users[idx].id) {
        const { password, ...withoutPw } = users[idx];
        localStorage.setItem("uwinfly_current_user", JSON.stringify(withoutPw));
        const nameEl = document.getElementById("user-name");
        if (nameEl) nameEl.textContent = `Welcome, ${withoutPw.name}`;
      }

      const modalEl = document.getElementById("editUserModal");
      bootstrap.Modal.getInstance(modalEl).hide();
      showMessage("success", "User berhasil diperbarui.");
      renderUsers();
    });
  }

  // delete confirm
  const delYes = document.getElementById("confirm-delete-yes");
  if (delYes) {
    delYes.addEventListener("click", function () {
      const users = JSON.parse(localStorage.getItem("uwinfly_users") || "[]");
      const idx = users.findIndex((u) => u.id === deletingUserId);
      if (idx === -1) {
        bootstrap.Modal.getInstance(document.getElementById("confirmDeleteModal")).hide();
        return showMessage("warning", "User tidak ditemukan.");
      }

      const removed = users.splice(idx, 1)[0];
      localStorage.setItem("uwinfly_users", JSON.stringify(users));

      const current = JSON.parse(localStorage.getItem("uwinfly_current_user") || "null");
      if (current && current.id === removed.id) {
        logout();
        bootstrap.Modal.getInstance(document.getElementById("confirmDeleteModal")).hide();
        window.location.href = "../login.html";
        return;
      }

      bootstrap.Modal.getInstance(document.getElementById("confirmDeleteModal")).hide();
      showMessage("success", "User dihapus.");
      renderUsers();
    });
  }
});

function openDeleteModal(id) {
  deletingUserId = id;
  const modalEl = document.getElementById("confirmDeleteModal");
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}
