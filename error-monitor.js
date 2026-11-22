import{createClient}from"https://esm.sh/@supabase/supabase-js@2";
const supabase=createClient("https://hlnkyczwdgvnrvuhdypk.supabase.co","sb_publishable_KRxRK1s-EIgOUZ7VdKBj_Q_WwqswkIl");
let ready=false,queue=window.__pcApiFailureQueue||[],lastMessage="",lastAt=0;
const recent=new Map();
async function report(message,stack,type){
 if(!ready)return;
 const now=Date.now();if(message===lastMessage&&now-lastAt<10000)return;
 lastMessage=message;lastAt=now;
 try{await supabase.rpc("report_client_error",{p_message:String(message||"Unknown browser error").slice(0,500),p_page:location.pathname,p_stack:String(stack||"").replace(/(access_token|refresh_token|token|apikey|password)=([^&\\s]+)/gi,"$1=[redacted]").slice(0,1800),p_event_type:type||"error"});}catch{}
}
async function reportApi(event){
 if(!ready||!event)return;
 const key=[event.status,event.method,event.endpoint].join("|"),now=Date.now();
 if(recent.has(key)&&now-recent.get(key)<15000)return;
 recent.set(key,now);
 try{await supabase.rpc("report_client_api_error",{p_http_status:event.status||500,p_method:event.method||"GET",p_endpoint:event.endpoint||"unknown",p_service:event.service||"data_api",p_error_code:event.errorCode||"",p_request_id:event.requestId||""});}catch{}
}
window.__pcReportApiFailure=reportApi;
supabase.auth.getSession().then(({data,error})=>{
 ready=!!data?.session&&!error;
 if(ready){const pending=queue.splice(0,50);pending.forEach(event=>reportApi(event));}
}).catch(()=>{});
window.addEventListener("error",e=>report(e.message||"Script error",e.error?.stack,"window_error"));
window.addEventListener("unhandledrejection",e=>report(e.reason?.message||String(e.reason||"Unhandled promise rejection"),e.reason?.stack,"unhandled_rejection"));
