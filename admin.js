import {createClient} from "https://esm.sh/@supabase/supabase-js@2";
const supabase=createClient("https://hlnkyczwdgvnrvuhdypk.supabase.co","sb_publishable_KRxRK1s-EIgOUZ7VdKBj_Q_WwqswkIl");
const {data:{session}}=await supabase.auth.getSession();
if(!session){location.replace("login.html");}
else{const {data:role,error}=await supabase.rpc("get_my_role");if(error||role!=="admin"){location.replace("dashboard.html");}else{const email=session.user.email||"Administrator";document.querySelector("#admin-email").textContent=email;document.querySelector("#account-status").textContent="Signed in as "+email+". Administrator permissions were confirmed by the database.";document.querySelector("#year").textContent=String(new Date().getFullYear());}}
async function signOut(){await supabase.auth.signOut();location.replace("login.html");}
document.querySelector("#signout").addEventListener("click",signOut);document.querySelector("#side-signout").addEventListener("click",signOut);
const sidebar=document.querySelector("#sidebar"),menu=document.querySelector("#menu");menu.addEventListener("click",()=>sidebar.classList.toggle("open"));sidebar.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>sidebar.classList.remove("open")));