export function renderActivationView() {
  return `
    <div class="activation-page">

      <section class="activation-card">

        <div class="activation-brand">
          <div class="activation-logo">
            GUVEL
          </div>

          <div class="activation-subtitle">
            Smarter Industrial Systems
          </div>
        </div>

        <div class="activation-content">

          <h1>
            Activate your account
          </h1>

          <p class="activation-description">
            Welcome to GUVEL.
            Create a password to activate your account.
          </p>

          <form
            id="activation-form"
            class="activation-form"
          >

            <div class="form-field">

              <label for="activation-password">
                Create password
              </label>

              <input
                id="activation-password"
                type="password"
                autocomplete="new-password"
                minlength="8"
                required
              >

            </div>

            <div class="form-field">

              <label
                for="activation-password-confirm"
              >
                Confirm password
              </label>

              <input
                id="activation-password-confirm"
                type="password"
                autocomplete="new-password"
                minlength="8"
                required
              >

            </div>

            <div
              id="activation-message"
              class="activation-message"
            ></div>

            <button
              type="submit"
              class="primary-button activation-button"
            >
              Activate account
            </button>

          </form>

        </div>

      </section>

    </div>
  `;
}