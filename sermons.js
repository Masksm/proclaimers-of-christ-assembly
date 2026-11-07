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
function getVideoEmbed(s){
 let u;try{u=new URL(s.media_url)}catch{return null}
 const host=u.hostname.toLowerCase().replace(/^www\./,"");let id=null;
 if(host==="youtu.be")id=u.pathname.slice(1).split("/")[0];
 if(host==="youtube.com"||host==="m.youtube.com")id=u.searchParams.get("v")||u.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/)?.[1];
 if(id&&/^[\w-]{6,20}$/.test(id))return "https://www.youtube-nocookie.com/embed/"+encodeURIComponent(id)+"?autoplay=1";
 if(host==="vimeo.com"||host==="player.vimeo.com"){const v=u.pathname.split("/").filter(Boolean).pop();if(/^\d+$/.test(v||""))return "https://player.vimeo.com/video/"+v+"?autoplay=1";}
 if(/\.(mp4|webm|mov|m4v)$/i.test(u.pathname))return u.href;
 return null;
}
function openSermonViewer(s){
 const viewer=document.querySelector("#sermon-viewer-modal"),stage=document.querySelector("#sermon-viewer-stage"),title=document.querySelector("#sermon-viewer-title");if(!viewer||!stage)return;
 title.textContent=s.title||"Sermon video";const src=getVideoEmbed(s);
 if(src&&/\.(mp4|webm|mov|m4v)(\?|$)/i.test(src))stage.innerHTML='<video controls autoplay playsinline src="'+esc(src)+'">Your browser does not support video playback.</video>';
 else if(src)stage.innerHTML='<iframe src="'+esc(src)+'" title="'+esc(s.title)+'" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>';
 else stage.innerHTML='<p class="sermon-viewer-unavailable">This sermon link cannot be played in the website viewer.</p>';
 viewer.hidden=false;viewer.setAttribute("aria-hidden","false");document.body.classList.add("sermon-viewer-open");
}
function closeSermonViewer(){const viewer=document.querySelector("#sermon-viewer-modal"),stage=document.querySelector("#sermon-viewer-stage");if(!viewer||!stage)return;stage.innerHTML="";viewer.hidden=true;viewer.setAttribute("aria-hidden","true");document.body.classList.remove("sermon-viewer-open");}
function card(s,compact=false){
 const meta=[s.speaker,s.scripture_reference,s.preached_at].filter(Boolean).map(esc).join(" · ");const videoSource=getVideoEmbed(s);
 if(compact)return '<article class="member-sermon-card">'+(s.thumbnail_url?'<img src="'+esc(s.thumbnail_url)+'" alt="" loading="lazy">':'')+'<div><h4>'+esc(s.title)+'</h4><p>'+meta+'</p>'+(videoSource?'<button class="member-sermon-watch" type="button" data-watch-sermon="'+esc(s.id)+'">Watch in website</button>':'<a href="'+esc(s.media_url)+'" target="_blank" rel="noopener noreferrer">Open message</a>')+'</div></article>';
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
const viewerMarkup='<section class="sermon-viewer-modal" id="sermon-viewer-modal" role="dialog" aria-modal="true" aria-labelledby="sermon-viewer-title" aria-hidden="true" hidden><button class="sermon-viewer-backdrop" type="button" data-close-sermon-viewer aria-label="Close sermon viewer"></button><div class="sermon-viewer-panel"><header><h2 id="sermon-viewer-title">Sermon video</h2><button type="button" class="sermon-viewer-close" data-close-sermon-viewer aria-label="Close video">×</button></header><div id="sermon-viewer-stage" class="sermon-viewer-stage"></div></div></section>';
if(!document.querySelector("#sermon-viewer-modal"))document.body.insertAdjacentHTML("beforeend",viewerMarkup);
document.addEventListener("click",event=>{const watch=event.target.closest("[data-watch-sermon]");if(watch){const sermon=data?.find(s=>s.id===watch.dataset.watchSermon);if(sermon)openSermonViewer(sermon);return;}if(event.target.closest("[data-close-sermon-viewer]"))closeSermonViewer();});
document.addEventListener("keydown",event=>{if(event.key==="Escape")closeSermonViewer();});
