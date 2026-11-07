import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase=createClient("https://hlnkyczwdgvnrvuhdypk.supabase.co","sb_publishable_KRxRK1s-EIgOUZ7VdKBj_Q_WwqswkIl");
const roots=[...document.querySelectorAll("#public-event-list, #member-event-list")];
const esc=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const formatDate=value=>new Intl.DateTimeFormat(undefined,{dateStyle:"full",timeStyle:"short"}).format(new Date(value));
function empty(root,message){root.innerHTML='<p class="event-feed-empty">'+esc(message)+'</p>'}
if(roots.length){
 const {data,error}=await supabase.from("church_events").select("id,title,description,starts_at,venue,image_url").eq("status","published").order("starts_at",{ascending:true}).limit(8);
 for(const root of roots){
  root.setAttribute("aria-live","polite");
  if(error){empty(root,"Event information is temporarily unavailable. Please try again later.");continue}
  if(!data?.length){empty(root,"New church events will be announced here soon.");continue}
  root.innerHTML=data.map(event=>'<article class="public-event-card">'+(event.image_url?'<img src="'+esc(event.image_url)+'" alt="" loading="lazy">':"")+'<div class="public-event-content"><span class="public-event-date">'+esc(formatDate(event.starts_at))+'</span><h3>'+esc(event.title)+'</h3><p>'+esc(event.description||"Join us for this church programme.")+'</p>'+(event.venue?'<span class="public-event-venue">'+esc(event.venue)+'</span>':"")+'</div></article>').join("");
  root.classList.add("has-events");
 }
}
