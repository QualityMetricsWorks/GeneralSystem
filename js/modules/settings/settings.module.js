import { getCompany } from "../../services/company.service.js";
import { getCompanyShifts, createCompanyShift, updateCompanyShift } from "../../services/shifts.service.js";

const esc = (v = "") => String(v).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
const canManage = identity => ["administrator", "manager"].includes(identity?.role);
const fmtTime = value => value ? String(value).slice(0,5) : "—";
const crossesMidnight = shift => shift.start_time > shift.end_time;

function renderCompany(container, company) {
  container.innerHTML = `
    <div class="settings-section">
      <div class="module-heading"><div><p class="eyebrow">Configuration</p><h1>Company</h1><p class="muted">Current environment identity and operational timezone.</p></div></div>
      <div class="settings-grid">
        <div class="setting-card"><span>Company name</span><strong>${esc(company.name)}</strong></div>
        <div class="setting-card"><span>Company code</span><strong>${esc(company.code)}</strong></div>
        <div class="setting-card"><span>Environment slug</span><strong>${esc(company.slug)}</strong></div>
        <div class="setting-card"><span>Timezone</span><strong>${esc(company.timezone || "Not configured")}</strong></div>
        <div class="setting-card"><span>Status</span><strong>${esc(company.status)}</strong></div>
      </div>
      <div class="settings-note">Company identity is read-only in v0.0.2.5. Shift configuration is managed in the Shifts tab.</div>
    </div>`;
}

function shiftDialog({ shift, companyId, onSaved }) {
  const editing = Boolean(shift);
  const dialog = document.createElement("div");
  dialog.className = "user-dialog-backdrop";
  dialog.innerHTML = `
    <div class="user-dialog shift-dialog" role="dialog" aria-modal="true">
      <div class="user-dialog-header"><div><p class="eyebrow">Shift management</p><h2>${editing ? "Edit shift" : "Add shift"}</h2><p class="muted">Configure the operational schedule for this company.</p></div><button class="dialog-close" type="button">×</button></div>
      <form id="shift-form">
        <label>Name<input name="name" maxlength="80" required value="${esc(shift?.name || "")}" placeholder="First Shift"></label>
        <label>Code<input name="code" maxlength="30" required value="${esc(shift?.code || "")}" placeholder="1ST"></label>
        <div class="shift-time-grid"><label>Start time<input name="start_time" type="time" required value="${fmtTime(shift?.start_time || "")}"></label><label>End time<input name="end_time" type="time" required value="${fmtTime(shift?.end_time || "")}"></label></div>
        ${editing ? `<label class="checkbox-line"><input name="is_active" type="checkbox" ${shift.is_active ? "checked" : ""}> Active</label>` : ""}
        <div id="shift-message" class="user-action-message"></div>
        <div class="user-dialog-actions"><button class="secondary-button" type="button" data-close>Cancel</button><button class="primary-button" type="submit">${editing ? "Save changes" : "Add shift"}</button></div>
      </form>
    </div>`;
  const close = () => dialog.remove();
  dialog.addEventListener("click", e => { if (e.target === dialog) close(); });
  dialog.querySelector(".dialog-close").onclick = close;
  dialog.querySelector("[data-close]").onclick = close;
  dialog.querySelector("form").onsubmit = async e => {
    e.preventDefault();
    const form = e.currentTarget, message = dialog.querySelector("#shift-message"), submit = form.querySelector('[type="submit"]');
    const payload = { name: form.name.value.trim(), code: form.code.value.trim().toUpperCase(), start_time: form.start_time.value, end_time: form.end_time.value };
    if (!payload.name || !payload.code || !payload.start_time || !payload.end_time) return;
    if (payload.start_time === payload.end_time) { message.className="user-action-message error"; message.textContent="Start and end time must be different."; return; }
    if (editing) payload.is_active = form.is_active.checked;
    submit.disabled = true; message.textContent = "Saving...";
    try {
      if (editing) await updateCompanyShift(shift.id, payload); else await createCompanyShift({ ...payload, company_id: companyId });
      message.className="user-action-message success"; message.textContent="Shift saved successfully.";
      await onSaved(); setTimeout(close, 450);
    } catch (error) { console.error(error); message.className="user-action-message error"; message.textContent=error.message || "Unable to save shift."; submit.disabled=false; }
  };
  return dialog;
}

async function renderShifts(container, { company, identity }) {
  const manager = canManage(identity);
  container.innerHTML = `<div class="settings-section"><div class="module-heading"><div><p class="eyebrow">Configuration</p><h1>Shifts</h1><p class="muted">Configure operational shifts for ${esc(company.name)}.</p></div>${manager ? '<button id="add-shift" class="primary-button">Add shift</button>' : ''}</div><div id="shifts-content" class="loading">Loading shifts...</div></div>`;
  const content = container.querySelector("#shifts-content");
  const load = async () => {
    try {
      const shifts = await getCompanyShifts();
      content.innerHTML = shifts.length ? `<div class="shifts-list">${shifts.map(s => `<article class="shift-card ${s.is_active ? "" : "inactive"}"><div class="shift-card-top"><div><span class="shift-code">${esc(s.code)}</span><h3>${esc(s.name)}</h3></div><span class="status status-${s.is_active ? "active" : "inactive"}">${s.is_active ? "Active" : "Inactive"}</span></div><div class="shift-hours">${fmtTime(s.start_time)} <span>→</span> ${fmtTime(s.end_time)}</div>${crossesMidnight(s) ? '<div class="crosses-midnight">Crosses midnight</div>' : ''}${manager ? `<div class="shift-actions"><button class="table-action action-enabled" data-edit-shift="${esc(s.id)}">Edit</button><button class="table-action ${s.is_active ? "action-danger" : "action-enabled"}" data-toggle-shift="${esc(s.id)}">${s.is_active ? "Deactivate" : "Reactivate"}</button></div>` : ''}</article>`).join("")}</div>` : `<div class="empty-state"><h3>No shifts configured</h3><p>Create your first operational shift to begin.</p></div>`;
      content.querySelectorAll("[data-edit-shift]").forEach(btn => btn.onclick = () => { const s=shifts.find(x=>x.id===btn.dataset.editShift); document.body.appendChild(shiftDialog({shift:s, companyId:company.id, onSaved:load})); });
      content.querySelectorAll("[data-toggle-shift]").forEach(btn => btn.onclick = async () => { const s=shifts.find(x=>x.id===btn.dataset.toggleShift); if (!confirm(`${s.is_active ? "Deactivate" : "Reactivate"} ${s.name}?`)) return; btn.disabled=true; try { await updateCompanyShift(s.id,{is_active:!s.is_active}); await load(); } catch(e){ alert(e.message || "Unable to update shift."); btn.disabled=false; } });
    } catch (error) { console.error(error); content.innerHTML=`<div class="access-denied"><h2>Unable to load shifts</h2><p>${esc(error.message || "Please try again.")}</p></div>`; }
  };
  if (manager) container.querySelector("#add-shift").onclick = () => document.body.appendChild(shiftDialog({ companyId: company.id, onSaved: load }));
  await load();
}

export async function renderSettingsModule(container, { company, identity }) {
  container.innerHTML = `<section class="module settings-module"><div class="settings-tabs"><button class="active" data-settings="company">Company</button><button data-settings="shifts">Shifts</button></div><div id="settings-content"></div></section>`;
  const content = container.querySelector("#settings-content");
  const companyData = await getCompany(company.id);
  const open = async name => {
    container.querySelectorAll("[data-settings]").forEach(b=>b.classList.toggle("active",b.dataset.settings===name));
    if (name === "company") renderCompany(content, companyData); else await renderShifts(content,{company,identity});
  };
  container.querySelectorAll("[data-settings]").forEach(btn=>btn.onclick=()=>open(btn.dataset.settings));
  await open("company");
}
