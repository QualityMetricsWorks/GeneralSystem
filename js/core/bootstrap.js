import { configured, supabase } from "../services/supabase.js";
import { getTenant, resolveTenant } from "../services/tenant.service.js";
import { loadIdentity } from "../services/identity.service.js";

function fatal(message) {
  document.querySelector("#app").innerHTML = `
    <div class="screen"><div class="card">
      <strong>GUVEL</strong><h2>System unavailable</h2><p>${message}</p>
    </div></div>`;
}

function shell(company, identity) {
  const modules = ["Dashboard", "Capture", "Data", "Catalog", "History", "Users", "Settings"];
  document.querySelector("#app").innerHTML = `
    <div class="shell">
      <aside class="side">
        <strong>GUVEL</strong><p class="muted">${company.name}</p>
        <div class="nav">${modules.map(name => `<button data-m="${name}">${name}</button>`).join("")}</div>
        <hr><button id="logout">Logout</button>
      </aside>
      <main class="main">
        <p>${identity.display_name || "User"} · ${identity.role}</p>
        <section id="module" class="module"></section>
      </main>
    </div>`;

  document.querySelectorAll("[data-m]").forEach(button => {
    button.onclick = () => {
      document.querySelector("#module").innerHTML =
        `<h1>${button.dataset.m}</h1><p class="muted">Independent module baseline.</p>`;
    };
  });

  document.querySelector("[data-m]")?.click();

  document.querySelector("#logout").onclick = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };
}

function login(company) {
  document.querySelector("#app").innerHTML = `
    <div class="screen">
      <form class="auth" id="login-form">
        <strong>GUVEL</strong><h2>${company.name}</h2>
        <p class="muted">Authorized users only.</p>
        <label>Email</label><input id="email" type="email" required>
        <label>Password</label><input id="password" type="password" required>
        <button class="primary" type="submit">Sign in</button>
        <div id="error-message" class="error"></div>
      </form>
    </div>`;

  document.querySelector("#login-form").onsubmit = async (event) => {
    event.preventDefault();
    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value;
    const errorBox = document.querySelector("#error-message");

    try {
      errorBox.textContent = "";
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const identity = await loadIdentity(company.id);
      shell(company, identity);
    } catch (error) {
      errorBox.textContent = error.message || "Unable to sign in.";
      console.error(error);
    }
  };
}

async function boot() {
  if (!configured) {
    fatal("Configure js/config/env.js with your Supabase URL and anon key.");
    return;
  }

  try {
    const slug = getTenant();

    if (!slug) {
      fatal("No GUVEL environment was detected. Use development.guvelsystems.com.");
      return;
    }

    const company = await resolveTenant(slug);
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;

    if (!data.session) {
      login(company);
      return;
    }

    const identity = await loadIdentity(company.id);
    shell(company, identity);
  } catch (error) {
    console.error(error);
    fatal(error.message || "Unable to initialize the GUVEL system.");
  }
}

boot();
