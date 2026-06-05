const form = document.querySelector("#chatForm");
const input = document.querySelector("#chatInput");
const messages = document.querySelector("#messages");
const welcome = document.querySelector("#welcome");
const promptButtons = document.querySelectorAll("[data-prompt]");
const newChatButton = document.querySelector("#newChatButton");
const menuButton = document.querySelector("#menuButton");
const scrim = document.querySelector("#scrim");
const history = document.querySelector(".history");

function resizeInput() {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 170)}px`;
}

function showConversation() {
  welcome.classList.add("hidden");
  messages.classList.add("active");
}

function addMessage(text, type, options = {}) {
  const article = document.createElement("article");
  article.className = `message ${type}-message${options.typing ? " typing" : ""}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = type === "bot" ? "कृ" : "You";

  const content = document.createElement("div");
  content.className = "content";

  const role = document.createElement("p");
  role.className = "role";
  role.textContent = type === "bot" ? "Achyuta GPT" : "You";

  const paragraph = document.createElement("p");
  paragraph.textContent = text;

  content.append(role, paragraph);

  if (type === "user") {
    article.append(content, avatar);
  } else {
    article.append(avatar, content);
  }

  messages.appendChild(article);
  messages.parentElement.scrollTop = messages.parentElement.scrollHeight;
  return article;
}

function updateHistoryTitle(text) {
  const active = document.querySelector(".history-item.active span");
  active.textContent = text.length > 28 ? `${text.slice(0, 28)}...` : text;
}

// Rewritten asynchronous function to stream responses from your live n8n backend
async function sendMessage(text) {
  const cleanText = text.trim();

  if (!cleanText) {
    return;
  }

  showConversation();
  addMessage(cleanText, "user");
  updateHistoryTitle(cleanText);
  input.value = "";
  resizeInput();

  // 1. Render the temporary "Thinking..." placeholder bubble
  const typing = addMessage("Thinking", "bot", { typing: true });

  try {
    // 2. Fire the network API request directly to your active tunnel bridge
    const response = await fetch("https://41200220de8cac.lhr.life/webhook/cc84de5c-54e0-49f5-8e25-5ec6ae202466/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "sendMessage",
        sessionId: "vercel-web-session", // keeps simple session alignment
        chatInput: cleanText
      })
    });

    if (!response.ok) {
      throw new Error("Local n8n network target down");
    }

    const data = await response.json();
    
    // 3. Clear the placeholder and render the real AI response generated from your Sheet data
    typing.remove();
    addMessage(data.output || "I am reflecting on your query. Please try phrasing it another way.", "bot");

  } catch (error) {
    console.error("Error communicating with backend:", error);
    typing.remove();
    addMessage("I am currently having difficulty tapping into the cosmic data stream. Please make sure your computer tunnel is running in terminal!", "bot");
  }
}

function resetChat() {
  messages.innerHTML = "";
  messages.classList.remove("active");
  welcome.classList.remove("hidden");
  document.querySelectorAll(".history-item").forEach((item) => item.classList.remove("active"));

  const item = document.createElement("button");
  item.className = "history-item active";
  item.type = "button";
  item.innerHTML = "<span>New conversation</span>";
  history.insertBefore(item, history.querySelector(".history-item"));
  input.focus();
  document.body.classList.remove("sidebar-open");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage(input.value);
});

input.addEventListener("input", resizeInput);

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

promptButtons.forEach((button) => {
  button.addEventListener("click", () => {
    sendMessage(button.dataset.prompt);
  });
});

newChatButton.addEventListener("click", resetChat);

menuButton.addEventListener("click", () => {
  document.body.classList.toggle("sidebar-open");
});

scrim.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

history.addEventListener("click", (event) => {
  if (event.target.closest(".history-item")) {
    document.body.classList.remove("sidebar-open");
  }
});
