import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase=createClient("https://hlnkyczwdgvnrvuhdypk.supabase.co","sb_publishable_KRxRK1s-EIgOUZ7VdKBj_Q_WwqswkIl");
const form=document.querySelector("#event-form"),list=document.querySelector("#admin-event-list"),feedback=document.querySelector("#event-feedback"),submit=document.querySelector("#event-submit");
const f={id:document.querySelector("#event-id"),title:document.querySelector("#event-title"),description:document.querySelector("#event-description"),start:document.querySelector("#event-start"),end:document.querySelector("#event-end"),venue:document.querySelector("#event-venue"),image:document.querySelector("#event-image"),status:document.querySelector("#event-status")};
let events=[];
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const date=v=>new Intl.DateTimeFormat(undefined,{dateStyle:"medium",timeStyle:"short"}).format(new Date(v));
const local=v=>{const d=new Date(v);return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16)};
function message(v,error=false){feedback.textContent=v;feedback.classList.toggle("error",error)}
function reset(){form.reset();f.id.value="";document.querySelector("#event-form-title").textContent="Create an event";submit.textContent="Save event";document.querySelector("#event-cancel").hidden=true;message("")}
function render(){
 document.querySelector("#event-count").textContent=events.length+" event"+(events.length===1?"":"s");
 if(!events.length){list.innerHTML='<p class="list-empty">No events yet. Create your first church event.</p>';return}
 list.innerHTML=events.map(e=>`<article class="admin-event-item"><div class="admin-event-item-top"><h4>${esc(e.title)}</h4><span class="event-badge ${e.status}">${esc(e.status)}</span></div><p>${esc(e.description||"No description added.")}</p><div class="event-meta">${date(e.starts_at)}${e.venue?" · "+esc(e.venue):""}</div><div class="event-item-actions"><button class="event-action" data-edit="${e.id}" type="button">Edit</button><button class="event-action delete" data-delete="${e.id}" type="button">Delete</button></div></article>`).join("");
}
async function load(){list.innerHTML='<p class="list-empty">Loading events…</p>';const {data,error}=await supabase.from("church_events").select("*").order("starts_at",{ascending:false});if(error){list.innerHTML='<p class="list-empty">Unable to load events: '+esc(error.message)+'</p>';return}events=data||[];render()}
form.addEventListener("submit",async ev=>{
 ev.preventDefault();message("");
 if(f.end.value&&new Date(f.end.value)<new Date(f.start.value)){message("The end date must be after the start date.",true);return}
 const {data:{user}}=await supabase.auth.getUser();if(!user){message("Your session has expired. Sign in again.",true);return}
 const payload={title:f.title.value.trim(),description:f.description.value.trim()||null,starts_at:new Date(f.start.value).toISOString(),ends_at:f.end.value?new Date(f.end.value).toISOString():null,venue:f.venue.value.trim()||null,image_url:f.image.value.trim()||null,status:f.status.value};
 submit.disabled=true;submit.textContent="Saving…";
 const result=f.id.value?await supabase.from("church_events").update(payload).eq("id",f.id.value):await supabase.from("church_events").insert({...payload,created_by:user.id});
 submit.disabled=false;submit.textContent=f.id.value?"Update event":"Save event";
 if(result.error){message(result.error.message,true);return}
 message(f.id.value?"Event updated.":"Event saved.");reset();await load();
});
document.querySelector("#event-cancel").addEventListener("click",reset);
list.addEventListener("click",async ev=>{
 const edit=ev.target.closest("[data-edit]"),del=ev.target.closest("[data-delete]");
 if(edit){const e=events.find(x=>x.id===edit.dataset.edit);if(!e)return;f.id.value=e.id;f.title.value=e.title;f.description.value=e.description||"";f.start.value=local(e.starts_at);f.end.value=e.ends_at?local(e.ends_at):"";f.venue.value=e.venue||"";f.image.value=e.image_url||"";f.status.value=e.status;document.querySelector("#event-form-title").textContent="Edit event";submit.textContent="Update event";document.querySelector("#event-cancel").hidden=false;message("Editing "+e.title);form.scrollIntoView({behavior:"smooth",block:"start"})}
 if(del){const e=events.find(x=>x.id===del.dataset.delete);if(!e||!confirm('Permanently delete "'+e.title+'"?'))return;del.disabled=true;const {error}=await supabase.from("church_events").delete().eq("id",e.id);if(error){message(error.message,true);del.disabled=false;return}message("Event deleted.");await load()}
});
await load();