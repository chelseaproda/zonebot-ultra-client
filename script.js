// ====== CONFIG ======
const API_BASE = "https://zonebot-ultra.onrender.com";
const API_CHAT = `${API_BASE}/api/chat`;
const API_HISTORY = `${API_BASE}/api/history`;
const API_ME = `${API_BASE}/api/me`;
const AUTH_REGISTER = `${API_BASE}/auth/register`;
const AUTH_LOGIN = `${API_BASE}/auth/login`;
const API_PRES = `${API_BASE}/api/presentation`;
const API_IMAGE = `${API_BASE}/api/image`;

// ====== UI ELEMENTS ======
const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const newChatBtn = document.getElementById("newChat");
const chatHistoryEl = document.getElementById("chatHistory");

const authBox = document.getElementById("authBox");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const authName = document.getElementById("authName");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authMsg = document.getElementById("authMsg");

const tabChat = document.getElementById("tabChat");
const tabImage = document.getElementById("tabImage");
const tabPres = document.getElementById("tabPres");
const viewChat = document.getElementById("viewChat");
const viewImage = document.getElementById("viewImage");
const viewPres = document.getElementById("viewPres");
const viewTitle = document.getElementById("viewTitle");

const presTitle = document.getElementById("presTitle");
const presSlides = document.getElementById("presSlides");
const makePresBtn = document.getElementById("makePresBtn");
const presMsg = document.getElementById("presMsg");

const imgPrompt = document.getElementById("imgPrompt");
const genImgBtn = document.getElementById("genImgBtn");
const imgMsg = document.getElementById("imgMsg");
const imgResult = document.getElementById("imgResult");

let token = localStorage.getItem("zonebot_token") || null;
let currentUser = null;

// ====== HELPERS ======
function setAuthUI(user){
  currentUser = user;
  if(user){
    authBox.style.display = "none";
    logoutBtn.style.display = "inline-block";
    renderHistory();
  }else{
    authBox.style.display = "";
    logoutBtn.style.display = "none";
  }
}

async function authFetch(url, opts = {}){
  opts.headers = opts.headers || {};
  if(!(opts.body instanceof FormData)){
    opts.headers["Content-Type"] = "application/json";
  }
  if(token) opts.headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, opts);
  return res;
}

function appendMessage(sender, text){
  const el = document.createElement("div");
  el.className = `message ${sender}`;
  el.innerHTML = `<b>${sender==="user"?"You":"ZoneBot"}:</b> ${text}`;
  chatBox.appendChild(el);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function appendTyping(){
  const el = document.createElement("div");
  el.className = "message bot";
  el.textContent = "ZoneBot is typing…";
  chatBox.appendChild(el);
  chatBox.scrollTop = chatBox.scrollHeight;
  return el;
}

// ====== TABS ======
function activateTab(tab){
  [tabChat,tabImage,tabPres].forEach(b=>b.classList.remove("active"));
  [viewChat,viewImage,viewPres].forEach(v=>v.classList.remove("active"));
  if(tab==="chat"){ tabChat.classList.add("active"); viewChat.classList.add("active"); viewTitle.textContent="💬 ZoneBot Chat"; }
  if(tab==="image"){ tabImage.classList.add("active"); viewImage.classList.add("active"); viewTitle.textContent="🖼️ Image Generator"; }
  if(tab==="pres"){ tabPres.classList.add("active"); viewPres.classList.add("active"); viewTitle.textContent="📑 Generate Presentations"; }
}
tabChat.addEventListener("click", ()=>activateTab("chat"));
tabImage.addEventListener("click", ()=>activateTab("image"));
tabPres.addEventListener("click", ()=>activateTab("pres"));

// ====== CHAT ======
async function sendMessage(){
  const text = userInput.value.trim();
  if(!text) return;
  if(!token){ authMsg.textContent = "You must be logged in."; return; }
  appendMessage("user", text);
  userInput.value = "";
  const typing = appendTyping();
  try{
    const res = await authFetch(API_CHAT, { method:"POST", body: JSON.stringify({ message: text })});
    const data = await res.json();
    typing.remove();
    if(res.ok && data.reply){
      appendMessage("bot", data.reply);
      renderHistory();
    }else{
      appendMessage("bot", data.error || "⚠️ No response.");
    }
  }catch(err){
    typing.remove();
    appendMessage("bot", "⚠️ Connection failed.");
  }
}

// ====== HISTORY ======
async function renderHistory(){
  if(!token) return;
  try{
    const res = await authFetch(API_HISTORY);
    if(!res.ok) return;
    const data = await res.json();
    chatHistoryEl.innerHTML = "";
    const msgs = data.messages || [];
    for(let i=0;i<msgs.length;i+=20){
      const group = msgs.slice(i,i+20);
      const item = document.createElement("div");
      item.className = "history-item";
      const ts = group[0]?.timestamp?.slice(0,19).replace("T"," ") || `Chat ${i/20+1}`;
      item.textContent = ts;
      item.onclick = ()=>{
        chatBox.innerHTML="";
        group.forEach(m=> appendMessage(m.role==="user"?"user":"bot", m.content));
      };
      chatHistoryEl.appendChild(item);
    }
  }catch(err){ /* silent */ }
}

// ====== AUTH ======
document.getElementById("registerBtn").addEventListener("click", async ()=>{
  authMsg.textContent="";
  const email = authEmail.value.trim();
  const password = authPassword.value.trim();
  const display_name = authName.value.trim();
  if(!email || !password){ authMsg.textContent="Email & password required"; return; }
  try{
    const res = await fetch(AUTH_REGISTER, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ email, password, display_name }) });
    const data = await res.json();
    if(!res.ok){ authMsg.textContent = data.error || "Register failed"; return; }
    token = data.token; localStorage.setItem("zonebot_token", token);
    setAuthUI(data.user); authMsg.textContent="Registered & logged in!";
    renderHistory();
  }catch(e){ authMsg.textContent="Register failed."; }
});

document.getElementById("loginBtn").addEventListener("click", async ()=>{
  authMsg.textContent="";
  const email = authEmail.value.trim();
  const password = authPassword.value.trim();
  if(!email || !password){ authMsg.textContent="Email & password required"; return; }
  try{
    const res = await fetch(AUTH_LOGIN, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if(!res.ok){ authMsg.textContent = data.error || "Login failed"; return; }
    token = data.token; localStorage.setItem("zonebot_token", token);
    setAuthUI(data.user); authMsg.textContent="Logged in!";
    renderHistory();
  }catch(e){ authMsg.textContent="Login failed."; }
});

document.getElementById("logoutBtn").addEventListener("click", ()=>{
  token = null; localStorage.removeItem("zonebot_token");
  setAuthUI(null); chatBox.innerHTML=""; authMsg.textContent="Logged out.";
});

// ====== IMAGE GENERATOR ======
genImgBtn.addEventListener("click", async ()=>{
  imgMsg.textContent="";
  imgResult.innerHTML="";
  if(!token){ imgMsg.textContent="Login required."; return; }
  const prompt = imgPrompt.value.trim();
  if(!prompt){ imgMsg.textContent="Enter a prompt."; return; }
  try{
    const res = await authFetch(API_IMAGE, { method:"POST", body: JSON.stringify({ prompt }) });
    const data = await res.json();
    if(!res.ok){ imgMsg.textContent=data.error || "Server error"; return; }
    if(data.dataUrl){
      const img = new Image();
      img.src = data.dataUrl;
      imgResult.appendChild(img);
    }else{
      imgMsg.textContent="No image returned.";
    }
  }catch(e){
    imgMsg.textContent="Failed to generate image.";
  }
});

// ====== PRESENTATIONS ======
document.getElementById("makePresBtn").addEventListener("click", async ()=>{
  presMsg.textContent="";
  if(!token){ presMsg.textContent="Login required."; return; }
  const title = presTitle.value.trim() || "ZoneBot Presentation";
  const lines = presSlides.value.trim().split("\n").filter(Boolean);
  if(lines.length===0){ presMsg.textContent="Add at least one slide line."; return; }

  // Parse "Title: bullet; bullet; bullet"
  const slides = lines.map(line=>{
    const [heading, rest] = line.split(":");
    const bullets = (rest||"").split(";").map(s=>s.trim()).filter(Boolean);
    return { heading: (heading||"Slide").trim(), bullets };
  });

  try{
    const res = await authFetch(API_PRES, { method:"POST", body: JSON.stringify({ title, slides }) });
    if(!res.ok){ const t = await res.text(); presMsg.textContent = t || "Server error"; return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = title.replace(/[^a-z0-9\-_]+/gi,"_") + ".pptx";
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }catch(e){
    presMsg.textContent="Failed to generate presentation.";
  }
});

// ====== INIT ======
(async()=>{
  if(token){
    try{
      const r = await authFetch(API_ME);
      if(r.ok){ const d=await r.json(); setAuthUI(d.user); } else { token=null; localStorage.removeItem("zonebot_token"); setAuthUI(null); }
    }catch{ token=null; localStorage.removeItem("zonebot_token"); setAuthUI(null); }
  } else setAuthUI(null);
})();