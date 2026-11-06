import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient("https://hlnkyczwdgvnrvuhdypk.supabase.co","sb_publishable_KRxRK1s-EIgOUZ7VdKBj_Q_WwqswkIl");
const title=document.querySelector("#dashboard-title"), intro=document.querySelector("#dashboard-intro"), content=document.querySelector("#dashboard-content"), message=document.querySelector("#dashboard-message");
const {data:{session}}=await supabase.auth.getSession();
if(!session){location.replace("login.html");}
else{
 const {data:role,error}=await supabase.rpc("get_my_role");
 const email=session.user.email||"";
 if(error){title.textContent="Account access unavailable";intro.textContent="We could not verify your account role. Please try again later.";message.textContent=error.message;}
 else{
  const admin=role==="admin";
  if(admin){location.replace("admin.html");} else {title.textContent="Welcome to the church family."; }
  intro.textContent="Signed in as "+email;
  content.innerHTML=admin?'<div class="dashboard-panel"><h2>Administrator access</h2><p>Your administrator account is active. This area will hold church announcements, events, ministry updates and member administration.</p></div>':'<div class="dashboard-panel"><h2>Member account</h2><p>Your member account is active. Church updates and member features will appear here as they are added.</p></div>';
 }
}
document.querySelector("#signout-button").addEventListener("click",async()=>{await supabase.auth.signOut();location.replace("login.html");});
