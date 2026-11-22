import{createClient}from"https://esm.sh/@supabase/supabase-js@2";
const supabase=createClient("https://hlnkyczwdgvnrvuhdypk.supabase.co","sb_publishable_KRxRK1s-EIgOUZ7VdKBj_Q_WwqswkIl");
let ready=false;
supabase.auth.getSession().then(({data})=>{ready=!!data.session;});
let lastMessage="",lastAt=0;
async function report(message,stack,type){
 if(!ready)return;
 const now=Date.now();if(message===lastMessage&&now-lastAt<10000)return;
 lastMessage=message;lastAt=now;
 try{await supabase.rpc("report_client_error",{p_message:String(message||"Unknown browser error").slice(0,500),p_page:location.pathname,p_stack:String(stack||"").slice(0,1800),p_event_type:type||"error"});}catch{}
}
window.addEventListener("error",e=>report(e.message||"Script error",e.error?.stack,"window_error"));
window.addEventListener("unhandledrejection",e=>report(e.reason?.message||String(e.reason||"Unhandled promise rejection"),e.reason?.stack,"unhandled_rejection"));
