const form = document.querySelector("#chatForm");
const input = document.querySelector("#chatInput");
const messages = document.querySelector("#messages");
const welcome = document.querySelector("#welcome");
const promptButtons = document.querySelectorAll("[data-prompt]");
const newChatButton = document.querySelector("#newChatButton");
const menuButton = document.querySelector("#menuButton");
const scrim = document.querySelector("#scrim");
const history = document.querySelector(".history");

const verses = window.BHAGAVAD_GITA_VERSES || [];
let conversationTurns = 0;

const stopWords = new Set([
  "a",
  "about",
  "am",
  "an",
  "and",
  "are",
  "as",
  "be",
  "can",
  "do",
  "for",
  "from",
  "give",
  "how",
  "i",
  "in",
  "is",
  "it",
  "me",
  "my",
  "of",
  "on",
  "or",
  "should",
  "that",
  "the",
  "this",
  "to",
  "what",
  "when",
  "with",
  "you"
]);

const themes = [
  {
    keys: ["work", "career", "job", "duty", "responsibility", "result", "success"],
    verse: "2.47",
    answer: "You are carrying the result as if it is fully in your hands. Let that weight soften a little.",
    explanation: "Give your best effort to the action in front of you, but do not let the outcome decide your inner peace.",
    practice: "Choose one honest step you can take today, and do it without rehearsing every possible result.",
    followUp: "What result are you most afraid of right now?"
  },
  {
    keys: ["fear", "anxiety", "worry", "stress", "restless", "calm", "peace", "sad"],
    verse: "2.14",
    answer: "I hear the restlessness in this. You do not have to defeat the feeling immediately; first, let it be seen.",
    explanation: "Krishna reminds us that emotional weather changes. If you can stay patient for a little while, the mind begins to loosen its grip.",
    practice: "Take three slow breaths, name the feeling once, and then return to one small action.",
    followUp: "Is this worry coming more from fear of the future, or pain from something already happened?"
  },
  {
    keys: ["decision", "confused", "choice", "path", "clarity", "purpose"],
    verse: "18.63",
    answer: "Confusion is not failure. It is often the mind asking for a quieter place from which to choose.",
    explanation: "Krishna offers wisdom, but still leaves the choice to Arjun. In the same way, your decision should come from reflection, not pressure.",
    practice: "Write the choice that feels most aligned with truth, kindness, and long-term peace.",
    followUp: "What are the two choices you are standing between?"
  },
  {
    keys: ["devotion", "bhakti", "offer", "prayer", "krishna", "god", "spiritual"],
    verse: "9.27",
    answer: "You do not need to leave ordinary life to be close to Krishna. Bring remembrance into the ordinary.",
    explanation: "This verse turns daily action into devotion. Work, food, effort, and even struggle can become sacred when offered sincerely.",
    practice: "Before your next task, pause for one moment and inwardly offer it with love.",
    followUp: "Where in your daily life do you most want to feel Krishna's presence?"
  },
  {
    keys: ["anger", "desire", "attachment", "temptation", "control"],
    verse: "2.62 – 2.63",
    answer: "This is a moment to step back gently, not punish yourself. Desire becomes dangerous only when it starts driving the chariot.",
    explanation: "Krishna traces how attachment can disturb judgment. When you pause before reacting, you protect your clarity.",
    practice: "Wait before acting. Even a small pause can return power from impulse back to wisdom.",
    followUp: "What is the thought or desire that keeps pulling your attention?"
  }
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

function updateHistoryTitle(text) {
  const active = document.querySelector(".history-item.active span");
  active.textContent = text.length > 28 ? `${text.slice(0, 28)}...` : text;
}

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");
}

function getTokens(text) {
  return normalize(text)
    .split(/\s+/)
    .filter((token) => token.length > 2 && !stopWords.has(token));
}

function findTheme(question) {
  const normalized = normalize(question);
  let bestTheme = null;
  let bestScore = 0;

  themes.forEach((theme) => {
    const score = theme.keys.reduce((total, key) => {
      return normalized.includes(key) ? total + 1 : total;
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      bestTheme = theme;
    }
  });

  return bestTheme;
}

function findVerseByString(verseString) {
  return verses.find((verse) => verse.chapter_verse === verseString);
}

function findBestVerse(question) {
  const theme = findTheme(question);

  if (theme) {
    const themedVerse = findVerseByString(theme.verse);

    if (themedVerse) {
      return { verse: themedVerse, theme };
    }
  }

  const tokens = getTokens(question);
  let best = verses[0];
  let bestScore = -1;

  verses.forEach((verse) => {
    const haystack = normalize(
      `${verse.chapter_title} ${verse.chapter_number} ${verse.chapter_verse} ${verse.translation}`
    );
    const score = tokens.reduce((total, token) => {
      if (haystack.includes(token)) {
        return total + (token.length > 5 ? 3 : 1);
      }

      return total;
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      best = verse;
    }
  });

  return {
    verse: best,
    theme: {
      answer: "Let us look at this gently. There is wisdom here, but we do not need to rush toward it.",
      explanation: "This verse can act like a mirror. It invites you to pause, choose wisely, and move forward with a calmer heart.",
      practice: "For today, take one step that is truthful, kind, and steady.",
      followUp: "Tell me a little more about what feels heaviest in this."
    }
  };
}

function usesDevanagari(text) {
  return /[\u0900-\u097F]/.test(text);
}

function getCasualReply(question) {
  const normalized = normalize(question).trim();

  if (/^(hi|hello|hey|hare krishna|namaste|pranam|radhe radhe)$/.test(normalized)) {
    return "Hi, I am here with you.\n\nTell me what is on your mind today. Are you looking for peace, clarity, courage, or guidance with a decision?";
  }

  if (/^(ok|okay|hmm|yes|no|sure)$/.test(normalized)) {
    return "I understand.\n\nSay a little more, and I will sit with the question beside you.";
  }

  if (/^(thank you|thanks|thank|dhanyavad)$/.test(normalized)) {
    return "You are most welcome.\n\nMay your mind feel a little lighter. If there is anything else on your heart, we can look at it together.";
  }

  return null;
}

function getOpening(question) {
  const normalized = normalize(question);

  if (normalized.includes("thank") || normalized.includes("thanks")) {
    return "You are most welcome. I am here with you.";
  }

  if (normalized.includes("sad") || normalized.includes("hurt") || normalized.includes("lost")) {
    return "Come, sit with this for a moment. I hear that your heart feels heavy.";
  }

  if (normalized.includes("angry") || normalized.includes("anger")) {
    return "I can feel the heat in this. Let us cool the mind before deciding what to do.";
  }

  if (normalized.includes("confused") || normalized.includes("decision")) {
    return "Let us slow this down together. A confused mind needs gentleness before answers.";
  }

  if (normalized.includes("anxiety") || normalized.includes("worry") || normalized.includes("stress")) {
    return "Take a breath first. You are not alone in this feeling.";
  }

  return conversationTurns === 0
    ? "I am listening. Let us bring Krishna's wisdom to this with a calm heart."
    : "Yes, I hear you. Let us stay with this and look a little deeper.";
}

function buildAnswer(question) {
  const casualReply = getCasualReply(question);

  if (casualReply) {
    return casualReply;
  }

  if (!verses.length) {
    return "The Bhagavad Gita knowledge base is not loaded yet. Please check that data/bhagavad_gita_verses.js is available.";
  }

  const { verse, theme } = findBestVerse(question);
  const opening = getOpening(question);

  if (usesDevanagari(question)) {
    return `${opening}

${theme.answer}

श्लोक: ${verse.chapter_title}, ${verse.chapter_number}, Verse ${verse.chapter_verse}

English translation: "${verse.translation}"

आज के जीवन में अर्थ: ${theme.explanation}

एक छोटा अभ्यास: ${theme.practice}

मैं तुमसे यह पूछना चाहूँगा: ${theme.followUp}`;
  }

  return `${opening}

${theme.answer}

Krishna points us here:
${verse.chapter_title}, ${verse.chapter_number}, Verse ${verse.chapter_verse}

"${verse.translation}"

For you right now, this means: ${theme.explanation}

Try this gently: ${theme.practice}

And tell me this: ${theme.followUp}`;
}

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

  const typing = addMessage("Thinking", "bot", { typing: true });

  window.setTimeout(() => {
    typing.remove();
    addMessage(buildAnswer(cleanText), "bot");
    conversationTurns += 1;
  }, 450);
}

function resetChat() {
  messages.innerHTML = "";
  conversationTurns = 0;
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
