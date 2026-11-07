import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase=createClient("https://hlnkyczwdgvnrvuhdypk.supabase.co","sb_publishable_KRxRK1s-EIgOUZ7VdKBj_Q_WwqswkIl");
const form=document.querySelector("#prayer-request-form"),feedback=document.querySelector("#prayer-request-feedback"),submit=document.querySelector("#prayer-request-submit");
const nameInput=document.querySelector("#prayer-request-name"),emailInput=document.querySelector("#prayer-request-email"),requestInput=document.querySelector("#prayer-request-text");
if(form){form.addEventListener("submit",async event=>{event.preventDefault();feedback.textContent="";feedback.classList.remove("error");submit.disabled=true;submit.textContent="Submitting…";
const payload={request_text:requestInput.value.trim(),requester_name:nameInput.value.trim()||null,contact_email:emailInput.value.trim()||null};
const {error}=await supabase.from("church_prayer_requests").insert(payload);
submit.disabled=false;submit.textContent="Submit prayer request";
if(error){feedback.textContent="Your request could not be submitted. Please try again.";feedback.classList.add("error");return;}
form.reset();feedback.textContent="Your prayer request has been received. It will be handled privately by the church team.";
});}