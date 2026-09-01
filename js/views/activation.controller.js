import { supabase } from "../services/supabase.client.js";

export function initializeActivationController() {

  const form = document.getElementById(
    "activation-form"
  );

  if (!form) {
    return;
  }

  form.addEventListener(
    "submit",
    handleActivationSubmit
  );
}


async function handleActivationSubmit(event) {

  event.preventDefault();

  const passwordInput =
    document.getElementById(
      "activation-password"
    );

  const confirmInput =
    document.getElementById(
      "activation-password-confirm"
    );

  const message =
    document.getElementById(
      "activation-message"
    );

  const button =
    document.querySelector(
      ".activation-button"
    );

  const password =
    passwordInput.value;

  const confirmPassword =
    confirmInput.value;


  message.textContent = "";
  message.className =
    "activation-message";


  if (password.length < 8) {

    showMessage(
      "Password must contain at least 8 characters.",
      "error"
    );

    return;
  }


  if (
    password !== confirmPassword
  ) {

    showMessage(
      "Passwords do not match.",
      "error"
    );

    return;
  }


  button.disabled = true;

  button.textContent =
    "Activating account...";


  try {

    const {
      data: sessionData,
      error: sessionError,
    } = await supabase.auth.getSession();


    if (
      sessionError ||
      !sessionData.session
    ) {

      throw new Error(
        "Your invitation session is no longer valid. Please request a new invitation."
      );

    }


    const {
      error: passwordError,
    } = await supabase.auth.updateUser({
      password,
    });


    if (passwordError) {

      throw passwordError;

    }


    const {
      error: profileError,
    } = await supabase.rpc(
      "activate_current_user_profile"
    );


    if (profileError) {

      throw profileError;

    }


    showMessage(
      "Your account has been activated successfully.",
      "success"
    );


    setTimeout(
      () => {

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );


        window.location.href =
          window.location.origin + "/";

      },
      1200
    );


  } catch (error) {

    showMessage(
      error.message ||
        "Unable to activate your account.",
      "error"
    );


    button.disabled = false;

    button.textContent =
      "Activate account";

  }

}


function showMessage(
  text,
  type
) {

  const message =
    document.getElementById(
      "activation-message"
    );

  if (!message) {
    return;
  }

  message.textContent =
    text;

  message.className =
    `activation-message ${type}`;

}