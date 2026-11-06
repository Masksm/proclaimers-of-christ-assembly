import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const SUPABASE_URL = "https://hlnkyczwdgvnrvuhdypk.supabase.co";
const SUPABASE_KEY = "sb_publishable_KRxRK1s-EIgOUZ7VdKBj_Q_WwqswkIl";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const form = document.querySelector("#auth-form");
const title = document.querySelector("#form-title");
const intro = document.querySelector("#form-intro");
const nameInput = document.querySelector("#full-name");
const nameLabel = document.querySelector("#name-label");
const passwordInput = document.querySelector("#password");
const submitButton = document.querySelector("#submit-button");
const switchButton = document.querySelector("#switch-button");
const switchCopy = document.querySelector("#switch-copy");
const forgotButton = document.querySelector("#forgot-button");
const googleButton = document.querySelector("#google-button");
const message = document.querySelector("#auth-message");
let mode = "login";
function showMessage(text, error = false) { message.textContent = text; message.classList.toggle("error", error); }
function setMode(next) {
  mode = next;
  const signup = mode === "signup";
  title.textContent = signup ? "Join our church family." : "Welcome back.";
  intro.textContent = signup ? "Create your free member account." : "Sign in to access your church account.";
  nameInput.hidden = !signup; nameLabel.hidden = !signup; nameInput.required = signup;
  passwordInput.autocomplete = signup ? "new-password" : "current-password";
  submitButton.textContent = signup ? "Create member account" : "Sign in";
  forgotButton.hidden = signup;
  switchCopy.innerHTML = signup ? 'Already registered? <button id="switch-button" type="button">Sign in</button>' : 'New here? <button id="switch-button" type="button">Create a member account</button>';
  document.querySelector("#switch-button").addEventListener("click", () => setMode(signup ? "login" : "signup"));
  showMessage("");
}
switchButton.addEventListener("click", () => setMode("signup"));
form.addEventListener("submit", async (event) => {
  event.preventDefault(); showMessage("");
  submitButton.disabled = true;
  try {
    const email = document.querySelector("#email").value.trim();
    const password = passwordInput.value;
    if (mode === "signup") {
      const fullName = nameInput.value.trim();
      if (!fullName) throw new Error("Enter your full name.");
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName }, emailRedirectTo: `${location.origin}/auth-callback.html` } });
      if (error) throw error;
      if (data.session) location.href = "dashboard.html";
      else showMessage("Account created. Check your email to confirm your address, then sign in.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      location.href = "dashboard.html";
    }
  } catch (error) { showMessage(error.message || "Unable to complete that request.", true); }
  finally { submitButton.disabled = false; }
});
googleButton.addEventListener("click", async () => {
  showMessage(""); googleButton.disabled = true;
  const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}/auth-callback.html` } });
  if (error) { showMessage(error.message, true); googleButton.disabled = false; }
});
forgotButton.addEventListener("click", async () => {
  const email = document.querySelector("#email").value.trim();
  if (!email) return showMessage("Enter your email address first.", true);
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: location.origin + "/login.html" });
  showMessage(error ? error.message : "If that account exists, a password reset link has been sent.", Boolean(error));
});
const { data: { session } } = await supabase.auth.getSession();
if (session) location.href = "dashboard.html";
