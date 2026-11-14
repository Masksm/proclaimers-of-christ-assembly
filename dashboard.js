import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient("https://hlnkyczwdgvnrvuhdypk.supabase.co","sb_publishable_KRxRK1s-EIgOUZ7VdKBj_Q_WwqswkIl");

const nameEl=document.querySelector("#member-name");
const displayNameEl=document.querySelector("#member-display-name");
const emailEl=document.querySelector("#member-email");
const avatarEl=document.querySelector("#member-avatar");
const messageEl=document.querySelector("#dashboard-message");
const profileForm=document.querySelector("#member-profile-form");
const profileNameInput=document.querySelector("#member-profile-name");
const profileFeedback=document.querySelector("#member-profile-feedback");
const profileSave=document.querySelector("#member-profile-save");
document.querySelector("#member-year").textContent=new Date().getFullYear();

const {data:{session},error:sessionError}=await supabase.auth.getSession();
if(sessionError || !session){
  location.replace("login.html");
}else{
  const {data:role,error:roleError}=await supabase.rpc("get_my_role");
  if(roleError){
    messageEl.textContent="We couldn't verify your account permissions. Please refresh or sign in again.";
  }else if(role==="admin"){
    location.replace("admin.html");
  }else{
    const user=session.user;
    const metadataName=(user.user_metadata?.full_name||user.user_metadata?.name||"").trim();
    const firstName=metadataName.split(/\s+/)[0]||"friend";
    const shownName=metadataName||user.email||"Church member";
    nameEl.textContent=firstName+".";
    displayNameEl.textContent=shownName;
    if(profileNameInput)profileNameInput.value=metadataName;
    const {data:profile}=await supabase.from("profiles").select("full_name").eq("id",user.id).maybeSingle();
    if(profile?.full_name){
      profileNameInput.value=profile.full_name;
      displayNameEl.textContent=profile.full_name;
      const profileFirst=profile.full_name.trim().split(/\s+/)[0]||"friend";
      nameEl.textContent=profileFirst+".";
      avatarEl.textContent=profileFirst[0].toUpperCase();
    }
    emailEl.textContent=user.email||"Member account";
    avatarEl.textContent=((profile?.full_name||metadataName||user.email||"M")[0]||"M").toUpperCase();
  }
}
document.querySelector("#signout-button").addEventListener("click",async()=>{
  const {error}=await supabase.auth.signOut();
  if(error){messageEl.textContent="Sign out failed. Please try again.";return;}
  location.replace("login.html");
});


// Mobile navigation and subtle scroll reveals for the member homepage.
const memberMenu=document.querySelector("#member-menu-toggle");
const memberNav=document.querySelector("#member-nav");
if(memberMenu&&memberNav){
 memberMenu.addEventListener("click",()=>{
  const open=memberNav.classList.toggle("open");
  memberMenu.setAttribute("aria-expanded",String(open));
  memberMenu.setAttribute("aria-label",open?"Close member menu":"Open member menu");
  memberMenu.textContent=open?"×":"☰";
 });
 memberNav.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>{
  memberNav.classList.remove("open");memberMenu.setAttribute("aria-expanded","false");
  memberMenu.setAttribute("aria-label","Open member menu");memberMenu.textContent="☰";
 }));
}
const memberHeader=document.querySelector(".member-header");
const updateMemberHeader=()=>memberHeader?.classList.toggle("scrolled",window.scrollY>24);
window.addEventListener("scroll",updateMemberHeader,{passive:true});updateMemberHeader();
const memberRevealTargets=document.querySelectorAll(".member-profile-strip,.member-section,.member-feature,.member-bottom-grid");
if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches&&"IntersectionObserver" in window){
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting){entry.target.classList.add("member-reveal","is-visible");observer.unobserve(entry.target);}
 }),{threshold:.1});
 memberRevealTargets.forEach((el,index)=>{el.classList.add("member-reveal");el.style.transitionDelay=(index%3)*70+"ms";observer.observe(el);});
}

if(profileForm){
 profileForm.addEventListener("submit",async event=>{
  event.preventDefault();
  if(!profileNameInput.value.trim()){profileFeedback.textContent="Enter your name before saving.";return;}
  profileSave.disabled=true;profileSave.textContent="Saving…";profileFeedback.textContent="";
  const {data:{session}}=await supabase.auth.getSession();
  if(!session){profileFeedback.textContent="Your session has expired. Sign in again.";profileSave.disabled=false;profileSave.textContent="Save profile";return;}
  const fullName=profileNameInput.value.trim();
  const {error}=await supabase.from("profiles").update({full_name:fullName,updated_at:new Date().toISOString()}).eq("id",session.user.id);
  profileSave.disabled=false;profileSave.textContent="Save profile";
  if(error){profileFeedback.textContent="Your profile could not be updated. Please try again.";profileFeedback.classList.add("error");return;}
  profileFeedback.classList.remove("error");profileFeedback.textContent="Profile updated.";
  displayNameEl.textContent=fullName;const first=fullName.split(/\s+/)[0]||"friend";nameEl.textContent=first+".";avatarEl.textContent=first[0].toUpperCase();
 });
}
