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
     .select("id,first_name,market_label,welcome_message,created_at,expires_at,revoked_at")
     .order("created_at",{ascending:false}).limit(100);
   const {data:submissions,error:e2}=await db.from("iceworks_capital_submissions")
     .select("invitation_id,consent_at,summary").order("consent_at",{ascending:false}).limit(100);
   if(e1||e2)return reject(503);
   return respond({invitations,submissions});
  }
  if(action==="create"){
   if(!writeAccess)return reject();
   const first=String(params.first_name||"").trim(),market=String(params.market_label||"").trim(),message=String(params.welcome_message||"").trim();
   const days=Number(params.expires_days??14);
   if(!first||first.length>80||!market||market.length>140||message.length>650
     ||!Number.isInteger(days)||days<1||days>30)return reject(400);
   const token=[...crypto.getRandomValues(new Uint8Array(24))].map(n=>n.toString(16).padStart(2,"0")).join("");
   const token_hash=await hash(token);
   const expires_at=new Date(Date.now()+days*86400000).toISOString();
   const {data:inv,error}=await db.from("iceworks_capital_invitations")
     .insert({token_hash,first_name:first,market_label:market,welcome_message:message,expires_at})
     .select("id").single();
   if(error||!inv)return reject(503);
   await audit(email,"create_invitation",inv.id,{market});
   return respond({invitation_id:inv.id,expires_at,invite_link:"https://michaeljhicks.github.io/prospect-tool/capital-readiness.html#invite="+token});
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
