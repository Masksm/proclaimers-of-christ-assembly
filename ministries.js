import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase=createClient("https://hlnkyczwdgvnrvuhdypk.supabase.co","sb_publishable_KRxRK1s-EIgOUZ7VdKBj_Q_WwqswkIl");
const root=document.querySelector("#public-ministry-list");
const esc=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
if(root){const {data,error}=await supabase.from("church_ministries").select("id,name,description,leader_name,contact_info,image_url").eq("status","published").order("name",{ascending:true});
if(error){root.innerHTML='<p class="ministry-empty">Ministry information is temporarily unavailable. Please try again later.</p>';}
else if(!data?.length){root.innerHTML='<p class="ministry-empty">Ministries and departments will be introduced here soon.</p>';}
else{root.innerHTML=data.map(m=>'<article class="public-ministry-card">'+(m.image_url?'<img src="'+esc(m.image_url)+'" alt="" loading="lazy">':'<div class="public-ministry-symbol" aria-hidden="true">✝</div>')+'<div class="public-ministry-content"><h3>'+esc(m.name)+'</h3><p>'+esc(m.description||"A ministry serving and growing together in Christ.")+'</p>'+(m.leader_name?'<span class="public-ministry-meta">Ministry leader: '+esc(m.leader_name)+'</span>':'')+(m.contact_info?'<span class="public-ministry-meta">'+esc(m.contact_info)+'</span>':'')+'</div></article>').join("");root.classList.add("has-ministries");}}
