const form = document.querySelector("#chatForm");
const input = document.querySelector("#chatInput");
const messages = document.querySelector("#messages");
const welcome = document.querySelector("#welcome");
const promptButtons = document.querySelectorAll("[data-prompt]");
const newChatButton = document.querySelector("#newChatButton");
const menuButton = document.querySelector("#menuButton");
const scrim = document.querySelector("#scrim");
const history = document.querySelector(".history");

const guidance = [
  {
    keywords: ["restless", "calm", "peace", "anxiety", "worried"],
    response:
      "When the mind is restless, begin with one breath and one sincere duty. Krishna teaches steadiness through practice: return again and again to what is true, kind, and useful."
  },
  {
    keywords: ["duty", "dharma", "work", "career"],
    response:
      "Dharma is not always dramatic. Often it is the honest work before you, done without pride and without fear. Offer the action, and let the result arrive in its own time."
  },
  {
    keywords: ["gita", "lesson", "teach"],
    response:
      "A lesson for today: you have control over your effort, not over every outcome. Let your intention be pure, your action steady, and your heart free from clinging."
  },
  {
    keywords: ["devotion", "bhakti", "offer"],
    response:
      "Devotion can live inside ordinary moments. Speak gently, work honestly, remember the divine before beginning, and let even small actions become an offering."
  }
];

const fallbackResponses = [
  "Look at the question with a quiet heart. What choice would make you more truthful, compassionate, and steady?",
  "Begin where you are. Krishna's path is not escape from life, but wise action within life.",
  "Let the heart be soft and the mind be disciplined. When both move together, the next step becomes clearer.",
  "Do not wait for perfect certainty. Act with sincerity, keep humility close, and learn from what unfolds."
];

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

function getResponse(prompt) {
  const normalized = prompt.toLowerCase();
  const match = guidance.find((item) =>
    item.keywords.some((keyword) => normalized.includes(keyword))
  );

  if (match) {
    return match.response;
  }

  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
}

function updateHistoryTitle(text) {
  const active = document.querySelector(".history-item.active span");
  active.textContent = text.length > 28 ? `${text.slice(0, 28)}...` : text;
}

function sendMessage(text) {
  const cleanText = text.trim();

  if (!cleanText) {
    return;
  }

  showConversation();
  addMessage(cleanText, "user");
  updateHistoryTitle(cleanText);
  input.value = "";
  resizeInput();

  const typing = addMessage("Thinking", "bot", { typing: true });
  window.setTimeout(() => {
    typing.remove();
    addMessage(getResponse(cleanText), "bot");
  }, 700);
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
