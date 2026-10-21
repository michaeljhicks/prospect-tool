// Supabase Edge Function: iceworks-capital-portal
// Deploy with JWT verification DISABLED for invitation-only access.
// Possession of a random 192-bit invitation token is required for each action.
// Never expose SUPABASE_SERVICE_ROLE_KEY to browser code.
import { createClient } from "npm:@supabase/supabase-js@2";
const host="https://michaeljhicks.github.io";
const cors={
 "Access-Control-Allow-Origin":host,
 "Access-Control-Allow-Methods":"POST, OPTIONS",
 "Access-Control-Allow-Headers":"Content-Type",
 "Vary":"Origin",
 "Cache-Control":"no-store",
 "Content-Type":"application/json; charset=utf-8"
};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:cors});
const fail=(msg="Request could not be completed",status=400)=>json({error:msg},status);
const url=Deno.env.get("SUPABASE_URL")||"";
const key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
if(!url||!key)console.error("Supabase connection not configured");
const db=createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}});
const amount=(value:unknown)=>typeof value==="number"&&Number.isFinite(value)&&value>=0&&value<=1_000_000_000;
const allowedFlags=["no_reserve_established","capital_gap_exists","uncommitted_financing_present"];
const statuses=["none","exploring","applied","preapproved","committed"];
async function tokenHash(token:string){
 const hash=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(token));
 return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,"0")).join("");
}
async function getReport(invitation:{report_id:string|null}){
 if(!invitation.report_id)return null;
 const {data,error}=await db.from("iceworks_market_reports").select("market_label,status,overview,boundaries,establishment_count,population,pudi_score,methodology,source_notes").eq("id",invitation.report_id).eq("status","approved").maybeSingle();
 if(error||!data)return null;
 return {title:data.market_label,overview:data.overview,boundaries:data.boundaries,establishment_count:data.establishment_count,population:data.population,pudi_score:data.pudi_score,methodology:data.methodology,source_notes:data.source_notes};
}
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors});
 if(req.method!=="POST")return fail("Method not allowed",405);
 // This CORS check reduces accidental cross-site use; the random invitation token provides actual authorization.
 if(req.headers.get("origin")!==host)return fail("Origin not allowed",403);
 if(Number(req.headers.get("content-length")||"0")>8192)return fail("Request too large",413);
 try {
  const raw=await req.text();if(raw.length>8192)return fail("Request too large",413);
  const body=JSON.parse(raw);if(!body||typeof body!=="object")return fail();
  const token=body.token;
  if(typeof token!=="string"||!/^[a-f0-9]{48}$/.test(token))return fail("Invalid invitation",404);
  const hash=await tokenHash(token);
  const {data:inv,error}=await db.from("iceworks_capital_invitations").select("id,first_name,market_label,welcome_message,report_id,expires_at,revoked_at").eq("token_hash",hash).maybeSingle();
  if(error||!inv||inv.revoked_at||Date.parse(inv.expires_at)<Date.now())return fail("Invitation unavailable or expired",404);
  const {data:existing,error:subError}=await db.from("iceworks_capital_submissions").select("id").eq("invitation_id",inv.id).maybeSingle();
  if(subError)return fail("Temporary service issue",503);
  const ready=!!(await getReport(inv));
  if(body.action==="resolve"){
   const report=existing&&ready?await getReport(inv):null;
   return json({invitation:{first_name:inv.first_name,market_label:inv.market_label,welcome_message:inv.welcome_message,report_ready:ready},submitted:!!existing,report});
  }
  if(body.action==="submit"){
   if(!ready)return fail("Approved market report is not available",409);
   if(existing)return json({submitted:true,report:await getReport(inv)});
   if(body.consent!==true||body.consent_version!=="capital-summary-v1.3")return fail("Explicit consent required");
   const summary=body.summary;
   if(!summary||typeof summary!=="object"||Array.isArray(summary)||Object.keys(summary).sort().join(",")!=="capital_gap_high,capital_gap_low,deployable_funds,financing_status,flags,selected_cost_high,selected_cost_low")return fail("Summary is invalid");
   for(const field of ["deployable_funds","selected_cost_low","selected_cost_high","capital_gap_low","capital_gap_high"]){
    if(!amount(summary[field]))return fail("Invalid amount");
   }
   if(summary.selected_cost_high<summary.selected_cost_low||
     summary.capital_gap_low!==Math.max(0,summary.selected_cost_low-summary.deployable_funds)||
     summary.capital_gap_high!==Math.max(0,summary.selected_cost_high-summary.deployable_funds))return fail("Inconsistent capital summary");
   if(!statuses.includes(summary.financing_status)||!Array.isArray(summary.flags)||summary.flags.length>3||
    summary.flags.some((s:unknown)=>typeof s!=="string"||!allowedFlags.includes(s)))return fail("Invalid status/flags");
   // Server stores only the explicit allowlisted summary — never personal income, assets, debts or retirement holdings.
   const sanitized={
    deployable_funds:summary.deployable_funds,selected_cost_low:summary.selected_cost_low,
    selected_cost_high:summary.selected_cost_high,capital_gap_low:summary.capital_gap_low,
    capital_gap_high:summary.capital_gap_high,financing_status:summary.financing_status,flags:summary.flags
   };
   const {error:insertError}=await db.from("iceworks_capital_submissions").insert({invitation_id:inv.id,summary:sanitized,consent_version:"capital-summary-v1.3"});
   if(insertError){
    if(insertError.code==="23505")return json({submitted:true,report:await getReport(inv)});
    return fail("Could not save summary",503);
   }
   return json({submitted:true,report:await getReport(inv)});
  }
  return fail("Unknown action");
 }catch(_){return fail("Unable to process request",400)}
});
