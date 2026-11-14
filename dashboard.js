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
const profileEmail=document.querySelector("#member-profile-email");
const todayLabel=document.querySelector("#member-today");
if(todayLabel)todayLabel.textContent=new Intl.DateTimeFormat(undefined,{weekday:"long",month:"long",day:"numeric"}).format(new Date()).toUpperCase();
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
    if(profileEmail)profileEmail.textContent=user.email||"Email unavailable";
    avatarEl.textContent=((profile?.full_name||metadataName||user.email||"M")[0]||"M").toUpperCase();
  }
}
document.querySelector("#signout-button").addEventListener("click",async()=>{
  const {error}=await supabase.auth.signOut();
  if(error){messageEl.textContent="Sign out failed. Please try again.";return;}
  location.replace("login.html");
});


// Member portal uses separate hidden views within one authenticated page.
const memberMenu=document.querySelector("#member-menu-toggle");
const memberNav=document.querySelector("#member-nav");
const memberNavItems=[...document.querySelectorAll("[data-member-view]")];
const memberViews=[...document.querySelectorAll("[data-view-panel]")];
function showMemberView(view,updateHash=true){
 const target=memberViews.find(panel=>panel.dataset.viewPanel===view);
 if(!target)return;
 memberViews.forEach(panel=>{
  const active=panel===target;
  panel.hidden=!active;
  panel.classList.toggle("active",active);
 });
 memberNavItems.forEach(button=>{
  const active=button.dataset.memberView===view;
  button.classList.toggle("active",active);
  if(active)button.setAttribute("aria-current","page");
  else button.removeAttribute("aria-current");
 });
 if(updateHash)history.replaceState(null,"","#"+view);
 memberNav?.classList.remove("open");
 memberMenu?.setAttribute("aria-expanded","false");
 if(memberMenu){memberMenu.setAttribute("aria-label","Open navigation");memberMenu.textContent="☰";}
 window.scrollTo({top:0,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
}
memberNavItems.forEach(button=>button.addEventListener("click",()=>showMemberView(button.dataset.memberView)));
document.querySelectorAll("[data-open-member-view]").forEach(button=>button.addEventListener("click",()=>showMemberView(button.dataset.openMemberView)));
if(memberMenu&&memberNav){
 memberMenu.addEventListener("click",()=>{
  const open=memberNav.classList.toggle("open");
  memberMenu.setAttribute("aria-expanded",String(open));
  memberMenu.setAttribute("aria-label",open?"Close navigation":"Open navigation");
  memberMenu.textContent=open?"×":"☰";
 });
}
const initialView=location.hash.replace("#","");
if(memberViews.some(panel=>panel.dataset.viewPanel===initialView))showMemberView(initialView,false);
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

 
// Announcements and personal notification centre.
const announcementList=document.querySelector("#member-announcement-list");
const markAllRead=document.querySelector("#member-mark-all-read");
const notificationBellCount=document.querySelector("#member-notification-count");
const notificationNavCount=document.querySelector("#member-nav-count");
const escapeAnnouncementText=value=>String(value??"").replace(/[&<>"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[char]));
const announcementDate=value=>value?new Intl.DateTimeFormat(undefined,{dateStyle:"medium"}).format(new Date(value)):"Recently";
async function loadMemberAnnouncements(){
 if(!announcementList)return;
 const {data:{session:activeSession}}=await supabase.auth.getSession();
 if(!activeSession){announcementList.innerHTML='<p class="member-announcement-empty">Sign in to view church updates.</p>';return;}
 const {data:notifications,error}=await supabase.from("church_member_notifications")
  .select("id,read_at,created_at,announcement:church_announcements(id,title,body,published_at,status,audience)")
  .eq("user_id",activeSession.user.id).order("created_at",{ascending:false});
 if(error){announcementList.innerHTML='<p class="member-announcement-empty">Announcements could not load. Refresh and try again.</p>';return;}
 const visible=(notifications||[]).filter(item=>item.announcement&&item.announcement.status==="published");
 const unread=visible.filter(item=>!item.read_at).length;
 [notificationBellCount,notificationNavCount].forEach(counter=>{if(!counter)return;counter.textContent=String(unread);counter.hidden=unread===0;});
 if(!visible.length){announcementList.innerHTML='<div class="member-announcement-empty"><span>✦</span><strong>You’re all caught up.</strong><p>New church notices will appear here when published.</p></div>';return;}
 announcementList.innerHTML=visible.map(item=>{const a=item.announcement;return '<article class="member-announcement-item '+(item.read_at?'is-read':'is-unread')+'" data-member-notification="'+escapeAnnouncementText(item.id)+'"><div class="member-announcement-item-top"><span class="member-announcement-status">'+(item.read_at?'READ':'NEW')+'</span><time>'+escapeAnnouncementText(announcementDate(a.published_at||item.created_at))+'</time></div><h3>'+escapeAnnouncementText(a.title)+'</h3><p>'+escapeAnnouncementText(a.body).replace(/\n/g,'<br>')+'</p>'+(item.read_at?'':'<button type="button" data-mark-notification-read="'+escapeAnnouncementText(item.id)+'">Mark as read</button>')+'</article>';}).join("");
}
announcementList?.addEventListener("click",async event=>{
 const button=event.target.closest("[data-mark-notification-read]");if(!button)return;
 button.disabled=true;
 const {data:{session:activeSession}}=await supabase.auth.getSession();if(!activeSession)return;
 const {error}=await supabase.from("church_member_notifications").update({read_at:new Date().toISOString()}).eq("id",button.dataset.markNotificationRead).eq("user_id",activeSession.user.id);
 if(error){button.disabled=false;button.textContent="Could not mark read";return;}await loadMemberAnnouncements();
});
markAllRead?.addEventListener("click",async()=>{
 const {data:{session:activeSession}}=await supabase.auth.getSession();if(!activeSession)return;
 markAllRead.disabled=true;markAllRead.textContent="Updating…";
 const {error}=await supabase.from("church_member_notifications").update({read_at:new Date().toISOString()}).eq("user_id",activeSession.user.id).is("read_at",null);
 markAllRead.disabled=false;markAllRead.textContent="Mark all as read";
 if(error){markAllRead.textContent="Try again";return;}await loadMemberAnnouncements();
});
document.querySelectorAll('[data-member-view="announcements"],[data-open-member-view="announcements"]').forEach(control=>control.addEventListener("click",()=>loadMemberAnnouncements()));
loadMemberAnnouncements();
