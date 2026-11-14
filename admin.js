import {createClient} from "https://esm.sh/@supabase/supabase-js@2";
const supabase=createClient("https://hlnkyczwdgvnrvuhdypk.supabase.co","sb_publishable_KRxRK1s-EIgOUZ7VdKBj_Q_WwqswkIl");
const {data:{session}}=await supabase.auth.getSession();
if(!session){location.replace("login.html");}
else{const {data:role,error}=await supabase.rpc("get_my_role");if(error||role!=="admin"){location.replace("dashboard.html");}else{const email=session.user.email||"Administrator";document.querySelector("#admin-email").textContent=email;document.querySelector("#account-status").textContent="Signed in as "+email+". Administrator permissions were confirmed by the database.";document.querySelector("#year").textContent=String(new Date().getFullYear());}}
async function signOut(){await supabase.auth.signOut();location.replace("login.html");}
document.querySelector("#signout").addEventListener("click",signOut);document.querySelector("#side-signout").addEventListener("click",signOut);
const sidebar=document.querySelector("#sidebar"),menu=document.querySelector("#menu");menu.addEventListener("click",()=>sidebar.classList.toggle("open"));sidebar.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>sidebar.classList.remove("open")));

/* Dashboard interaction layer */
const adminHeader=document.querySelector(".topbar");
const updateAdminHeader=()=>adminHeader?.classList.toggle("scrolled",window.scrollY>20);
window.addEventListener("scroll",updateAdminHeader,{passive:true});updateAdminHeader();
const adminRevealTargets=document.querySelectorAll(".welcome-panel,.overview-section,.management-section,.bottom-grid,.stat-card,.management-card");
if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches&&"IntersectionObserver" in window){
 const adminObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting){entry.target.classList.add("admin-reveal","is-visible");adminObserver.unobserve(entry.target);}
 }),{threshold:.1,rootMargin:"0px 0px -25px 0px"});
 adminRevealTargets.forEach((el,index)=>{el.classList.add("admin-reveal");el.style.transitionDelay=(index%4)*55+"ms";adminObserver.observe(el);});
}
const adminNavLinks=[...document.querySelectorAll(".primary-nav .nav-link")];
const adminSections=adminNavLinks.map(link=>document.querySelector(link.getAttribute("href"))).filter(Boolean);
if("IntersectionObserver" in window){
 const adminNavObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting){adminNavLinks.forEach(link=>link.classList.toggle("selected",link.getAttribute("href")==="#"+entry.target.id));}
 }),{rootMargin:"-22% 0px -68% 0px"});
 adminSections.forEach(section=>adminNavObserver.observe(section));
}
