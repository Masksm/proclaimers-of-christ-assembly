import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase=createClient("https://hlnkyczwdgvnrvuhdypk.supabase.co","sb_publishable_KRxRK1s-EIgOUZ7VdKBj_Q_WwqswkIl");
const roots=[...document.querySelectorAll("#public-sermon-list,#member-sermon-list")];
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function mediaMarkup(s){
 let u;try{u=new URL(s.media_url)}catch{return '<a class="public-sermon-link" href="'+esc(s.media_url)+'" target="_blank" rel="noopener noreferrer">Open media</a>'}
 const host=u.hostname.toLowerCase().replace(/^www\./,"");
 let embed=null;
 if(host==="youtu.be"){embed=u.pathname.slice(1).split("/")[0]}
 if(host==="youtube.com"||host==="m.youtube.com"){embed=u.searchParams.get("v")||u.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/)?.[1]}
 if(embed&&/^[\w-]{6,20}$/.test(embed))return '<div class="public-sermon-media"><iframe src="https://www.youtube-nocookie.com/embed/'+encodeURIComponent(embed)+'" title="'+esc(s.title)+'" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>';
 if(host==="vimeo.com"||host==="player.vimeo.com"){const id=u.pathname.split("/").filter(Boolean).pop();if(/^\d+$/.test(id||""))return '<div class="public-sermon-media"><iframe src="https://player.vimeo.com/video/'+id+'" title="'+esc(s.title)+'" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>'}
 const path=u.pathname.toLowerCase();
 if(s.media_type==="audio"||/\.(mp3|m4a|aac|ogg|wav|flac)$/.test(path))return '<div class="public-sermon-media"><audio controls preload="none" src="'+esc(u.href)+'">Your browser does not support audio playback.</audio></div>';
 if(s.media_type==="video"||/\.(mp4|webm|mov|m4v)$/.test(path))return '<div class="public-sermon-media"><video controls preload="metadata" playsinline src="'+esc(u.href)+'">Your browser does not support video playback.</video></div>';
 return '<a class="public-sermon-link" href="'+esc(u.href)+'" target="_blank" rel="noopener noreferrer">Open media resource</a>';
}
function card(s,compact=false){
 const meta=[s.speaker,s.scripture_reference,s.preached_at].filter(Boolean).map(esc).join(" · ");
 if(compact)return '<article class="member-sermon-card">'+(s.thumbnail_url?'<img src="'+esc(s.thumbnail_url)+'" alt="" loading="lazy">':'')+'<div><h4>'+esc(s.title)+'</h4><p>'+meta+'</p><a href="'+esc(s.media_url)+'" target="_blank" rel="noopener noreferrer">Open message</a></div></article>';
 return '<article class="public-sermon-card">'+(s.thumbnail_url?'<img class="public-sermon-cover" src="'+esc(s.thumbnail_url)+'" alt="" loading="lazy">':"")+mediaMarkup(s)+'<div class="public-sermon-content">'+(meta?'<span class="public-sermon-meta">'+meta+'</span>':"")+'<h3>'+esc(s.title)+'</h3>'+(s.description?'<p>'+esc(s.description)+'</p>':"")+'</div></article>';
}
if(roots.length){
 const {data,error}=await supabase.from("church_sermons").select("id,title,description,speaker,scripture_reference,preached_at,media_type,media_url,thumbnail_url").eq("status","published").order("preached_at",{ascending:false,nullsFirst:false}).order("created_at",{ascending:false}).limit(8);
 for(const root of roots){
  if(error){root.innerHTML='<p class="sermon-empty">Sermons are temporarily unavailable. Please try again later.</p>';continue}
  if(!data?.length){root.innerHTML='<p class="sermon-empty">New sermons and teaching resources will be shared here soon.</p>';continue}
  root.innerHTML=data.map(s=>card(s,root.id==="member-sermon-list")).join("");
 }
}
