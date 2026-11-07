import {createClient} from "https://esm.sh/@supabase/supabase-js@2";
const supabase=createClient("https://hlnkyczwdgvnrvuhdypk.supabase.co","sb_publishable_KRxRK1s-EIgOUZ7VdKBj_Q_WwqswkIl");
const root=document.querySelector("#public-event-list");
if(root){const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const {data,error}=await supabase.from("church_events").select("id,title,description,starts_at,venue,image_url").eq("status","published").gte("starts_at",new Date().toISOString()).order("starts_at",{ascending:true}).limit(3);
if(error)root.innerHTML='<span class="event-symbol">✦</span><h3>Upcoming events</h3><p>Event information is temporarily unavailable.</p>';
else if(!data?.length)root.innerHTML='<span class="event-symbol">✦</span><h3>Upcoming events</h3><p>New events will be announced soon.</p>';
else root.innerHTML=data.map(e=>`<article class="public-event-card">${e.image_url?`<img src="${esc(e.image_url)}" alt="" loading="lazy">`:""}<div class="public-event-content"><span class="public-event-date">${esc(new Intl.DateTimeFormat(undefined,{dateStyle:"full",timeStyle:"short"}).format(new Date(e.starts_at)))}</span><h3>${esc(e.title)}</h3><p>${esc(e.description||"Join us for this church programme.")}</p>${e.venue?`<span class="public-event-venue">${esc(e.venue)}</span>`:""}</div></article>`).join("")}
}