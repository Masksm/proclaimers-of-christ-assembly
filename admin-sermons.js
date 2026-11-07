import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase=createClient("https://hlnkyczwdgvnrvuhdypk.supabase.co","sb_publishable_KRxRK1s-EIgOUZ7VdKBj_Q_WwqswkIl");
const $=s=>document.querySelector(s);
const modal=$("#sermons-modal"),launcher=$("#sermons"),form=$("#sermon-form"),list=$("#admin-sermon-list"),feedback=$("#sermon-feedback"),submit=$("#sermon-submit");
const f={id:$("#sermon-id"),title:$("#sermon-title"),speaker:$("#sermon-speaker"),scripture:$("#sermon-scripture"),date:$("#sermon-date"),description:$("#sermon-description"),type:$("#sermon-type"),url:$("#sermon-url"),image:$("#sermon-image"),status:$("#sermon-status")};
let sermons=[];
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function msg(value,error=false){feedback.textContent=value;feedback.classList.toggle("error",error)}
function openModal(){modal.hidden=false;modal.setAttribute("aria-hidden","false");document.body.classList.add("modal-open");f.title.focus()}
function closeModal(){modal.hidden=true;modal.setAttribute("aria-hidden","true");document.body.classList.remove("modal-open");reset()}
launcher.addEventListener("click",openModal);
launcher.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openModal()}});
modal.addEventListener("click",e=>{if(e.target.closest("[data-close-sermons]"))closeModal()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!modal.hidden)closeModal()});
function reset(){form.reset();f.id.value="";f.image.dataset.currentUrl="";$("#sermon-image-current").textContent="";$("#sermon-form-title").textContent="Add a sermon";submit.textContent="Save sermon";$("#sermon-cancel").hidden=true;msg("")}
function render(){
 $("#sermon-count").textContent=sermons.length+" item"+(sermons.length===1?"":"s");
 if(!sermons.length){list.innerHTML='<p class="list-empty">No sermons yet. Add your first message.</p>';return}
 list.innerHTML=sermons.map(s=>'<article class="admin-event-item"><div class="sermon-admin-preview">'+(s.thumbnail_url?'<img src="'+esc(s.thumbnail_url)+'" alt="">':'')+'<div><div class="admin-event-item-top"><h4>'+esc(s.title)+'</h4><span class="event-badge '+esc(s.status)+'">'+esc(s.status)+'</span></div><div class="sermon-admin-meta">'+esc(s.media_type.toUpperCase())+(s.speaker?' · '+esc(s.speaker):'')+(s.preached_at?' · '+esc(s.preached_at):'')+'</div></div></div><p>'+esc(s.description||"No description added.")+'</p><div class="event-item-actions"><button class="event-action" data-edit="'+s.id+'" type="button">Edit</button><button class="event-action delete" data-delete="'+s.id+'" type="button">Delete</button></div></article>').join("");
}
async function load(){list.innerHTML='<p class="list-empty">Loading media…</p>';const {data,error}=await supabase.from("church_sermons").select("*").order("created_at",{ascending:false});if(error){list.innerHTML='<p class="list-empty">Unable to load sermons: '+esc(error.message)+'</p>';return}sermons=data||[];render()}
function safeHttps(value){try{const u=new URL(value);return u.protocol==="https:"?u:null}catch{return null}}
function storagePath(publicUrl){const marker="/storage/v1/object/public/church-sermon-images/";const i=String(publicUrl||"").indexOf(marker);return i<0?null:decodeURIComponent(publicUrl.slice(i+marker.length).split("?")[0])}
form.addEventListener("submit",async e=>{
 e.preventDefault();msg("");
 const parsed=safeHttps(f.url.value.trim());if(!parsed){msg("Enter a valid HTTPS media URL.",true);return}
 const image=f.image.files[0];if(image&&(!["image/jpeg","image/png","image/webp"].includes(image.type)||image.size>5*1024*1024)){msg("Choose a JPG, PNG or WebP cover image no larger than 5 MB.",true);return}
 const {data:{user}}=await supabase.auth.getUser();if(!user){msg("Your session expired. Sign in again.",true);return}
 const editing=Boolean(f.id.value),oldImage=f.image.dataset.currentUrl||null;
 submit.disabled=true;submit.textContent="Saving…";
 let imageUrl=oldImage;
 if(image){
  const ext=({"image/jpeg":"jpg","image/png":"png","image/webp":"webp"})[image.type],path=user.id+"/"+crypto.randomUUID()+"."+ext;
  const {error}=await supabase.storage.from("church-sermon-images").upload(path,image,{contentType:image.type,upsert:false});
  if(error){submit.disabled=false;submit.textContent=editing?"Update sermon":"Save sermon";msg("Cover upload failed: "+error.message,true);return}
  imageUrl=supabase.storage.from("church-sermon-images").getPublicUrl(path).data.publicUrl;
 }
 const payload={title:f.title.value.trim(),speaker:f.speaker.value.trim()||null,scripture_reference:f.scripture.value.trim()||null,preached_at:f.date.value||null,description:f.description.value.trim()||null,media_type:f.type.value,media_url:parsed.href,thumbnail_url:imageUrl,status:f.status.value};
 const result=editing?await supabase.from("church_sermons").update(payload).eq("id",f.id.value):await supabase.from("church_sermons").insert({...payload,created_by:user.id});
 submit.disabled=false;submit.textContent=editing?"Update sermon":"Save sermon";
 if(result.error){msg("Could not save sermon: "+result.error.message,true);return}
 if(image&&oldImage){const path=storagePath(oldImage);if(path)await supabase.storage.from("church-sermon-images").remove([path])}
 msg(editing?"Sermon updated.":"Sermon saved.");reset();await load();
});
$("#sermon-cancel").addEventListener("click",reset);
list.addEventListener("click",async e=>{
 const edit=e.target.closest("[data-edit]"),del=e.target.closest("[data-delete]");
 if(edit){const s=sermons.find(x=>x.id===edit.dataset.edit);if(!s)return;f.id.value=s.id;f.title.value=s.title;f.speaker.value=s.speaker||"";f.scripture.value=s.scripture_reference||"";f.date.value=s.preached_at||"";f.description.value=s.description||"";f.type.value=s.media_type;f.url.value=s.media_url;f.image.dataset.currentUrl=s.thumbnail_url||"";$("#sermon-image-current").textContent=s.thumbnail_url?"A cover image is saved. Choose a new file to replace it.":"No cover image uploaded.";f.status.value=s.status;$("#sermon-form-title").textContent="Edit sermon";submit.textContent="Update sermon";$("#sermon-cancel").hidden=false;openModal();return}
 if(del){const s=sermons.find(x=>x.id===del.dataset.delete);if(!s||!confirm('Permanently delete "'+s.title+'" from the media library?'))return;del.disabled=true;const {error}=await supabase.from("church_sermons").delete().eq("id",s.id);if(error){msg("Delete failed: "+error.message,true);del.disabled=false;return}if(s.thumbnail_url){const path=storagePath(s.thumbnail_url);if(path)await supabase.storage.from("church-sermon-images").remove([path])}msg("Sermon deleted.");await load()}
});
await load();
