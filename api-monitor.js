(function(){
 const PROJECT_HOST="hlnkyczwdgvnrvuhdypk.supabase.co";
 const originalFetch=window.fetch.bind(window);
 const queue=window.__pcApiFailureQueue=window.__pcApiFailureQueue||[];
 const isProjectUrl=value=>{try{return new URL(value,location.href).hostname===PROJECT_HOST;}catch{return false;}};
 const endpointOf=value=>{try{return new URL(value,location.href).pathname.slice(0,180);}catch{return "unknown";}};
 const serviceOf=path=>path.startsWith("/auth/v1")?"auth":path.startsWith("/storage/v1")?"storage":path.startsWith("/functions/v1")?"edge_function":path.startsWith("/rest/v1")?"data_api":"supabase";
 const emit=event=>{if(queue.length<50)queue.push(event);if(typeof window.__pcReportApiFailure==="function")window.__pcReportApiFailure(event);};
 window.fetch=async function(input,init){
  const raw=input instanceof Request?input.url:input;
  const isSupabase=isProjectUrl(raw);
  const path=isSupabase?endpointOf(raw):"";
  const method=String(init?.method||(input instanceof Request?input.method:"GET")).toUpperCase();
  if(isSupabase&&(path.includes("/rpc/report_client_api_error")||path.includes("/rpc/report_client_error")))return originalFetch(input,init);
  try{
   const response=await originalFetch(input,init);
   if(isSupabase&&response.status>=400)emit({status:response.status,method,endpoint:path,service:serviceOf(path),requestId:response.headers.get("sb-request-id")||response.headers.get("x-request-id")||"",errorCode:response.headers.get("x-error-code")||""});
   return response;
  }catch(error){
   if(isSupabase)emit({status:0,method,endpoint:path,service:serviceOf(path),requestId:"",errorCode:"NETWORK_ERROR"});
   throw error;
  }
 };
})();