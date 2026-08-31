import { getCompanyUsers } from "../../services/users.service.js";

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

function canViewUsers(identity) {
  return ["administrator", "manager"].includes(identity?.role);
}

function renderStats(users) {
  const total = users.length;
  const active = users.filter(u => u.status === "active").length;
  const inactive = users.filter(u => u.status === "inactive").length;
  const invited = users.filter(u => u.status === "invited").length;

  return `
    <div class="users-stats">
      <div class="stat-card"><span>Total users</span><strong>${total}</strong></div>
      <div class="stat-card"><span>Active</span><strong>${active}</strong></div>
      <div class="stat-card"><span>Inactive</span><strong>${inactive}</strong></div>
      <div class="stat-card"><span>Invited</span><strong>${invited}</strong></div>
    </div>`;
}

function renderRows(users) {
  if (!users.length) {
    return `<tr><td colspan="6" class="empty">No users match the current search or filters.</td></tr>`;
  }

  return users.map(user => `
    <tr>
      <td>
        <div class="user-name">${escapeHtml(user.display_name || "Unnamed user")}</div>
        <div class="user-email">${escapeHtml(user.email || "No email stored")}</div>
      </td>
      <td><span class="role role-${escapeHtml(user.role)}">${ROLE_LABELS[user.role] || escapeHtml(user.role || "—")}</span></td>
      <td><span class="status status-${escapeHtml(user.status)}">${STATUS_LABELS[user.status] || escapeHtml(user.status || "—")}</span></td>
      <td>${formatDate(user.updated_at)}</td>
      <td>${formatDate(user.created_at)}</td>
      <td><button class="table-action" type="button" disabled title="User actions arrive in v0.0.2.2">View</button></td>
    </tr>
  `).join("");
}

export async function renderUsersModule(container, { identity }) {
  if (!canViewUsers(identity)) {
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
          <p class="muted">View company users and access status.</p>
        </div>
        <div class="read-only-note">READ-ONLY · v0.0.2.1</div>
      </div>

      <div id="users-content">
        <div class="loading">Loading users...</div>
      </div>
    </section>`;

  try {
    const users = await getCompanyUsers();
    const content = container.querySelector("#users-content");

    content.innerHTML = `
      ${renderStats(users)}
      <div class="users-toolbar">
        <input id="users-search" class="users-search" type="search"
          placeholder="Search by name or email">
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
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last update</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="users-table-body">
            ${renderRows(users)}
          </tbody>
        </table>
      </div>`;

    const search = content.querySelector("#users-search");
    const roleFilter = content.querySelector("#users-role-filter");
    const statusFilter = content.querySelector("#users-status-filter");
    const body = content.querySelector("#users-table-body");

    function applyFilters() {
      const query = search.value.trim().toLowerCase();
      const role = roleFilter.value;
      const status = statusFilter.value;

      const filtered = users.filter(user => {
        const searchable = `${user.display_name || ""} ${user.email || ""}`.toLowerCase();
        return (!query || searchable.includes(query))
          && (!role || user.role === role)
          && (!status || user.status === status);
      });

      body.innerHTML = renderRows(filtered);
    }

    search.addEventListener("input", applyFilters);
    roleFilter.addEventListener("change", applyFilters);
    statusFilter.addEventListener("change", applyFilters);
  } catch (error) {
    console.error(error);
    const content = container.querySelector("#users-content");
    content.innerHTML = `
      <div class="module-error">
        <strong>Unable to load users.</strong>
        <p>${escapeHtml(error.message || "Unexpected error.")}</p>
      </div>`;
  }
}
