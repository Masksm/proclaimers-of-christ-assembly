import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase=createClient("https://hlnkyczwdgvnrvuhdypk.supabase.co","sb_publishable_KRxRK1s-EIgOUZ7VdKBj_Q_WwqswkIl");
const form=document.querySelector("#ministry-form"),list=document.querySelector("#admin-ministry-list"),feedback=document.querySelector("#ministry-feedback"),submit=document.querySelector("#ministry-submit");
const f={id:document.querySelector("#ministry-id"),name:document.querySelector("#ministry-name"),description:document.querySelector("#ministry-description"),leader:document.querySelector("#ministry-leader"),contact:document.querySelector("#ministry-contact"),image:document.querySelector("#ministry-image"),status:document.querySelector("#ministry-status")};
let ministries=[];
const modal=document.querySelector("#ministries-modal"),launcher=document.querySelector("#ministries-card");
function openModal(){modal.hidden=false;modal.setAttribute("aria-hidden","false");document.body.classList.add("modal-open");}
function closeModal(){modal.hidden=true;modal.setAttribute("aria-hidden","true");document.body.classList.remove("modal-open");reset();}
launcher.addEventListener("click",openModal);launcher.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();openModal();}});
modal.addEventListener("click",event=>{if(event.target.closest("[data-close-ministries]"))closeModal();});
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&!modal.hidden)closeModal();});
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function message(v,error=false){feedback.textContent=v;feedback.classList.toggle("error",error);}
function reset(){form.reset();f.image.dataset.currentUrl="";document.querySelector("#ministry-image-current").textContent="";f.id.value="";document.querySelector("#ministry-form-title").textContent="Add a ministry";submit.textContent="Save ministry";document.querySelector("#ministry-cancel").hidden=true;message("");}
function render(){
 document.querySelector("#ministry-count").textContent=ministries.length+" item"+(ministries.length===1?"":"s");
 if(!ministries.length){list.innerHTML='<p class="list-empty">No ministries yet. Add the first ministry or department.</p>';return;}
 list.innerHTML=ministries.map(m=>'<article class="admin-event-item"><div class="admin-event-item-top"><h4>'+esc(m.name)+'</h4><span class="event-badge '+m.status+'">'+esc(m.status)+'</span></div><p>'+esc(m.description||"No description added.")+'</p><div class="event-meta">'+(m.leader_name?"Leader: "+esc(m.leader_name):"Leader not specified")+(m.contact_info?" · "+esc(m.contact_info):"")+'</div><div class="event-item-actions"><button class="event-action" data-edit="'+m.id+'" type="button">Edit</button><button class="event-action delete" data-delete="'+m.id+'" type="button">Delete</button></div></article>').join("");
}
async function load(){list.innerHTML='<p class="list-empty">Loading ministries…</p>';const {data,error}=await supabase.from("church_ministries").select("*").order("name",{ascending:true});if(error){list.innerHTML='<p class="list-empty">Unable to load ministries: '+esc(error.message)+'</p>';return;}ministries=data||[];render();}
form.addEventListener("submit",async ev=>{
 ev.preventDefault();message("");
 const {data:{user}}=await supabase.auth.getUser();if(!user){message("Your session has expired. Sign in again.",true);return;}
 const file=f.image.files[0];if(file&&(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>5*1024*1024)){message("Choose a JPG, PNG or WebP image no larger than 5 MB.",true);return;}
 submit.disabled=true;submit.textContent="Saving…";
 let imageUrl=f.image.dataset.currentUrl||null;
 if(file){const ext=({"image/jpeg":"jpg","image/png":"png","image/webp":"webp"})[file.type];const path=user.id+"/"+crypto.randomUUID()+"."+ext;const {error}=await supabase.storage.from("church-ministry-images").upload(path,file,{contentType:file.type,upsert:false});if(error){submit.disabled=false;submit.textContent=f.id.value?"Update ministry":"Save ministry";message("Image upload failed: "+error.message,true);return;}imageUrl=supabase.storage.from("church-ministry-images").getPublicUrl(path).data.publicUrl;}
 const payload={name:f.name.value.trim(),description:f.description.value.trim()||null,leader_name:f.leader.value.trim()||null,contact_info:f.contact.value.trim()||null,image_url:imageUrl,status:f.status.value};
 const editing=Boolean(f.id.value);const result=editing?await supabase.from("church_ministries").update(payload).eq("id",f.id.value):await supabase.from("church_ministries").insert({...payload,created_by:user.id});
 submit.disabled=false;submit.textContent=editing?"Update ministry":"Save ministry";
 if(result.error){message(result.error.message,true);return;}message(editing?"Ministry updated.":"Ministry saved.");reset();await load();
});
document.querySelector("#ministry-cancel").addEventListener("click",reset);
list.addEventListener("click",async ev=>{
 const edit=ev.target.closest("[data-edit]"),del=ev.target.closest("[data-delete]");
 if(edit){const m=ministries.find(x=>x.id===edit.dataset.edit);if(!m)return;f.id.value=m.id;f.name.value=m.name;f.description.value=m.description||"";f.leader.value=m.leader_name||"";f.contact.value=m.contact_info||"";f.image.value="";f.image.dataset.currentUrl=m.image_url||"";document.querySelector("#ministry-image-current").textContent=m.image_url?"Current image saved. Choose a new file to replace it.":"No image uploaded yet.";f.status.value=m.status;document.querySelector("#ministry-form-title").textContent="Edit ministry";submit.textContent="Update ministry";document.querySelector("#ministry-cancel").hidden=false;message("Editing "+m.name);openModal();f.name.focus();}
 if(del){const m=ministries.find(x=>x.id===del.dataset.delete);if(!m||!confirm('Permanently delete "'+m.name+'"?'))return;del.disabled=true;const {error}=await supabase.from("church_ministries").delete().eq("id",m.id);if(error){message(error.message,true);del.disabled=false;return;}message("Ministry deleted.");await load();}
});
await load();