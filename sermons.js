import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase=createClient("https://hlnkyczwdgvnrvuhdypk.supabase.co","sb_publishable_KRxRK1s-EIgOUZ7VdKBj_Q_WwqswkIl");
const roots=[...document.querySelectorAll("#public-sermon-list,#member-sermon-list")];
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function videoSource(s){
 let u;try{u=new URL(s.media_url)}catch{return null}
 const host=u.hostname.toLowerCase().replace(/^www\./,"");let id=null;
 if(host==="youtu.be")id=u.pathname.split("/").filter(Boolean)[0];
 if(["youtube.com","m.youtube.com","music.youtube.com"].includes(host)){id=u.searchParams.get("v")||u.pathname.match(/\/(?:embed|shorts|live)\/([^/?]+)/)?.[1];}
 if(id&&/^[\w-]{6,20}$/.test(id))return {kind:"iframe",src:"https://www.youtube-nocookie.com/embed/"+encodeURIComponent(id),provider:"YouTube"};
 if(host==="vimeo.com"||host==="player.vimeo.com"){const idv=u.pathname.split("/").filter(Boolean).pop();if(/^\d+$/.test(idv||""))return {kind:"iframe",src:"https://player.vimeo.com/video/"+idv,provider:"Vimeo"};}
 if(/\.(mp4|webm|m4v|ogv)$/i.test(u.pathname))return {kind:"video",src:u.href,provider:"Video"};
 if(s.media_type==="audio"||/\.(mp3|m4a|aac|ogg|wav|flac)$/i.test(u.pathname))return {kind:"audio",src:u.href,provider:"Audio"};
 return null;
}
function openViewer(s){
 const modal=document.querySelector("#sermon-viewer-modal"),stage=document.querySelector("#sermon-viewer-stage"),title=document.querySelector("#sermon-viewer-title");if(!modal||!stage)return;
 const source=videoSource(s);title.textContent=s.title||"Sermon";
 if(!source){stage.innerHTML='<p class="sermon-viewer-unavailable">This link cannot be embedded. Ask the media team to use a YouTube, Vimeo or direct MP4 link.</p>';}
 else if(source.kind==="iframe"){stage.innerHTML='<iframe src="'+esc(source.src)+'?autoplay=1" title="'+esc(s.title)+'" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>';}
 else if(source.kind==="video"){stage.innerHTML='<video controls autoplay playsinline preload="metadata" src="'+esc(source.src)+'">Your browser does not support video playback.</video>';}
 else{stage.innerHTML='<audio controls autoplay preload="metadata" src="'+esc(source.src)+'">Your browser does not support audio playback.</audio>';}
 modal.hidden=false;modal.setAttribute("aria-hidden","false");document.body.classList.add("sermon-viewer-open");
}
function closeViewer(){const modal=document.querySelector("#sermon-viewer-modal"),stage=document.querySelector("#sermon-viewer-stage");if(!modal||!stage)return;stage.innerHTML="";modal.hidden=true;modal.setAttribute("aria-hidden","true");document.body.classList.remove("sermon-viewer-open");}
function card(s,compact){
 const source=videoSource(s),meta=[s.speaker,s.scripture_reference,s.preached_at].filter(Boolean).map(esc).join(" · "),thumb=s.thumbnail_url?'<img class="sermon-card-thumb" src="'+esc(s.thumbnail_url)+'" alt="" loading="lazy">':'<div class="sermon-card-placeholder">✝</div>';
 const action=source?'<button class="sermon-watch-button" type="button" data-watch-sermon="'+esc(s.id)+'">▶ Watch '+(source.kind==="audio"?"audio":"sermon")+'</button>':'<span class="sermon-unavailable-label">Playback link unavailable</span>';
 if(compact)return '<article class="member-sermon-card">'+thumb+'<div class="member-sermon-details"><h4>'+esc(s.title)+'</h4>'+(meta?'<p>'+meta+'</p>':"")+action+'</div></article>';
 return '<article class="public-sermon-card"><div class="public-sermon-art">'+thumb+(source&&source.kind!=="audio"?'<button type="button" class="sermon-play-overlay" data-watch-sermon="'+esc(s.id)+'" aria-label="Play '+esc(s.title)+'">▶</button>':"")+'</div><div class="public-sermon-content">'+(meta?'<span class="public-sermon-meta">'+meta+'</span>':"")+'<h3>'+esc(s.title)+'</h3>'+(s.description?'<p>'+esc(s.description)+'</p>':"")+'<div class="public-sermon-actions">'+action+'</div></div></article>';
}
let sermons=[];
if(roots.length){
 const {data,error}=await supabase.from("church_sermons").select("id,title,description,speaker,scripture_reference,preached_at,media_type,media_url,thumbnail_url,created_at").eq("status","published").order("preached_at",{ascending:false,nullsFirst:false}).order("created_at",{ascending:false}).limit(12);
 sermons=data||[];
 for(const root of roots){if(error){root.innerHTML='<p class="sermon-empty">Sermons are temporarily unavailable. Please try again later.</p>';continue;}if(!sermons.length){root.innerHTML='<p class="sermon-empty">New sermons and teaching resources will be shared here soon.</p>';continue;}root.innerHTML=sermons.map(s=>card(s,root.id==="member-sermon-list")).join("");}
}
const viewerMarkup='<section class="sermon-viewer-modal" id="sermon-viewer-modal" role="dialog" aria-modal="true" aria-labelledby="sermon-viewer-title" aria-hidden="true" hidden><button class="sermon-viewer-backdrop" type="button" data-close-sermon-viewer aria-label="Close sermon viewer"></button><div class="sermon-viewer-panel"><header><h2 id="sermon-viewer-title">Sermon</h2><button type="button" class="sermon-viewer-close" data-close-sermon-viewer aria-label="Close video">×</button></header><div id="sermon-viewer-stage" class="sermon-viewer-stage"></div></div></section>';
if(!document.querySelector("#sermon-viewer-modal"))document.body.insertAdjacentHTML("beforeend",viewerMarkup);
document.addEventListener("click",e=>{const button=e.target.closest("[data-watch-sermon]");if(button){const sermon=sermons.find(s=>s.id===button.dataset.watchSermon);if(sermon)openViewer(sermon);return;}if(e.target.closest("[data-close-sermon-viewer]"))closeViewer();});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeViewer();});
