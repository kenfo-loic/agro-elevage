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
// ADVANCED NATURIA AGRO & VET AI ENGINE
// ────────────────────────────────────────
function generateMockAiResponse(userText) {
  const text = userText.toLowerCase();

  // 1. POULTRY & VOLAILLES (Coccidiose, Newcastle, Gumboro, Alimentation)
  if (text.includes("coccidios") || (text.includes("poussin") && text.includes("sang")) || text.includes("fientes rouge")) {
    return `### 🐔 Diagnostic : Coccidiose Aviaire (Suspicion Forte)

**Symptômes typiques :** Fientes sanguinolentes ou brunâtres, plumage ébouriffé, prostration, baisse d'appétit et mortalité chez les poussins/poulets de chair (15 à 45 jours).

#### 💊 1. Traitement d'Urgence :
* **Anticoccidien curatif :** Administrer de l'**Amprolium** (ou *Toltrazuril* / *Sulfadimidine*) dans l'eau de boisson pendant **3 à 5 jours consécutifs**.
* **Vitamines K & Electrolytes :** Ajouter un complexe polyvitaminé riche en Vitamine K3 pour stopper les micro-hémorragies intestinales.

#### 🛡️ 2. Mesures de Biosécurité & Prévention :
* Changer immédiatement la litière humide (la litière sèche empêche la sporulation des oocystes).
* Désinfecter les abreuvoirs quotidiennement avec une solution javellisée (10 ml/L).
* Distribuer une litière sèche en copeaux de bois (épaisseur 5 à 7 cm).`;
  }

  if (text.includes("newcastle") || text.includes("pseudo-peste") || text.includes("torticolis") || (text.includes("poulet") && (text.includes("toux") || text.includes("respiratoire")))) {
    return `### 🐔 Diagnostic : Maladie de Newcastle (Pseudo-Peste Aviaire)

**Symptômes :** Détresse respiratoire (râles), diarrhée verdâtre liquide, torticolis ou paralysie des pattes, chute brutale de ponte.

#### ⚠️ 1. Conduite à Tenir Immédiate :
* **Isolement strict :** Isoler les sujets atteints sans attendre.
* **Aucun traitement antiviral spécifique :** Le traitement est préventif (vaccination).
* **Soutien de couverture :** Administrer des antibiotiques à large spectre (*Oxytétracycline* ou *Doxycycline*) pour éviter les surinfections bactériennes pulmonaires, combinés à un complexe vitaminique (*Anti-stress*).

#### 💉 2. Protocole Vaccinal Recommandé :
* **J1 à J7 :** Vaccin HB1 / Hitchner B1 ou Clone 30 (goutte oculaire ou eau).
* **J21 :** Rappel La Sota.
* **Maintien strict du pédiluve** à l'entrée du poulailler.`;
  }

  if (text.includes("gumboro") || text.includes("bursite")) {
    return `### 🐔 Diagnostic : Maladie de Gumboro (Bursite Infectieuse)

**Symptômes :** Prostration soudaine, fientes blanchâtres plâtreuses, déshydratation rapide, pic de mortalité vers 3 à 6 semaines.

#### 🌿 1. Traitement de Soutien :
* Acidifier l'eau de boisson (vinaigre de cidre : 5 ml/L) pour soulager les reins.
* Cure d'électrolytes + diurétiques pour favoriser l'élimination des toxines rénales.
* Protéger contre les surinfections avec une cure antibiotique douce.

#### 💉 2. Prévention :
* Vaccination obligatoire à J10-J14 (Gumboro IBD intermédiaire) puis rappel à J18-J21 selon la pression sanitaire de la zone.`;
  }

  // 2. PORCINS (Peste Porcine Africaine, Rouget, Alimentation)
  if (text.includes("porc") || text.includes("cochon") || text.includes("peste porcine") || text.includes("truie") || text.includes("porcelet")) {
    return `### 🐖 Expertise Élevage Porcin & Santé

**Points de vigilance clés :**

#### 🚨 1. Peste Porcine Africaine (PPA) - Alerte Vigilance :
* **Symptômes :** Forte fièvre (41-42°C), taches violacées/rougeâtres sur les oreilles, ventre et pattes, vomissements, mortalité foudroyante.
* **Règle absolue :** Il n'existe pas de vaccin homologué. **Interdiction totale** de donner des restes de repas non bouillis (eaux grasses) et verrouillage strict des entrées d'élevage (sas sanitaire et désinfection des bottes/véhicules).

#### 🥗 2. Alimentation Optimale des Porcs :
* **Porcelets sevrés :** Aliment à 18-20% de protéines brutes (tourteau de soja, farine de poisson, maïs, concentré minéral vitaminé).
* **Porcs à l'engraissement :** Ratio 70% énergie (Maïs/Son de blé/Manioc séché) + 30% protéines (Soja/Coton/Tourteau de palmiste) + 1% sel et CMV.`;
  }

  // 3. CULTURES MARAÎCHÈRES (Tomates, Piments, Maïs, Mildiou)
  if (text.includes("mildiou") || (text.includes("tomate") && (text.includes("tache") || text.includes("feuille")))) {
    return `### 🍅 Diagnostic : Mildiou de la Tomate (*Phytophthora infestans*)

**Symptômes :** Taches brunes/noires huileuses sur les feuilles avec duvet blanchâtre au revers, tiges nécrosées et fruits marbrés de brun.

#### 🌿 1. Traitements Curatifs & Biologiques :
* **Biologique :** Pulvériser une solution de **Bicarbonate de soude** (5g/L d'eau) mélangée à 1 cuillère à café de savon noir, ou du **Purin de Prêle / Huile essentielle de Tea Tree**.
* **Conventionnel :** Fongicide systémique à base de *Mancozèbe*, *Cymoxanil* ou *Métalaxyl* (respecter le délai avant récolte DAR).

#### 🛡️ 2. Bonnes Pratiques Culturales :
* Ne **jamais arroser les feuilles**, privilégier l'arrosage au pied (goutte-à-goutte).
* Tailler les feuilles basses touchant le sol pour aérer le plant.
* Pailler le sol (herbe sèche ou paille) pour éviter les éclaboussures de terre.`;
  }

  if (text.includes("chenille") || text.includes("légionnaire") || (text.includes("maïs") && text.includes("feuille"))) {
    return `### 🌽 Diagnostic : Chenille Légionnaire d'Automne (*Spodoptera frugiperda*)

**Symptômes :** Perforations en "coups de fusil" sur les jeunes feuilles de maïs, déjections ressemblant à de la sciure dans le cornet central.

#### 🌿 1. Solutions Bio & Agroécologiques :
* **Extrait de graines de Neem (Azadirachtine) :** 50g de poudre de neem pilée / litre d'eau, macérer 12h, filtrer et pulvériser directement dans le cornet.
* **Cendre de bois fine ou sable fin :** Déposer une pincée de cendre sèche dans le cornet du maïs pour étouffer les jeunes larves.
* **Bio-insecticide :** *Bacillus thuringiensis* (Bt) au stade précoce.

#### ⚡ 2. Traitement Conventionnel :
* *Emamectine benzoate* (dosage 10-20g/ha) ou *Chlorantraniliprole*, à pulvériser tôt le matin ou en fin d'après-midi.`;
  }

  // 4. JAUNISSEMENT DES FEUILLES & CARENCE
  if (text.includes("jaune") || text.includes("jauniss") || text.includes("carence") || text.includes("engrais") || text.includes("npk")) {
    return `### 🌿 Diagnostic : Carences Nutritionnelles & Jaunissement Foliaire

Pour identifier précisément la cause :

#### 🔍 1. Guide de Diagnostic Visuel :
* **Feuilles du bas jaunissent en premier :** Carence en **Azote (N)**. La plante transfère son azote vers les jeunes pousses. *Solution : Apport de purin d'ortie, fiente compostée ou urée 46%.*
* **Jaunissement entre les nervures (nervures restent vertes) :** Carence en **Fer (Chlorose)** ou en **Magnésium (Mg)**. *Solution : Chélate de fer ou sulfate de magnésium (Sel d'Epsom).*
* **Bord des feuilles brûlé ou enroulé :** Carence en **Potassium (K)** ou excès de salinité. *Solution : Cendre de bois bien tamisée ou sulfate de potassium.*
* **Feuilles jaunissent uniformément et sol détrempé :** **Asphyxie racinaire** (excès d'eau). Laisser sécher le sol et améliorer le drainage.`;
  }

  // 5. BIO-PESTICIDES & COMPOST
  if (text.includes("bio") || text.includes("compost") || text.includes("puceron") || text.includes("engrais naturel") || text.includes("purin")) {
    return `### 🍃 Recette & Guide : Bio-Fertilisants et Traitements Naturels

#### 🧪 1. Recette du Purin d'Ortie / Tithonia (Engrais & Stimulant) :
1. Récolter **1 kg de plantes fraîches** (Ortie ou *Tithonia diversifolia*).
2. Hacher grossièrement et placer dans un seau en plastique avec **10 Litres d'eau de pluie**.
3. Laisser macérer 7 à 10 jours en remuant chaque jour jusqu'à disparition des bulles.
4. **Utilisation :** Diluer à 10% (1L de purin pour 9L d'eau) en arrosage au sol ou 5% en pulvérisation foliaire.

#### 🐜 2. Anti-Pucerons et Cochenilles au Savon Noir :
* Diluer **2 cuillères à soupe de savon noir liquide** + 1 cuillère à café d'huile végétale dans **1 Litre d'eau tiède**.
* Pulvériser directement sur les colonies d'insectes en fin de journée.`;
  }

  // 6. GENERAL GREETINGS & AMICAL
  if (text.includes("bonjour") || text.includes("salut") || text.includes("hello") || text.includes("qui es-tu") || text.includes("qui est tu")) {
    return `### 🌾 Bonjour ! Je suis **NaturIA Expert**, votre assistant intelligent agronomique & vétérinaire.

Je peux vous accompagner dans :
* **La santé animale & l'élevage :** Diagnostics des volailles, porcs, bovins, petits ruminants, prévention et prophylaxie.
* **La santé végétale & maraîchage :** Identification des maladies (tomate, maïs, bananier, légumes), carences nutritives et ravageurs.
* **Les traitements naturels & bio :** Recettes de purins, bio-pesticides, compostage et engrais organiques.
* **L'optimisation des rendements :** Densité de semis, irrigation et fertilisation raisonnée.

*Posez-moi votre question ou décrivez les symptômes observés sur vos plantes ou animaux !*`;
  }

  // 7. DEFAULT EXPERT REASONING
  return `### 🌿 Analyse NaturIA Expert : Conseil Personnalisé

Merci pour votre question relative à votre exploitation.

#### 📋 1. Recommandations Techniques :
* **Observation attentive :** Vérifiez l'étendue des signes (sur les feuilles, racines, tiges ou comportement des animaux).
* **Isolation / Quarantaine :** Si vous suspectez une maladie contagieuse, isolez immédiatement les sujets ou plants infectés du reste de la parcelle/bâtiment.
* **Équilibre hydrique & nutritif :** Veillez à un sol bien drainé et à une alimentation équilibrée en macro et oligo-éléments.

#### 💡 2. Pour affiner le diagnostic :
Pour vous donner un protocole de traitement exact avec posologie :
1. De quelle **culture ou espèce animale** s'agit-il ?
2. Quels sont les **symptômes visibles** (couleur des taches, fientes, lésions, baisse d'appétit) ?
3. Depuis combien de **jours** observez-vous ce problème ?

*Je reste à votre disposition pour vous guider pas à pas.*`;
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
