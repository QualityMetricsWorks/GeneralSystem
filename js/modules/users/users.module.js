import {
  getCompanyUsers,
  updateCompanyUserRole,
  setCompanyUserStatus
} from "../../services/users.service.js";

const ROLE_LABELS = {
  administrator: "Administrator",
  manager: "Manager",
  supervisor: "Supervisor",
  guest: "Guest"
};

const STATUS_LABELS = {
  active: "Active",
  inactive: "Inactive",
  invited: "Invited"
};

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function canAccess(identity) {
  return ["administrator", "manager"].includes(identity?.role);
}

function canManage(identity, user) {
  if (!identity || identity.user_id === user.user_id) return false;

  if (identity.role === "administrator") {
    return ["manager", "supervisor", "guest"].includes(user.role);
  }

  if (identity.role === "manager") {
    return ["supervisor", "guest"].includes(user.role);
  }

  return false;
}

function allowedRoles(identity) {
  if (identity.role === "administrator") {
    return ["manager", "supervisor", "guest"];
  }
  if (identity.role === "manager") {
    return ["supervisor", "guest"];
  }
  return [];
}

function renderStats(users) {
  const values = {
    total: users.length,
    active: users.filter(u => u.status === "active").length,
    inactive: users.filter(u => u.status === "inactive").length,
    invited: users.filter(u => u.status === "invited").length
  };

  return `
    <div class="users-stats">
      <div class="stat-card"><span>Total users</span><strong>${values.total}</strong></div>
      <div class="stat-card"><span>Active</span><strong>${values.active}</strong></div>
      <div class="stat-card"><span>Inactive</span><strong>${values.inactive}</strong></div>
      <div class="stat-card"><span>Invited</span><strong>${values.invited}</strong></div>
    </div>`;
}

function renderRows(users, identity) {
  if (!users.length) {
    return `<tr><td colspan="6" class="empty">No users match the current search or filters.</td></tr>`;
  }

  return users.map(user => {
    const manageable = canManage(identity, user);
    return `
      <tr>
        <td>
          <div class="user-name">${escapeHtml(user.display_name || "Unnamed user")}</div>
          <div class="user-email">${escapeHtml(user.email || "No email stored")}</div>
        </td>
        <td><span class="role role-${escapeHtml(user.role)}">${ROLE_LABELS[user.role] || escapeHtml(user.role || "—")}</span></td>
        <td><span class="status status-${escapeHtml(user.status)}">${STATUS_LABELS[user.status] || escapeHtml(user.status || "—")}</span></td>
        <td>${formatDate(user.updated_at)}</td>
        <td>${formatDate(user.created_at)}</td>
        <td>
          ${manageable
            ? `<button class="table-action action-enabled" type="button" data-user-action="${escapeHtml(user.user_id)}">Manage</button>`
            : `<span class="action-muted">—</span>`
          }
        </td>
      </tr>`;
  }).join("");
}

function openUserDialog(user, identity) {
  const dialog = document.createElement("div");
  dialog.className = "user-dialog-backdrop";

  const roles = allowedRoles(identity);
  const roleOptions = roles.map(role =>
    `<option value="${role}" ${user.role === role ? "selected" : ""}>${ROLE_LABELS[role]}</option>`
  ).join("");

  const statusOptions = ["active", "inactive"].map(status =>
    `<option value="${status}" ${user.status === status ? "selected" : ""}>${STATUS_LABELS[status]}</option>`
  ).join("");

  dialog.innerHTML = `
    <div class="user-dialog" role="dialog" aria-modal="true">
      <div class="user-dialog-header">
        <div>
          <p class="eyebrow">User management</p>
          <h2>${escapeHtml(user.display_name || user.email || "User")}</h2>
          <p class="muted">${escapeHtml(user.email || "")}</p>
        </div>
        <button class="dialog-close" type="button" aria-label="Close">×</button>
      </div>

      <form id="user-management-form">
        <label>
          Role
          <select name="role">${roleOptions}</select>
        </label>

        <label>
          Status
          <select name="status">${statusOptions}</select>
        </label>

        <div id="user-action-message" class="user-action-message"></div>

        <div class="user-dialog-actions">
          <button class="secondary-button" type="button" data-close>Cancel</button>
          <button class="primary-button" type="submit">Save changes</button>
        </div>
      </form>
    </div>`;

  function close() {
    dialog.remove();
  }

  dialog.addEventListener("click", event => {
    if (event.target === dialog) close();
  });
  dialog.querySelector(".dialog-close").onclick = close;
  dialog.querySelector("[data-close]").onclick = close;

  dialog.querySelector("#user-management-form").addEventListener("submit", async event => {
    event.preventDefault();

    const form = event.currentTarget;
    const message = dialog.querySelector("#user-action-message");
    const submit = form.querySelector('[type="submit"]');
    const newRole = form.role.value;
    const newStatus = form.status.value;

    submit.disabled = true;
    message.textContent = "Saving...";

    try {
      if (newRole !== user.role) {
        await updateCompanyUserRole(user.user_id, newRole);
      }

      if (newStatus !== user.status) {
        await setCompanyUserStatus(user.user_id, newStatus);
      }

      message.className = "user-action-message success";
      message.textContent = "Changes saved successfully.";

      dialog.dispatchEvent(new CustomEvent("user-updated", { bubbles: true }));
      setTimeout(close, 500);
    } catch (error) {
      console.error(error);
      message.className = "user-action-message error";
      message.textContent = error.message || "Unable to save changes.";
      submit.disabled = false;
    }
  });

  return dialog;
}

export async function renderUsersModule(container, { identity }) {
  if (!canAccess(identity)) {
    container.innerHTML = `
      <section class="module users-module">
        <div class="module-heading">
          <div><p class="eyebrow">Administration</p><h1>Users</h1></div>
        </div>
        <div class="access-denied">
          <h2>Access restricted</h2>
          <p>This module is available to Administrators and Managers.</p>
        </div>
      </section>`;
    return;
  }

  container.innerHTML = `
    <section class="module users-module">
      <div class="module-heading">
        <div>
          <p class="eyebrow">Administration</p>
          <h1>Users</h1>
          <p class="muted">Manage user roles and access within your company.</p>
        </div>
        <div class="read-only-note">USER ACTIONS · v0.0.2.2</div>
      </div>

      <div id="users-content"><div class="loading">Loading users...</div></div>
    </section>`;

  const content = container.querySelector("#users-content");

  async function load() {
    try {
      const users = await getCompanyUsers();

      content.innerHTML = `
        ${renderStats(users)}
        <div class="users-toolbar">
          <input id="users-search" class="users-search" type="search" placeholder="Search by name or email">
          <select id="users-role-filter">
            <option value="">All roles</option>
            <option value="administrator">Administrator</option>
            <option value="manager">Manager</option>
            <option value="supervisor">Supervisor</option>
            <option value="guest">Guest</option>
          </select>
          <select id="users-status-filter">
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="invited">Invited</option>
          </select>
        </div>

        <div class="users-table-wrap">
          <table class="users-table">
            <thead>
              <tr>
                <th>User</th><th>Role</th><th>Status</th>
                <th>Last update</th><th>Created</th><th>Actions</th>
              </tr>
            </thead>
            <tbody id="users-table-body"></tbody>
          </table>
        </div>`;

      const search = content.querySelector("#users-search");
      const roleFilter = content.querySelector("#users-role-filter");
      const statusFilter = content.querySelector("#users-status-filter");
      const body = content.querySelector("#users-table-body");

      function filteredUsers() {
        const query = search.value.trim().toLowerCase();
        return users.filter(user => {
          const searchable = `${user.display_name || ""} ${user.email || ""}`.toLowerCase();
          return (!query || searchable.includes(query))
            && (!roleFilter.value || user.role === roleFilter.value)
            && (!statusFilter.value || user.status === statusFilter.value);
        });
      }

      function draw() {
        body.innerHTML = renderRows(filteredUsers(), identity);

        body.querySelectorAll("[data-user-action]").forEach(button => {
          button.addEventListener("click", () => {
            const user = users.find(item => item.user_id === button.dataset.userAction);
            if (!user) return;

            const dialog = openUserDialog(user, identity);
            document.body.appendChild(dialog);

            dialog.addEventListener("user-updated", load, { once: true });
          });
        });
      }

      search.addEventListener("input", draw);
      roleFilter.addEventListener("change", draw);
      statusFilter.addEventListener("change", draw);

      draw();
    } catch (error) {
      console.error(error);
      content.innerHTML = `
        <div class="module-error">
          <strong>Unable to load users.</strong>
          <p>${escapeHtml(error.message || "Unexpected error.")}</p>
        </div>`;
    }
  }

  await load();
}
