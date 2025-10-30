const API_URL = "https://zonebot-ultra.onrender.com/api/chat";
const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const newChatBtn = document.getElementById("newChat");

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.innerHTML = `<b>${sender === "user" ? "You" : "ZoneBot"}:</b> ${text}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function appendTyping() {
  const typing = document.createElement("div");
  typing.classList.add("typing");
  typing.textContent = "ZoneBot is typing...";
  chatBox.appendChild(typing);
  chatBox.scrollTop = chatBox.scrollHeight;
  return typing;
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  appendMessage("user", text);
  userInput.value = "";

  const typingIndicator = appendTyping();

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    const data = await response.json();

    typingIndicator.remove();
    if (data.reply) {
      appendMessage("bot", data.reply);
    } else {
      appendMessage("bot", "⚠️ Server error. Try again later.");
    }
  } catch {
    typingIndicator.remove();
    appendMessage("bot", "⚠️ Unable to connect to server.");
  }
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

newChatBtn.addEventListener("click", () => {
  chatBox.innerHTML = "";
  appendMessage("bot", "👋 New chat started! Ask me anything.");
});
