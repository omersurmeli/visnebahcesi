// Deno / Supabase Edge Function. Deploy with --no-verify-jwt ONLY for this device-token endpoint.
// Never log requests, tokens or service key. No CORS for browser use.
const respond=(status:number,code:string)=>new Response(JSON.stringify({code}),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store"}});
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
Deno.serve(async(req:Request)=>{
 if(req.method!=="POST")return respond(405,"method");
 const token=req.headers.get("x-device-token")||"";
 if(!/^[a-f0-9]{64}$/.test(token))return respond(401,"denied");
 if(!req.headers.get("content-type")?.toLowerCase().startsWith("application/json")||!req.body)return respond(415,"json");
 try{
  const reader=req.body.getReader(),chunks:Uint8Array[]=[];let total=0;
  while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>8192){await reader.cancel();return respond(413,"size");}chunks.push(value);}
  const bytes=new Uint8Array(total);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  let b;try{b=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(bytes));}catch{return respond(400,"invalid");}
  if(!b||!uuid.test(b.station_id||"")||!uuid.test(b.sample_id||"")||typeof b.observed_at!=="string"||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/.test(b.observed_at)||!Number.isFinite(Date.parse(b.observed_at))||!b.metrics||typeof b.metrics!=="object"||Array.isArray(b.metrics)||Object.keys(b.metrics).length<1||Object.keys(b.metrics).length>13||Object.values(b.metrics).some(v=>typeof v!=="number"||!Number.isFinite(v)))return respond(400,"invalid");
  const url=Deno.env.get("SUPABASE_URL"),key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");if(!url||!key)return respond(503,"unavailable");
  const res=await fetch(url+"/rest/v1/rpc/ingest_orchard_reading",{method:"POST",headers:{apikey:key,Authorization:"Bearer "+key,"Content-Type":"application/json"},body:JSON.stringify({p_station:b.station_id,p_sample:b.sample_id,p_observed:b.observed_at,p_metrics:b.metrics,p_token:token}),signal:AbortSignal.timeout(10000)});
  if(!res.ok)return respond(503,"unavailable");
  const result=await res.json();const codes:Record<string,number>={accepted:201,duplicate:200,denied:401,invalid:400,conflict:409,rate:429};
  return respond(codes[result]||503,codes[result]?result:"unavailable");
 }catch{return respond(503,"unavailable");}
});
