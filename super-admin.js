import{createClient}from"https://esm.sh/@supabase/supabase-js@2";
const PROJECT_URL="https://hlnkyczwdgvnrvuhdypk.supabase.co";
const PUBLIC_KEY="sb_publishable_KRxRK1s-EIgOUZ7VdKBj_Q_WwqswkIl";
const supabase=createClient(PROJECT_URL,PUBLIC_KEY);
const $=s=>document.querySelector(s);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=v=>v?new Intl.DateTimeFormat(undefined,{dateStyle:"medium",timeStyle:"short"}).format(new Date(v)):"Never";
const localDate=d=>{const x=new Date(d.getTime()-d.getTimezoneOffset()*60000);return x.toISOString().slice(0,10)};
const isoStart=v=>v?new Date(v+"T00:00:00").toISOString():null;
const isoEnd=v=>v?new Date(v+"T23:59:59.999").toISOString():null;
const fromInput=$("#sa-audit-from"),toInput=$("#sa-audit-to");
const today=new Date(),weekAgo=new Date(today);weekAgo.setDate(weekAgo.getDate()-7);
fromInput.value=localDate(weekAgo);toInput.value=localDate(today);
let users=[],auditRows=[],auditTotal=0,auditPage=0,report=null,health=null,loadingAudit=false;
const PAGE_SIZE=50;
const range=()=>({p_from:isoStart(fromInput.value),p_to:isoEnd(toInput.value)});
const setFeedback=(id,message,isError=false)=>{$(id).textContent=message||"";$(id).classList.toggle("error",!!isError)};
const csvCell=v=>'"'+String(v??"").replace(/"/g,'""')+'"';
const displayMeta=x=>{
 const m=x.metadata||{};
 return m.message||m.endpoint||m.title||m.name||m.new_role||m.status||m.http_status&&("HTTP "+m.http_status)||m.event_type||"Recorded";
};
const authGuard=async()=>{
 const{data:{session},error}=await supabase.auth.getSession();
 if(error||!session){location.replace("login.html");return false;}
 const{data:role,error:roleError}=await supabase.rpc("get_my_role");
 if(roleError||role!=="super_admin"){location.replace(role==="admin"?"admin.html":"dashboard.html");return false;}
 $("#sa-email").textContent=session.user.email||"Verified developer";
 return true;
};
async function loadUsers(){
 $("#sa-user-rows").innerHTML='<tr><td colspan="4">Loading accounts…</td></tr>';
 const{data,error}=await supabase.rpc("super_admin_list_users");
 if(error){$("#sa-user-rows").innerHTML='<tr><td colspan="4">Could not load accounts. Access may have expired.</td></tr>';setFeedback("#sa-user-feedback",error.message,true);return;}
 users=data||[];$("#sa-user-count").textContent=users.length;
 $("#sa-admin-count").textContent=users.filter(u=>u.role==="admin"||u.role==="super_admin").length;
 renderUsers();setFeedback("#sa-user-feedback","");
}
function renderUsers(){
 const term=$("#sa-user-search").value.toLowerCase(),filter=$("#sa-role-filter").value;
 const rows=users.filter(u=>(filter==="all"||u.role===filter)&&[u.email,u.full_name,u.user_id].join(" ").toLowerCase().includes(term));
 $("#sa-user-rows").innerHTML=rows.length?rows.map(u=>'<tr><td><strong>'+esc(u.full_name||"Unnamed account")+'</strong><small>'+esc(u.email||"No email")+'</small></td><td><span class="sa-role '+esc(u.role)+'">'+esc(u.role.replace("_"," ").toUpperCase())+'</span></td><td>'+esc(fmt(u.last_sign_in_at))+'</td><td>'+(u.role==="super_admin"?'Protected developer account':('<div class="sa-row-action"><select aria-label="Role for '+esc(u.email)+'" data-role-select="'+esc(u.user_id)+'"><option value="member" '+(u.role==="member"?"selected":"")+'>Member</option><option value="admin" '+(u.role==="admin"?"selected":"")+'>Admin</option></select><button type="button" data-save-role="'+esc(u.user_id)+'">Save</button></div>'))+'</td></tr>').join(""):'<tr><td colspan="4">No accounts match this search.</td></tr>';
}
function auditParams(offset=0,limit=PAGE_SIZE){
 return {...range(),p_action:$("#sa-audit-filter").value||null,p_entity:$("#sa-entity-filter").value||null,p_search:$("#sa-audit-search").value.trim()||null,p_limit:limit,p_offset:offset};
}
async function fetchAudit(offset=0,limit=PAGE_SIZE){
 return await supabase.rpc("super_admin_search_audit_logs",auditParams(offset,limit));
}
async function loadAudit(){
 if(loadingAudit)return;loadingAudit=true;
 $("#sa-audit-rows").innerHTML='<tr><td colspan="5">Loading filtered audit records…</td></tr>';
 const{data,error}=await fetchAudit(auditPage*PAGE_SIZE);
 loadingAudit=false;
 if(error){$("#sa-audit-rows").innerHTML='<tr><td colspan="5">Audit records could not be loaded.</td></tr>';setFeedback("#sa-audit-feedback",error.message,true);return;}
 auditRows=data||[];auditTotal=Number(auditRows[0]?.total_count||0);
 $("#sa-audit-rows").innerHTML=auditRows.length?auditRows.map(x=>'<tr><td>'+esc(fmt(x.created_at))+'</td><td><strong>'+esc(x.actor_name||x.actor_role||"System")+'</strong><small>'+esc(x.actor_email||x.actor_id||"No signed-in actor")+'</small></td><td><strong>'+esc(x.action.replaceAll("_"," ").toUpperCase())+'</strong><small>'+esc(x.outcome)+'</small></td><td>'+esc(x.entity)+'<small>'+esc(x.entity_id||"")+'</small></td><td>'+esc(displayMeta(x))+'</td></tr>').join(""):'<tr><td colspan="5">No audit records match these filters.</td></tr>';
 const first=auditTotal?auditPage*PAGE_SIZE+1:0,last=auditPage*PAGE_SIZE+auditRows.length;
 $("#sa-audit-page-info").textContent=first+"–"+last+" of "+auditTotal+" records";
 $("#sa-audit-prev").disabled=auditPage===0;
 $("#sa-audit-next").disabled=(auditPage+1)*PAGE_SIZE>=auditTotal;
 $("#sa-audit-count").textContent=auditTotal;
 setFeedback("#sa-audit-feedback","");
}
function renderBars(target,items,labelKey,valueKey){
 const max=Math.max(1,...items.map(x=>Number(x[valueKey]||0)));
 $(target).innerHTML=items.length?items.map(x=>'<div class="sa-bar-row"><div class="sa-bar-label"><span>'+esc(x[labelKey])+'</span><b>'+esc(x[valueKey])+'</b></div><div class="sa-bar-track"><i style="width:'+Math.max(3,Number(x[valueKey]||0)/max*100)+'%"></i></div></div>').join(""):'<p class="sa-empty">No activity in this period.</p>';
}
async function loadReports(){
 $("#sa-admin-activity").innerHTML='<p class="sa-empty">Building report…</p>';
 const{data,error}=await supabase.rpc("super_admin_get_activity_report",range());
 if(error){setFeedback("#sa-audit-feedback","Report unavailable: "+error.message,true);return;}
 report=data||{};
 $("#sa-report-total").textContent=Number(report.total_actions||0).toLocaleString();
 $("#sa-report-failed").textContent=Number(report.failed_actions||0).toLocaleString();
 $("#sa-report-errors").textContent=Number(report.error_count||0).toLocaleString();
 $("#sa-error-count").textContent=Number(report.error_count||0).toLocaleString();
 renderBars("#sa-admin-activity",report.admin_activity||[],"email","actions");
 renderBars("#sa-action-activity",report.action_counts||[],"action","count");
 const days=report.daily_activity||[],max=Math.max(1,...days.map(x=>Number(x.count||0)));
 $("#sa-daily-activity").innerHTML=days.length?days.map(x=>'<div class="sa-day-bar"><div class="sa-day-column"><i style="height:'+Math.max(4,Number(x.count||0)/max*100)+'%"></i></div><b>'+esc(x.count)+'</b><small>'+esc(x.day.slice(5))+'</small></div>').join(""):'<p class="sa-empty">No activity recorded in this period.</p>';
 renderSecurityAlerts(report.security_alerts||[]);
}
function renderSecurityAlerts(alerts){
 const target=$("#sa-security-alerts");
 target.innerHTML=alerts.length?alerts.map(a=>'<article class="sa-alert '+(a.severity==="high"?"high":"medium")+'"><span class="sa-alert-mark">'+(a.severity==="high"?"!":"•")+'</span><div><b>'+esc(a.title)+'</b><p>'+esc(a.detail)+'</p></div><small>'+esc(a.severity.toUpperCase())+' · '+esc(a.count)+'</small></article>').join(""):'<div class="sa-no-alerts"><span>✓</span><div><b>No activity-based security alerts</b><p>No repeated authorization failures or deletion events were detected in this date range.</p></div></div>';
}
async function loadHealth(){
 $("#sa-health-grid").innerHTML='<article class="sa-health-item"><span class="sa-health-dot pending"></span><div><b>Running checks</b><small>Connecting to database and configuration…</small></div></article>';
 const{data,error}=await supabase.rpc("super_admin_system_health");
 if(error){$("#sa-health-grid").innerHTML='<article class="sa-health-item"><span class="sa-health-dot fail"></span><div><b>Health check failed</b><small>'+esc(error.message)+'</small></div></article>';setFeedback("#sa-health-feedback",error.message,true);return;}
 health=data||{};
 const checks=[
  ["Database connection",health.database_status==="healthy","PostgreSQL "+(health.database_version||"")],
  ["Authentication schema",!!health.auth_schema_reachable,"Auth user directory is reachable"],
  ["Storage configuration",!!health.storage_schema_reachable,(health.storage_bucket_count||0)+" storage buckets configured"],
  ["Required database tables",!!health.all_required_tables_present,(health.required_tables_present||0)+" of "+(health.required_tables_total||0)+" required tables found"],
  ["Row-level security",!!health.all_required_tables_protected,(health.rls_enabled_tables||0)+" of "+(health.required_tables_total||0)+" core tables have RLS enabled"]
 ];
 $("#sa-health-grid").innerHTML=checks.map(c=>'<article class="sa-health-item"><span class="sa-health-dot '+(c[1]?"pass":"fail")+'"></span><div><b>'+esc(c[0])+'</b><small>'+esc(c[2])+'</small></div><strong class="sa-check-status '+(c[1]?"pass":"fail")+'">'+(c[1]?"PASS":"CHECK")+'</strong></article>').join("");
 const buckets=health.storage_buckets||[];
 const config=[
  ["Supabase project",new URL(PROJECT_URL).hostname=== "hlnkyczwdgvnrvuhdypk.supabase.co","hlnkyczwdgvnrvuhdypk"],
  ["Browser API key",PUBLIC_KEY.startsWith("sb_publishable_"),"Publishable key configured; no service key used in browser"],
  ["Current website host",true,location.hostname],
  ["Storage buckets",buckets.length>0,buckets.map(b=>b.name+(b.public?" (public)":" (private)")).join(", ")||"No buckets found"]
 ];
 $("#sa-config-checks").innerHTML=config.map(c=>'<div class="sa-config-row"><span class="sa-health-dot '+(c[1]?"pass":"fail")+'"></span><b>'+esc(c[0])+'</b><small>'+esc(c[2])+'</small><strong class="'+(c[1]?"pass":"fail")+'">'+(c[1]?"OK":"REVIEW")+'</strong></div>').join("");
 $("#sa-health-checked").textContent="Last checked: "+fmt(health.checked_at)+" · Database size: "+(Number(health.database_size_bytes||0)/1024/1024).toFixed(1)+" MB · Registered accounts: "+Number(health.registered_accounts||0);
 setFeedback("#sa-health-feedback",checks.every(c=>c[1])?"All core checks passed.":"One or more checks need attention.",!checks.every(c=>c[1]));
}
async function exportCsv(){
 const button=$("#sa-export-audit");button.disabled=true;button.textContent="Preparing…";
 try{
  const first=await fetchAudit(0,200);if(first.error)throw first.error;
  const rows=[...(first.data||[])],total=Number(rows[0]?.total_count||0),limit=Math.min(total,10000);
  for(let offset=rows.length;offset<limit;offset+=200){
   const page=await fetchAudit(offset,200);if(page.error)throw page.error;
   if(!page.data?.length)break;rows.push(...page.data);
  }
  const headers=["id","created_at","actor_email","actor_name","actor_role","action","entity","entity_id","outcome","metadata"];
  const lines=[headers.map(csvCell).join(",")];
  rows.slice(0,limit).forEach(x=>lines.push([x.id,x.created_at,x.actor_email,x.actor_name,x.actor_role,x.action,x.entity,x.entity_id,x.outcome,JSON.stringify(x.metadata||{})].map(csvCell).join(",")));
  const blob=new Blob(["\ufeff"+lines.join("\r\n")],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download="proclaimers-audit-"+localDate(new Date())+".csv";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
  setFeedback("#sa-audit-feedback","Exported "+rows.length+" of "+total+" matching records"+(total>10000?" (10,000 row export cap).":".")); 
 }catch(e){setFeedback("#sa-audit-feedback","CSV export failed: "+(e.message||e),true);}
 button.disabled=false;button.textContent="Export CSV ↓";
}
function applyFilters(){auditPage=0;loadAudit();loadReports();}
function resetFilters(){
 fromInput.value=localDate(weekAgo);toInput.value=localDate(today);
 $("#sa-audit-filter").value="";$("#sa-entity-filter").value="";$("#sa-audit-search").value="";
 applyFilters();
}
let searchTimer;
$("#sa-user-search").addEventListener("input",renderUsers);$("#sa-role-filter").addEventListener("change",renderUsers);
$("#sa-audit-search").addEventListener("input",()=>{clearTimeout(searchTimer);searchTimer=setTimeout(applyFilters,300);});
[fromInput,toInput,$("#sa-audit-filter"),$("#sa-entity-filter")].forEach(el=>el.addEventListener("change",applyFilters));
$("#sa-refresh-users").addEventListener("click",loadUsers);
$("#sa-reset-audit").addEventListener("click",resetFilters);
$("#sa-export-audit").addEventListener("click",exportCsv);
$("#sa-audit-prev").addEventListener("click",()=>{if(auditPage>0){auditPage--;loadAudit();}});
$("#sa-audit-next").addEventListener("click",()=>{if((auditPage+1)*PAGE_SIZE<auditTotal){auditPage++;loadAudit();}});
$("#sa-refresh-reports").addEventListener("click",loadReports);
$("#sa-refresh-security").addEventListener("click",loadReports);
$("#sa-refresh-health").addEventListener("click",loadHealth);
$("#sa-user-rows").addEventListener("click",async e=>{
 const b=e.target.closest("[data-save-role]");if(!b)return;
 const id=b.dataset.saveRole,select=$('[data-role-select="'+CSS.escape(id)+'"]'),newRole=select.value;
 if(!confirm("Change this account's role to "+newRole+"?"))return;
 b.disabled=true;b.textContent="Saving…";setFeedback("#sa-user-feedback","");
 const{error}=await supabase.rpc("super_admin_set_user_role",{target_user_id:id,new_role:newRole});
 if(error){setFeedback("#sa-user-feedback",error.message,true);b.disabled=false;b.textContent="Save";return;}
 setFeedback("#sa-user-feedback","Role updated and recorded in the audit trail.");
 await Promise.all([loadUsers(),loadAudit(),loadReports()]);
});
$("#sa-signout").addEventListener("click",async()=>{await supabase.auth.signOut();location.replace("login.html");});
if(await authGuard()){
 await Promise.all([loadUsers(),loadAudit(),loadReports(),loadHealth()]);
}
