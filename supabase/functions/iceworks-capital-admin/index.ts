// Iceworks Capital Admin: verified Supabase Auth sessions + server-side allowlist.
// This endpoint is intentionally public at transport layer; EVERY operation requires an
// authenticated email already present and active in iceworks_portal_admins.
// Never expose project secret/service role in browser, URL, or GitHub.
import { createClient } from "npm:@supabase/supabase-js@2.75.0";
const origin="https://michaeljhicks.github.io";
const headers={"Access-Control-Allow-Origin":origin,"Access-Control-Allow-Methods":"POST, OPTIONS",
 "Access-Control-Allow-Headers":"Authorization, Content-Type","Vary":"Origin",
 "Cache-Control":"no-store","Content-Type":"application/json;charset=utf-8"};
const respond=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
const reject=(status=403)=>respond({error:"Not authorized or unable to complete request."},status);
const db=createClient(Deno.env.get("SUPABASE_URL")||"",Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"",
 {auth:{autoRefreshToken:false,persistSession:false}});
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const hash=async(t:string)=>[...new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t)))].map(n=>n.toString(16).padStart(2,"0")).join("");
// Bearer URLs are sealed with AES-GCM using a key derived from the server-only
// Supabase service credential. No token plaintext or decryption key is exposed
// to the browser, database client roles, repository, or function responses except
// during a specifically authorized copy request.
const tokenKey=async()=>{
 const keyMaterial=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 if(!keyMaterial)throw Error("Missing backend encryption secret");
 const raw=await crypto.subtle.digest("SHA-256",new TextEncoder().encode("iceworks-invitation-recovery-v1:"+keyMaterial));
 return crypto.subtle.importKey("raw",raw,{name:"AES-GCM"},false,["encrypt","decrypt"]);
};
const b64=(bytes:Uint8Array)=>btoa(String.fromCharCode(...bytes));
const unb64=(v:string)=>Uint8Array.from(atob(v),c=>c.charCodeAt(0));
const sealToken=async(token:string)=>{
 const iv=crypto.getRandomValues(new Uint8Array(12));
 const encrypted=await crypto.subtle.encrypt({name:"AES-GCM",iv},await tokenKey(),new TextEncoder().encode(token));
 return b64(iv)+"."+b64(new Uint8Array(encrypted));
};
const unsealToken=async(ciphertext:string)=>{
 const parts=ciphertext.split(".");if(parts.length!==2)throw Error("Invalid encrypted invitation");
 const plain=await crypto.subtle.decrypt({name:"AES-GCM",iv:unb64(parts[0])},await tokenKey(),unb64(parts[1]));
 const token=new TextDecoder().decode(plain);
 if(!/^[a-f0-9]{48}$/.test(token))throw Error("Invalid invitation token");
 return token;
};
const audit=async(email:string,action:string,invitation_id:string|null=null,details:Record<string,unknown>={})=>{
 await db.from("iceworks_portal_audit").insert({actor_email:email,action,invitation_id,details});
};
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers});
 if(req.method!=="POST"||req.headers.get("origin")!==origin)return reject(403);
 try{
  const raw=req.headers.get("Authorization")||"";
  if(!raw.startsWith("Bearer ")||raw.length>6000)return reject(401);
  const jwt=raw.slice(7);
  const {data:identity,error:authError}=await db.auth.getUser(jwt);
  if(authError||!identity.user||!identity.user.email||!identity.user.email_confirmed_at)return reject(401);
  const email=identity.user.email.toLowerCase();
  const {data:staff,error:staffError}=await db.from("iceworks_portal_admins")
    .select("email,role,is_active").eq("email",email).eq("is_active",true).maybeSingle();
  if(staffError||!staff)return reject(403);
  const text=await req.text();if(text.length>6000)return reject(413);
  const params=JSON.parse(text||"{}");
  if(!params||typeof params!=="object"||Array.isArray(params))return reject(400);
  const action=params.action;
  const writeAccess=staff.role==="owner"||staff.role==="editor";
  if(action==="whoami")return respond({email,role:staff.role});
  if(action==="list"){
   const {data:invitations,error:e1}=await db.from("iceworks_capital_invitations")
     .select("id,first_name,market_label,welcome_message,selection_reason,created_at,expires_at,revoked_at,token_ciphertext")
     .order("created_at",{ascending:false}).limit(100);
   const {data:submissions,error:e2}=await db.from("iceworks_capital_submissions")
     .select("invitation_id,consent_at,summary").order("consent_at",{ascending:false}).limit(100);
   if(e1||e2)return reject(503);
   return respond({invitations:invitations?.map(({token_ciphertext,...row})=>({...row,link_recoverable:!!token_ciphertext}))??[],submissions});
  }
  if(action==="create"){
   if(!writeAccess)return reject();
   const first=String(params.first_name||"").trim(),market=String(params.market_label||"").trim(),message=String(params.welcome_message||"").trim(),selectionReason=String(params.selection_reason||"").trim();
   const days=Number(params.expires_days??14);
   if(!first||first.length>80||!market||market.length>140||message.length>650||selectionReason.length>1200
     ||!Number.isInteger(days)||days<1||days>30)return reject(400);
   const token=[...crypto.getRandomValues(new Uint8Array(24))].map(n=>n.toString(16).padStart(2,"0")).join("");
   const token_hash=await hash(token);
   const expires_at=new Date(Date.now()+days*86400000).toISOString();
   const {data:inv,error}=await db.from("iceworks_capital_invitations")
     .insert({token_hash,token_ciphertext:await sealToken(token),first_name:first,market_label:market,welcome_message:message,selection_reason:selectionReason,expires_at})
     .select("id").single();
   if(error||!inv)return reject(503);
   await audit(email,"create_invitation",inv.id,{market});
   return respond({invitation_id:inv.id,expires_at,invite_link:"https://michaeljhicks.github.io/prospect-tool/capital-readiness.html#invite="+token});
  }
  if(action==="update_reason"){
   if(!writeAccess||typeof params.invitation_id!=="string"||!uuid.test(params.invitation_id))return reject(400);
   if(typeof params.selection_reason!=="string"||params.selection_reason.length>1200)return reject(400);
   const selectionReason=params.selection_reason.trim();
   const {data,error}=await db.from("iceworks_capital_invitations")
     .update({selection_reason:selectionReason}).eq("id",params.invitation_id).is("revoked_at",null).select("id").maybeSingle();
   if(error||!data)return reject(404);
   await audit(email,"update_invitation_reason",data.id);
   return respond({ok:true});
  }
  if(action==="get_link"){
   if(!writeAccess||typeof params.invitation_id!=="string"||!uuid.test(params.invitation_id))return reject(400);
   const {data:record,error}=await db.from("iceworks_capital_invitations")
     .select("id,token_hash,token_ciphertext,expires_at,revoked_at")
     .eq("id",params.invitation_id).maybeSingle();
   if(error||!record||record.revoked_at)return reject(404);
   if(Date.parse(record.expires_at)<=Date.now())return respond({error:"Invitation expired. Renew it to issue a new link."},410);
   if(!record.token_ciphertext)return respond({error:"This older invitation has no recoverable URL. Generate a new link to enable copying later."},409);
   const token=await unsealToken(record.token_ciphertext);
   if(await hash(token)!==record.token_hash)return reject(503);
   await audit(email,"copy_invitation_url",record.id);
   return respond({invite_link:"https://michaeljhicks.github.io/prospect-tool/capital-readiness.html#invite="+token,expires_at:record.expires_at});
  }
  if(action==="refresh_link"){
   if(!writeAccess||typeof params.invitation_id!=="string"||!uuid.test(params.invitation_id))return reject(400);
   const days=Number(params.expires_days??14);
   if(!Number.isInteger(days)||days<1||days>30)return reject(400);
   const {data:existing,error:lookupError}=await db.from("iceworks_capital_invitations")
     .select("id,first_name,market_label,revoked_at,expires_at")
     .eq("id",params.invitation_id).maybeSingle();
   if(lookupError||!existing||existing.revoked_at)return reject(404);
   const {data:submitted,error:submittedError}=await db.from("iceworks_capital_submissions")
     .select("id").eq("invitation_id",existing.id).maybeSingle();
   if(submittedError)return reject(503);
   if(submitted)return respond({error:"This prospect already submitted a summary; please create a new invitation if needed."},409);
   const token=[...crypto.getRandomValues(new Uint8Array(24))].map(n=>n.toString(16).padStart(2,"0")).join("");
   const token_hash=await hash(token);
   const expires_at=new Date(Date.now()+days*86400000).toISOString();
   const {data:updated,error:updateError}=await db.from("iceworks_capital_invitations")
     .update({token_hash,token_ciphertext:await sealToken(token),expires_at}).eq("id",existing.id).is("revoked_at",null)
     .select("id").maybeSingle();
   if(updateError||!updated)return reject(503);
   await audit(email,"rotate_or_renew_invitation",existing.id,{market:existing.market_label,previously_expired:Date.parse(existing.expires_at)<=Date.now(),days});
   return respond({invitation_id:existing.id,expires_at,invite_link:"https://michaeljhicks.github.io/prospect-tool/capital-readiness.html#invite="+token,previous_link_invalidated:true});
  }
  if(action==="revoke"){
   if(!writeAccess||typeof params.invitation_id!=="string"||!uuid.test(params.invitation_id))return reject(400);
   const {data,error}=await db.from("iceworks_capital_invitations")
      .update({revoked_at:new Date().toISOString()}).eq("id",params.invitation_id).select("id").maybeSingle();
   if(error||!data)return reject(404);
   await audit(email,"revoke_invitation",data.id);
   return respond({ok:true});
  }
  if(action==="grant"){
   if(staff.role!=="owner")return reject();
   const target=String(params.email||"").toLowerCase().trim();
   const role=String(params.role||"");
   if(!emailPattern.test(target)||target.length>254||!["owner","editor","viewer"].includes(role))return reject(400);
   const {error}=await db.from("iceworks_portal_admins")
     .upsert({email:target,role,is_active:true,created_by:email},{onConflict:"email"});
   if(error)return reject(503);
   await audit(email,"grant_admin",null,{target,role});
   return respond({ok:true});
  }
  if(action==="deactivate"){
   if(staff.role!=="owner")return reject();
   const target=String(params.email||"").toLowerCase().trim();
   if(!emailPattern.test(target)||target===email)return reject(400);
   const {error}=await db.from("iceworks_portal_admins").update({is_active:false}).eq("email",target);
   if(error)return reject(503);
   await audit(email,"deactivate_admin",null,{target});
   return respond({ok:true});
  }
  return reject(400);
 }catch(_){return reject(400)}
});
