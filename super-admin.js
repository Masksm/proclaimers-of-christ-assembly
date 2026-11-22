import{createClient}from"https://esm.sh/@supabase/supabase-js@2";
const supabase=createClient("https://hlnkyczwdgvnrvuhdypk.supabase.co","sb_publishable_KRxRK1s-EIgOUZ7VdKBj_Q_WwqswkIl");
const $=s=>document.querySelector(s);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=v=>v?new Intl.DateTimeFormat(undefined,{dateStyle:"medium",timeStyle:"short"}).format(new Date(v)):"Never";
let users=[],logs=[];
const{data:{session}}=await supabase.auth.getSession();
if(!session){location.replace("login.html");}
else{
 const{data:role,error}=await supabase.rpc("get_my_role");
 if(error||role!=="super_admin"){location.replace(role==="admin"?"admin.html":"dashboard.html");}
 else{$("#sa-email").textContent=session.user.email||"Verified developer";await Promise.all([loadUsers(),loadLogs()]);}
}
async function loadUsers(){
 $("#sa-user-rows").innerHTML='<tr><td colspan="4">Loading accounts…</td></tr>';
 const{data,error}=await supabase.rpc("super_admin_list_users");
 if(error){$("#sa-user-rows").innerHTML='<tr><td colspan="4">Could not load accounts. Access may have expired.</td></tr>';$("#sa-user-feedback").textContent=error.message;$("#sa-user-feedback").classList.add("error");return;}
 users=data||[];$("#sa-user-count").textContent=users.length;$("#sa-admin-count").textContent=users.filter(u=>u.role==="admin"||u.role==="super_admin").length;renderUsers();
}
function renderUsers(){
 const term=$("#sa-user-search").value.toLowerCase(),filter=$("#sa-role-filter").value;
 const rows=users.filter(u=>(filter==="all"||u.role===filter)&&[u.email,u.full_name,u.user_id].join(" ").toLowerCase().includes(term));
 $("#sa-user-rows").innerHTML=rows.length?rows.map(u=>'<tr><td><strong>'+esc(u.full_name||"Unnamed account")+'</strong><small>'+esc(u.email||"No email")+'</small></td><td><span class="sa-role '+esc(u.role)+'">'+esc(u.role.replace("_"," ").toUpperCase())+'</span></td><td>'+esc(fmt(u.last_sign_in_at))+'</td><td>'+(u.role==="super_admin"?'Protected developer account':('<div class="sa-row-action"><select aria-label="Role for '+esc(u.email)+'" data-role-select="'+esc(u.user_id)+'"><option value="member" '+(u.role==="member"?"selected":"")+'>Member</option><option value="admin" '+(u.role==="admin"?"selected":"")+'>Admin</option></select><button type="button" data-save-role="'+esc(u.user_id)+'">Save</button></div>'))+'</td></tr>').join(""):'<tr><td colspan="4">No accounts match this search.</td></tr>';
}
async function loadLogs(){
 $("#sa-audit-rows").innerHTML='<tr><td colspan="5">Loading audit trail…</td></tr>';
 const{data,error}=await supabase.rpc("super_admin_get_audit_logs",{result_limit:250,before_time:null});
 if(error){$("#sa-audit-rows").innerHTML='<tr><td colspan="5">Audit records could not be loaded.</td></tr>';$("#sa-audit-feedback").textContent=error.message;$("#sa-audit-feedback").classList.add("error");return;}
 logs=data||[];$("#sa-audit-count").textContent=logs.length;$("#sa-error-count").textContent=logs.filter(x=>x.action==="client_error").length;renderLogs();
}
function renderLogs(){
 const term=$("#sa-audit-search").value.toLowerCase(),filter=$("#sa-audit-filter").value;
 const rows=logs.filter(x=>(filter==="all"||x.action===filter)&&JSON.stringify(x).toLowerCase().includes(term));
 $("#sa-audit-rows").innerHTML=rows.length?rows.map(x=>'<tr><td>'+esc(fmt(x.created_at))+'</td><td><strong>'+esc(x.actor_role||"System")+'</strong><small>'+esc(x.actor_id||"No signed-in actor")+'</small></td><td><strong>'+esc(x.action.replaceAll("_"," ").toUpperCase())+'</strong><small>'+esc(x.outcome)+'</small></td><td>'+esc(x.entity)+'<small>'+esc(x.entity_id||"")+'</small></td><td>'+esc(x.metadata?.message||x.metadata?.title||x.metadata?.name||x.metadata?.new_role||x.metadata?.status||"Recorded")+'</td></tr>').join(""):'<tr><td colspan="5">No matching audit records.</td></tr>';
}
$("#sa-user-search").addEventListener("input",renderUsers);$("#sa-role-filter").addEventListener("change",renderUsers);
$("#sa-audit-search").addEventListener("input",renderLogs);$("#sa-audit-filter").addEventListener("change",renderLogs);
$("#sa-refresh-users").addEventListener("click",loadUsers);$("#sa-refresh-audit").addEventListener("click",loadLogs);
$("#sa-user-rows").addEventListener("click",async e=>{
 const b=e.target.closest("[data-save-role]");if(!b)return;
 const id=b.dataset.saveRole,select=$('[data-role-select="'+CSS.escape(id)+'"]'),newRole=select.value;
 if(!confirm("Change this account's role to "+newRole+"?"))return;
 b.disabled=true;b.textContent="Saving…";$("#sa-user-feedback").textContent="";
 const{error}=await supabase.rpc("super_admin_set_user_role",{target_user_id:id,new_role:newRole});
 if(error){$("#sa-user-feedback").textContent=error.message;$("#sa-user-feedback").classList.add("error");b.disabled=false;b.textContent="Save";return;}
 $("#sa-user-feedback").classList.remove("error");$("#sa-user-feedback").textContent="Role updated and recorded in the audit trail.";await Promise.all([loadUsers(),loadLogs()]);
});
async function signOut(){await supabase.auth.signOut();location.replace("login.html");}
$("#sa-signout").addEventListener("click",signOut);
