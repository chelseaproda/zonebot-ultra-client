const API_BASE = "https://zonebot-ultra.onrender.com"; // Replace with your Render backend URL

const chatBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const typing = document.getElementById("typing");

sendBtn.addEventListener("click", sendMessage);
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.innerHTML = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;
  appendMessage("user", text);
  chatInput.value = "";
  typing.classList.remove("hidden");

  try {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    if (!res.ok) throw new Error("Server error");
    const data = await res.json();
    appendMessage("bot", data.reply || "(no reply)");
  } catch (err) {
    appendMessage("bot", "⚠️ Unable to connect to server.");
  } finally {
    typing.classList.add("hidden");
  }
}
