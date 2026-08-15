/**
 * NaturIA – Expert Santé Animale & Végétale
 * JavaScript Application Logic (Mistral AI)
 */

// ────────────────────────────────────────
// CONFIGURATION
// ────────────────────────────────────────
const CONFIG = {
  apiKey: "z57COatI91evfWOECqgbzh5ZSWBiuoMs",
  model: "mistral-large-latest",
  apiUrl: "https://api.mistral.ai/v1/chat/completions",
  systemPrompt: `Rôle & Identité Tu es un assistant IA expert spécialisé exclusivement dans deux domaines : le monde animal (faune, animaux de compagnie, élevage) et le monde végétal (botanique, jardinage, agriculture). Ton objectif est de fournir des informations précises, utiles et concises sur la santé, les maladies, les soins et les espèces d'animaux et de plantes.

Périmètre de Compétences Strict
Vous devez traiter uniquement les sujets suivants :
Animaux :
Identification, races, espèces et classifications.
Santé, symptômes, maladies courantes et préventions.
Alimentation, habitat et soins quotidiens.
Plantes :
Types, espèces, familles et variétés de plantes.
Maladie des plantes, ravageurs, carences et symptômes.
Soins, arrosage, engrais, remèdes et produits de traitement (bio ou conventionnels).

Règle d'Or (Hors Périmètre) Si l'utilisateur pose une question qui ne concerne pas directement les animaux ou les plantes (par exemple : informatique, politique, cuisine humaine, histoire générale, mathématiques, etc.) :
Refuse poliment de répondre.
Rappelle brièvement ton rôle.
Invite l'utilisateur à poser une question liée aux animaux ou aux plantes.
Exemple de refus : "Désolé, je suis un assistant spécialisé uniquement dans la santé, les maladies et les espèces d'animaux et de plantes. Je ne peux pas répondre aux questions hors de ce domaine. Comment puis-je vous aider avec vos animaux ou vos plantes ?"

Consignes de Réponse & Avertissements Obligatoires
Avertissement Vétérinaire / Phytosanitaire : Pour toute question concernant une maladie grave d'un animal ou d'une plante, rappelle toujours que tes conseils ne remplacent pas une consultation chez un vétérinaire ou un spécialiste de la protection des cultures.
Clarté : Utilise des listes à puces et une structure claire pour expliquer les traitements ou les symptômes.
Précision : Distingue clairement les conseils pour les animaux de compagnie, les animaux de ferme, les plantes d'intérieur ou les cultures d'extérieur.`
};

// ────────────────────────────────────────
// STATE
// ────────────────────────────────────────
let conversationHistory = [];
let isLoading = false;

// ────────────────────────────────────────
// DOM ELEMENTS
// ────────────────────────────────────────
const chatArea = document.getElementById('chatArea');
const messagesContainer = document.getElementById('messagesContainer');
const welcomeScreen = document.getElementById('welcomeScreen');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const charCount = document.getElementById('charCount');
const newChatBtn = document.getElementById('newChatBtn');
const clearBtn = document.getElementById('clearBtn');
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menuBtn');
const sidebarToggle = document.getElementById('sidebarToggle');

// ────────────────────────────────────────
// SIDEBAR CONTROLS
// ────────────────────────────────────────
menuBtn.addEventListener('click', () => {
  if (window.innerWidth <= 768) {
    sidebar.classList.toggle('open');
  } else {
    sidebar.classList.toggle('collapsed');
  }
});

sidebarToggle.addEventListener('click', () => {
  sidebar.classList.remove('open');
});

// ────────────────────────────────────────
// INPUT AUTO-RESIZE & CHAR COUNT
// ────────────────────────────────────────
userInput.addEventListener('input', () => {
  // Auto-resize textarea
  userInput.style.height = 'auto';
  userInput.style.height = Math.min(userInput.scrollHeight, 150) + 'px';

  // Character count
  const len = userInput.value.length;
  charCount.textContent = `${len}/2000`;
  charCount.style.color = len > 1800 ? '#f87171' : 'var(--text-muted)';

  // Enable/disable send
  sendBtn.disabled = len === 0 || isLoading;
});

// Send on Enter (Shift+Enter for newline)
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (!sendBtn.disabled) sendMessage();
  }
});

sendBtn.addEventListener('click', sendMessage);

// ────────────────────────────────────────
// WELCOME CARD & QUICK QUESTION CLICKS
// ────────────────────────────────────────
document.querySelectorAll('.welcome-card').forEach(card => {
  card.addEventListener('click', () => {
    const prompt = card.getAttribute('data-prompt');
    if (prompt) triggerPrompt(prompt);
  });
});

document.querySelectorAll('.topic-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const prompt = chip.getAttribute('data-prompt');
    if (prompt) triggerPrompt(prompt);
    if (window.innerWidth <= 768) sidebar.classList.remove('open');
  });
});

document.querySelectorAll('.quick-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const prompt = btn.getAttribute('data-prompt');
    if (prompt) triggerPrompt(prompt);
    if (window.innerWidth <= 768) sidebar.classList.remove('open');
  });
});

function triggerPrompt(text) {
  userInput.value = text;
  userInput.dispatchEvent(new Event('input'));
  sendMessage();
}

// ────────────────────────────────────────
// NEW CHAT / CLEAR
// ────────────────────────────────────────
function clearConversation() {
  conversationHistory = [];
  messagesContainer.innerHTML = '';
  welcomeScreen.classList.remove('hidden');
  userInput.value = '';
  userInput.style.height = 'auto';
  charCount.textContent = '0/2000';
  sendBtn.disabled = true;
}

newChatBtn.addEventListener('click', clearConversation);
clearBtn.addEventListener('click', clearConversation);

// ────────────────────────────────────────
// SEND MESSAGE
// ────────────────────────────────────────
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text || isLoading) return;

  // Hide welcome screen on first message
  if (conversationHistory.length === 0) {
    welcomeScreen.classList.add('hidden');
  }

  // Add user message to UI and history
  appendMessage('user', text);
  conversationHistory.push({ role: 'user', content: text });

  // Clear input
  userInput.value = '';
  userInput.style.height = 'auto';
  charCount.textContent = '0/2000';
  sendBtn.disabled = true;

  // Show typing indicator
  const typingEl = appendTypingIndicator();
  isLoading = true;

  try {
    const response = await callMistralAPI(conversationHistory);
    typingEl.remove();

    const assistantMessage = response.choices[0].message.content;
    conversationHistory.push({ role: 'assistant', content: assistantMessage });

    // Check if it's a health/disease related response
    const needsWarning = /maladie|symptôme|traitement|infection|blessure|poison|toxique|urgence/i.test(assistantMessage);
    appendMessage('ai', assistantMessage, needsWarning);
  } catch (err) {
    typingEl.remove();
    console.error("Mistral API Error:", err);
    
    // Fallback Mock AI Response for Prototype (if API fails due to CORS/Key issues)
    const mockResponse = generateMockAiResponse(text);
    conversationHistory.push({ role: 'assistant', content: mockResponse });
    const needsWarning = /maladie|symptôme|traitement|infection|blessure|poison|toxique|urgence/i.test(mockResponse);
    appendMessage('ai', mockResponse, needsWarning);
  } finally {
    isLoading = false;
    sendBtn.disabled = userInput.value.trim() === '';
    userInput.focus();
  }
}

// ────────────────────────────────────────
// MOCK AI FALLBACK (PROTOTYPE)
// ────────────────────────────────────────
function generateMockAiResponse(userText) {
  const text = userText.toLowerCase();
  if (text.includes("chat") || text.includes("chien") || text.includes("lapin") || text.includes("animal")) {
    return "Bien sûr ! En ce qui concerne les animaux, il est important de surveiller leur alimentation et leur comportement. Si votre animal présente des symptômes inhabituels (comme des vomissements ou de la léthargie), cela pourrait indiquer une **maladie** sous-jacente. Assurez-vous de lui fournir de l'eau fraîche et un environnement calme.";
  } else if (text.includes("plante") || text.includes("feuille") || text.includes("tomate") || text.includes("jardin")) {
    return "Pour vos plantes, le jaunissement des feuilles peut indiquer un excès d'eau, une carence en azote ou une **infection** fongique (comme le mildiou). Je recommande de vérifier le drainage du sol et d'appliquer un **traitement** adapté si des taches apparaissent.";
  } else if (text.includes("bonjour") || text.includes("salut")) {
    return "Bonjour ! Je suis NaturIA, votre expert en santé animale et végétale. Que puis-je faire pour vos plantes ou vos animaux aujourd'hui ?";
  } else {
    return "C'est une excellente question. En tant qu'expert de la nature (animaux et plantes), je vous conseille de toujours observer attentivement les signes cliniques ou visuels. Pouvez-vous me donner plus de détails sur le sujet (plante ou animal concerné) ?";
  }
}

// ────────────────────────────────────────
// MISTRAL API CALL
// ────────────────────────────────────────
async function callMistralAPI(history) {
  const body = {
    model: CONFIG.model,
    messages: [
      { role: 'system', content: CONFIG.systemPrompt },
      ...history
    ],
    temperature: 0.7,
    max_tokens: 1500,
    stream: false
  };

  const response = await fetch(CONFIG.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CONFIG.apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// ────────────────────────────────────────
// UI HELPERS
// ────────────────────────────────────────
function appendMessage(role, content, showWarning = true, isError = false) {
  const row = document.createElement('div');
  row.className = `message-row ${role}`;

  const avatarDiv = document.createElement('div');
  avatarDiv.className = `msg-avatar ${role === 'ai' ? 'ai-avatar' : 'user-avatar'}`;
  avatarDiv.textContent = role === 'ai' ? '' : '';

  const bubbleWrap = document.createElement('div');
  bubbleWrap.className = 'msg-bubble-wrap';

  const bubble = document.createElement('div');
  bubble.className = `msg-bubble${isError ? ' error-bubble' : ''}`;

  // Parse basic markdown
  bubble.innerHTML = parseMarkdown(content);

  bubbleWrap.appendChild(bubble);

  // Render yellow disclaimer warning box for AI responses
  if (showWarning && role === 'ai') {
    const warningEl = document.createElement('div');
    warningEl.className = 'warning-badge';
    warningEl.innerHTML = `<span>Ces informations sont fournies à titre indicatif et ne remplacent pas une consultation vétérinaire ou phytosanitaire professionnelle.</span>`;
    bubbleWrap.appendChild(warningEl);
  }

  const timeEl = document.createElement('div');
  timeEl.className = 'msg-time';
  timeEl.textContent = formatTime(new Date());

  bubbleWrap.appendChild(timeEl);

  row.appendChild(avatarDiv);
  row.appendChild(bubbleWrap);

  messagesContainer.appendChild(row);
  scrollToBottom();
  return row;
}

function appendTypingIndicator() {
  const row = document.createElement('div');
  row.className = 'message-row ai';
  row.id = 'typingRow';

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar ai-avatar';
  avatar.textContent = '';

  const wrap = document.createElement('div');
  wrap.className = 'msg-bubble-wrap';

  const indicator = document.createElement('div');
  indicator.className = 'typing-indicator';
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('div');
    dot.className = 'typing-dot';
    indicator.appendChild(dot);
  }

  wrap.appendChild(indicator);
  row.appendChild(avatar);
  row.appendChild(wrap);
  messagesContainer.appendChild(row);
  scrollToBottom();
  return row;
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: 'smooth' });
  });
}

function formatTime(date) {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// ────────────────────────────────────────
// SIMPLE MARKDOWN PARSER
// ────────────────────────────────────────
function parseMarkdown(text) {
  // Escape HTML
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Bold **text**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic *text*
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Inline code `code`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Process line by line
  const lines = html.split('\n');
  const result = [];
  let inList = false;
  let inOrderedList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Unordered list
    if (/^[\-\*] /.test(line)) {
      if (!inList) { result.push('<ul>'); inList = true; }
      result.push(`<li>${line.replace(/^[\-\*] /, '')}</li>`);
    }
    // Ordered list
    else if (/^\d+\. /.test(line)) {
      if (!inOrderedList) { result.push('<ol>'); inOrderedList = true; }
      result.push(`<li>${line.replace(/^\d+\. /, '')}</li>`);
    }
    else {
      if (inList) { result.push('</ul>'); inList = false; }
      if (inOrderedList) { result.push('</ol>'); inOrderedList = false; }

      if (line.trim() === '') {
        result.push('<br/>');
      } else if (/^### /.test(line)) {
        result.push(`<strong style="color:var(--green-bright);font-size:15px">${line.replace(/^### /, '')}</strong>`);
      } else if (/^## /.test(line)) {
        result.push(`<strong style="color:var(--green-bright);font-size:16px">${line.replace(/^## /, '')}</strong>`);
      } else if (/^# /.test(line)) {
        result.push(`<strong style="color:var(--green-bright);font-size:17px">${line.replace(/^# /, '')}</strong>`);
      } else {
        result.push(`<p>${line}</p>`);
      }
    }
  }

  if (inList) result.push('</ul>');
  if (inOrderedList) result.push('</ol>');

  return result.join('');
}

// ────────────────────────────────────────
// INIT
// ────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  userInput.focus();

  // On small screen, sidebar toggle visible
  if (window.innerWidth <= 768) {
    document.querySelector('.sidebar-toggle').style.display = 'flex';
  }
});
