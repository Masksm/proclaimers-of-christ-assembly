import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient("https://hlnkyczwdgvnrvuhdypk.supabase.co","sb_publishable_KRxRK1s-EIgOUZ7VdKBj_Q_WwqswkIl");

const nameEl=document.querySelector("#member-name");
const displayNameEl=document.querySelector("#member-display-name");
const emailEl=document.querySelector("#member-email");
const avatarEl=document.querySelector("#member-avatar");
const messageEl=document.querySelector("#dashboard-message");
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
    emailEl.textContent=user.email||"Member account";
    avatarEl.textContent=(firstName[0]||user.email?.[0]||"M").toUpperCase();
  }
}
document.querySelector("#signout-button").addEventListener("click",async()=>{
  const {error}=await supabase.auth.signOut();
  if(error){messageEl.textContent="Sign out failed. Please try again.";return;}
  location.replace("login.html");
});
