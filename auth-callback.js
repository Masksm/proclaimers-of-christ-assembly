import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://hlnkyczwdgvnrvuhdypk.supabase.co";
const SUPABASE_KEY = "sb_publishable_KRxRK1s-EIgOUZ7VdKBj_Q_WwqswkIl";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const title = document.querySelector("#callback-title");
const message = document.querySelector("#callback-message");
const spinner = document.querySelector("#callback-spinner");
const link = document.querySelector("#callback-link");

function showFailure(text) {
  title.textContent = "We couldn't verify your account.";
  message.textContent = text || "This verification link may have expired or already been used. Return to sign in and request a new link if needed.";
  spinner.hidden = true;
  link.hidden = false;
}

try {
  const params = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const authError = params.get("error_description") || hashParams.get("error_description");
  if (authError) throw new Error(authError.replace(/\+/g, " "));

  // Supabase JS handles the PKCE callback during client initialization.
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;

  if (!data.session) {
    throw new Error("The verification link did not create a session. It may have expired or already been used. Return to sign in and try again.");
  }

  title.textContent = "Your email is confirmed.";
  message.textContent = "Your account has been verified successfully. Taking you to your church account now.";
  spinner.hidden = true;
  window.setTimeout(() => {
    window.location.replace("dashboard.html");
  }, 1200);
} catch (error) {
  showFailure(error.message);
}
