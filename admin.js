const SUPABASE_URL = "https://cpfentirkmxzirnhjhgr.supabase.co";
const SUPABASE_KEY = "sb_publishable_MOt9jcP9HonkGbxQzSZCAA_Z4KpH28U";
let accessToken = null;
let appointments = [];

const headers = () => ({
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${accessToken}`,
  "Content-Type": "application/json"
});

async function login(email,password){
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`,{
    method:"POST",headers:{"apikey":SUPABASE_KEY,"Content-Type":"application/json"},
    body:JSON.stringify({email,password})
  });
  const data = await res.json();
  if(!res.ok) throw new Error(data.error_description || data.msg || "Login failed");
  accessToken=data.access_token;
  const check=await fetch(`${SUPABASE_URL}/rest/v1/admin_users?id=eq.${data.user.id}&select=id`,{headers:headers()});
  const admins=await check.json();
  if(!check.ok || !admins.length){accessToken=null;throw new Error("This account is not authorized as a Bun Bun administrator.");}
  document.getElementById("loginView").classList.add("hidden");
  document.getElementById("dashboardView").classList.remove("hidden");
  loadAppointments();
}

document.getElementById("loginForm").addEventListener("submit",async e=>{
  e.preventDefault(); const err=document.getElementById("loginError"); err.textContent="";
  try{await login(document.getElementById("email").value,document.getElementById("password").value)}
  catch(x){err.textContent=x.message}
});

async function loadAppointments(){
  const box=document.getElementById("appointments"); box.innerHTML="<div class='message'>Loading appointments...</div>";
  const res=await fetch(`${SUPABASE_URL}/rest/v1/appointments?select=*&order=appointment_date.asc,appointment_time.asc`,{headers:headers()});
  if(!res.ok){box.innerHTML="<div class='message'>Could not load appointments.</div>";return}
  appointments=await res.json(); render();
}

function render(){
  const filter=document.getElementById("filter").value;
  const search=document.getElementById("search").value.toLowerCase();
  let rows=appointments.filter(a=>(filter==="all"||a.status===filter)&&(`${a.customer_name} ${a.phone}`.toLowerCase().includes(search)));
  document.getElementById("total").textContent=appointments.length;
  document.getElementById("pending").textContent=appointments.filter(a=>a.status==="pending").length;
  document.getElementById("confirmed").textContent=appointments.filter(a=>a.status==="confirmed").length;
  document.getElementById("completed").textContent=appointments.filter(a=>a.status==="completed").length;
  const box=document.getElementById("appointments");
  if(!rows.length){box.innerHTML="<div class='empty'>No appointments found.</div>";return}
  box.innerHTML=rows.map(a=>{
    const date=new Date(a.appointment_date+"T00:00:00").toLocaleDateString("en-ZM",{day:"numeric",month:"short",year:"numeric"});
    return `<article class="appointment">
      <div class="customer"><strong>${escapeHtml(a.customer_name)}</strong><small>${escapeHtml(a.phone)}</small></div>
      <div class="meta"><b>${escapeHtml(a.service)}</b><br>${date} • ${escapeHtml(a.appointment_time.slice(0,5))}</div>
      <div class="meta">${escapeHtml(a.location)}<br><span class="status ${a.status}">${a.status}</span></div>
      <div class="actions">
        <button onclick="setStatus('${a.id}','confirmed')">Confirm</button>
        <button onclick="setStatus('${a.id}','completed')">Done</button>
        <button onclick="setStatus('${a.id}','cancelled')">Cancel</button>
      </div>
    </article>`
  }).join("");
}

async function setStatus(id,status){
  const res=await fetch(`${SUPABASE_URL}/rest/v1/appointments?id=eq.${id}`,{
    method:"PATCH",headers:{...headers(),"Prefer":"return=minimal"},body:JSON.stringify({status})
  });
  if(res.ok){const a=appointments.find(x=>x.id===id);if(a)a.status=status;render()}else alert("Could not update appointment.");
}

function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
document.getElementById("filter").addEventListener("change",render);
document.getElementById("search").addEventListener("input",render);
document.getElementById("refreshBtn").addEventListener("click",loadAppointments);
document.getElementById("logoutBtn").addEventListener("click",()=>{accessToken=null;location.reload()});
