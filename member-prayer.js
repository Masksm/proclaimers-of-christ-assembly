import {createClient} from "https://esm.sh/@supabase/supabase-js@2";
const supabase=createClient("https://hlnkyczwdgvnrvuhdypk.supabase.co","sb_publishable_KRxRK1s-EIgOUZ7VdKBj_Q_WwqswkIl");
const form=document.querySelector("#member-prayer-request-form"),feedback=document.querySelector("#member-prayer-feedback"),submit=document.querySelector("#member-prayer-submit");
const modal=document.querySelector("#member-prayer-modal"),openButton=document.querySelector("#open-member-prayer");
function openPrayer(){if(!modal)return;modal.hidden=false;modal.setAttribute("aria-hidden","false");document.body.classList.add("member-prayer-open");document.querySelector("#member-prayer-name")?.focus();}
function closePrayer(){if(!modal)return;modal.hidden=true;modal.setAttribute("aria-hidden","true");document.body.classList.remove("member-prayer-open");openButton?.focus();}
openButton?.addEventListener("click",openPrayer);
modal?.addEventListener("click",e=>{if(e.target.closest("[data-close-member-prayer]"))closePrayer();});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&modal&&!modal.hidden)closePrayer();});
if(form){form.addEventListener("submit",async event=>{event.preventDefault();feedback.textContent="";feedback.classList.remove("error");submit.disabled=true;submit.textContent="Submitting…";
const {data:{session},error:sessionError}=await supabase.auth.getSession();if(sessionError||!session){feedback.textContent="Your session has expired. Please sign in again.";feedback.classList.add("error");submit.disabled=false;submit.textContent="Submit prayer request";return;}
const payload={request_text:document.querySelector("#member-prayer-text").value.trim(),requester_name:document.querySelector("#member-prayer-name").value.trim()||null,contact_email:document.querySelector("#member-prayer-email").value.trim()||session.user.email||null,created_by:session.user.id};
const {error}=await supabase.from("church_prayer_requests").insert(payload);submit.disabled=false;submit.textContent="Submit prayer request";
if(error){feedback.textContent="Your prayer request could not be submitted. Please try again.";feedback.classList.add("error");return;}form.reset();feedback.textContent="Your prayer request has been received. The church team will handle it privately.";
});}
const menu=document.querySelector("#member-menu-toggle"),nav=document.querySelector("#member-nav");
if(menu&&nav){menu.addEventListener("click",()=>{const open=nav.classList.toggle("open");menu.setAttribute("aria-expanded",String(open));menu.setAttribute("aria-label",open?"Close member menu":"Open member menu");});nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");menu.setAttribute("aria-expanded","false");menu.setAttribute("aria-label","Open member menu");}));}
