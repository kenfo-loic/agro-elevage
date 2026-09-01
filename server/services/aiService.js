const config = require('../config/config');
const db = require('../config/db');

const NATURIA_SYSTEM_PROMPT = `Rôle & Identité :
Tu es NaturIA, l'assistant expert agronomique et vétérinaire officiel de la plateforme AgroElevage Link (Afrique Centrale / Cameroun).
Tu es spécialisé exclusivement dans deux domaines :
1. Le monde végétal : cultures tropicales et maraîchères (banane plantain, manioc, maïs, tomate, piment, cacao, palmier à huile, etc.), détection de maladies fongiques/bactériennes, ravageurs, fertilisation organique et minérale, protection des cultures.
2. Le monde animal : élevage tropical (volailles/poulets de chair et pondeuses, porciculture, ruminants/bovins/caprins, pisciculture), pathologies courantes (coccidiose, peste porcine, coryza, newcastle), alimentation, biosécurité et prophylaxie.

Règles de réponse :
- Fournis des réponses concrètes, structurées et adaptées aux réalités du terrain africain (traitements bio accessibles + produits homologués).
- Structure toujours tes réponses avec des sections claires (Diagnostic / Traitement Bio / Traitement Conventionnel / Prévention).
- Si la question est hors de ton domaine (informatique, politique, etc.), refuse poliment en rappelant ta mission agronomique et vétérinaire.
- Avertissement obligatoire pour les cas graves : rappelle de consulter un vétérinaire ou un agent de vulgarisation agricole MINADER/MINEPIA.`;

// Local Agronomical Knowledge Base for instant accurate responses
const LOCAL_KNOWLEDGE_BASE = [
  {
    keywords: ['mildiou', 'tomate', 'tache brune', 'feuille seche', 'pourriture'],
    targetType: 'plante',
    crop: 'Tomate / Maraîchage',
    title: 'Mildiou de la Tomate (Phytophthora infestans)',
    severity: 'eleve',
    recommendations: 'Arrachez et détruisez les feuilles sévèrement touchées. Évitez absolument d arroser le feuillage. Aérer la parcelle.',
    organic: 'Pulvérisation préventive de purin d ortie ou décoction de prêle (10%). Traitement à la bouillie bordelaise (10g/L) par temps humide.',
    conventional: 'Fongicide à base de Mancozèbe (2g/L) ou Métalaxyl-M + Mancozèbe (Ridomil Gold).',
    preventive: 'Paillage du sol, rotation des cultures sur 3 ans sans solanacées, tuteurage haut.'
  },
  {
    keywords: ['coccidiose', 'poulet', 'poussin', 'fiente rouge', 'sang', 'prostré', 'diarrhee'],
    targetType: 'animal',
    crop: 'Volailles / Aviculture',
    title: 'Coccidiose Aviaire (Eimeria spp.)',
    severity: 'critique',
    recommendations: 'Isoler d urgence le lot atteint. Changer intégralement la litière humide et désinfecter les mangeoires et abreuvoirs.',
    organic: 'Addition de vinaigre de cidre (5ml/L d eau de boisson) ou extrait d ail broyé en préventif pour acidifier le jabot.',
    conventional: 'Anticoccidien curatif : Amprolium (20-30g pour 100L d eau pendant 5 jours) ou Sulfamidés (Sulfaquinoxaline/Triméthoprime). Complément vitaminique K3.',
    preventive: 'Garder la litière toujours sèche (copeaux de bois), éviter la surpopulation, respecter le vide sanitaire.'
  },
  {
    keywords: ['charbon', 'chenille', 'legionnaire', 'mais', 'tige', 'trou'],
    targetType: 'plante',
    crop: 'Maïs / Céréales',
    title: 'Chenille Légionnaire d Automne (Spodoptera frugiperda)',
    severity: 'eleve',
    recommendations: 'Inspecter les cônes foliaires tôt le matin. Écraser manuellement les pontes et jeunes larves.',
    organic: 'Dépôt de sable fin ou cendre de bois dans le cornet des plants. Pulvérisation d extrait aqueux de feuilles de Neem (Azadirachta indica).',
    conventional: 'Insecticide homologué à base d Emamectine benzoate ou Chlorantraniliprole dosé selon notice.',
    preventive: 'Semis précoce et groupé, association maïs-desmodium (Push-Pull), piégeage aux phéromones.'
  },
  {
    keywords: ['peste porcine', 'porc', 'fievre', 'rougeur', 'mort', 'saignement'],
    targetType: 'animal',
    crop: 'Porciculture',
    title: 'Suspicion de Peste Porcine (Africaine / Classique)',
    severity: 'critique',
    recommendations: 'ALERTE SANITAIRE MAXIMALE : Aucun traitement médical n existe. Quarantaine immédiate, interdire tout mouvement d animaux.',
    organic: 'Non applicable. Alerter immédiatement le délégué d élevage MINEPIA de votre arrondissement.',
    conventional: 'Abattage sanitaire contrôlé et désinfection complète au Crésyl ou chaux vive.',
    preventive: 'Biosécurité stricte : pédiluve obligatoire à l entrée, ne jamais donner de restes de cuisine non cuits (eaux grasses).'
  },
  {
    keywords: ['charancon', 'banane', 'plantain', 'tronc', 'chute', 'galerie'],
    targetType: 'plante',
    crop: 'Banane Plantain',
    title: 'Charançon du Bananier (Cosmopolites sordidus)',
    severity: 'moyen',
    recommendations: 'Déterrer les souches attaquées et les découper pour exposer les larves aux prédateurs.',
    organic: 'Trempage des rejets épluchés (parage) dans de l eau chaude à 55°C pendant 20 min ou solution d extrait de Neem.',
    conventional: 'Traitement nématicide/insecticide au collet homologué en cas de forte infestation.',
    preventive: 'Utiliser uniquement des plants issus de fragments de tige (PIF) assainis.'
  }
];

class AIService {
  /**
   * Send chat query to Mistral AI API with Fallback
   */
  static async chat({ message, sessionId = 'default', history = [] }) {
    // Build context
    const messages = [
      { role: 'system', content: NATURIA_SYSTEM_PROMPT }
    ];

    // Add recent history if provided
    if (Array.isArray(history)) {
      history.slice(-6).forEach(h => {
        if (h.role && h.content) messages.push({ role: h.role, content: h.content });
      });
    }

    messages.push({ role: 'user', content: message });

    // Try calling Mistral AI API
    if (config.mistralApiKey) {
      try {
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.mistralApiKey}`
          },
          body: JSON.stringify({
            model: config.mistralModel,
            messages,
            temperature: 0.3,
            max_tokens: 1000
          })
        });

        if (response.ok) {
          const data = await response.json();
          const assistantReply = data.choices?.[0]?.message?.content;
          if (assistantReply) {
            return {
              reply: assistantReply,
              source: 'mistral_ai',
              sessionId
            };
          }
        }
      } catch (apiError) {
        console.warn('[AIService] Mistral API call failed, using expert engine fallback:', apiError.message);
      }
    }

    // Fallback: Expert Agromonical Rule Engine
    const lower = message.toLowerCase();
    for (const kb of LOCAL_KNOWLEDGE_BASE) {
      const match = kb.keywords.some(kw => lower.includes(kw));
      if (match) {
        const reply = ` **Diagnostic & Recommandation NaturIA**\n\n` +
          `**Pathologie identifiée** : ${kb.title} (${kb.crop})\n` +
          `**Gravité** : ${kb.severity.toUpperCase()}\n\n` +
          `** Actions Immédiates :**\n${kb.recommendations}\n\n` +
          `** Solution Biologique / Locale :**\n${kb.organic}\n\n` +
          `** Traitement Conventionnel :**\n${kb.conventional}\n\n` +
          `** Mesures Préventives :**\n${kb.preventive}\n\n` +
          `* Rappel : Pour un cas sévère, contactez un conseiller agricole ou vétérinaire local.*`;

        return { reply, source: 'expert_knowledge_engine', sessionId };
      }
    }

    // Generic agricultural expert reply
    const genericReply = `Bonjour ! Je suis **NaturIA**, votre assistant expert en agriculture et élevage.\n\n` +
      `Pour vous aider au mieux concernant vos cultures ou vos animaux, pourriez-vous préciser :\n` +
      `- L'espèce exacte (ex: Tomates, Bananiers, Poulets de chair, Porcs)\n` +
      `- Les symptômes observés (taches, couleur, baisse de ponte, diarrhée, lésions...)\n` +
      `- La durée d'apparition et le nombre de sujets ou plants touchés ?\n\n` +
      `Vous pouvez aussi uploader une photo dans l'onglet **IA Diagnostic** pour une analyse visuelle immédiate ! `;

    return { reply: genericReply, source: 'expert_assistant', sessionId };
  }

  /**
   * Diagnostic on Photo / Symptoms
   */
  static async diagnose({ userId = null, targetType = 'plante', cropOrAnimal = '', symptoms = '', imageUrl = null }) {
    const combinedQuery = `${cropOrAnimal} ${symptoms}`.toLowerCase();

    // Check local knowledge base first for high precision
    let matchedKb = LOCAL_KNOWLEDGE_BASE.find(kb => 
      kb.targetType === targetType && kb.keywords.some(kw => combinedQuery.includes(kw))
    );

    if (!matchedKb) {
      matchedKb = LOCAL_KNOWLEDGE_BASE.find(kb => kb.keywords.some(kw => combinedQuery.includes(kw)));
    }

    let diagnosisData;

    if (matchedKb) {
      diagnosisData = {
        target_type: targetType,
        crop_or_animal: cropOrAnimal || matchedKb.crop,
        symptoms,
        image_url: imageUrl,
        diagnosis_title: matchedKb.title,
        severity: matchedKb.severity,
        recommendations: matchedKb.recommendations,
        organic_treatment: matchedKb.organic,
        conventional_treatment: matchedKb.conventional,
        preventive_measures: matchedKb.preventive
      };
    } else {
      // Use Mistral to generate a structured diagnosis
      let mistralResult = null;
      if (config.mistralApiKey) {
        try {
          const prompt = `Agis comme un phytopathologiste et vétérinaire expert en Afrique.
Effectue un diagnostic pour : Cible: ${targetType}, Espèce: ${cropOrAnimal}, Symptômes observés: "${symptoms}".
Réponds EXCLUSIVEMENT au format JSON strict avec les clés suivantes :
{
  "diagnosis_title": "Nom scientifique et courant de la maladie",
  "severity": "faible|moyen|eleve|critique",
  "recommendations": "Mesures d'urgence",
  "organic_treatment": "Traitements naturels et bio",
  "conventional_treatment": "Produits homologués",
  "preventive_measures": "Prévention et bonnes pratiques"
}`;

          const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${config.mistralApiKey}`
            },
            body: JSON.stringify({
              model: config.mistralModel,
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.2
            })
          });

          if (res.ok) {
            const data = await res.json();
            const text = data.choices?.[0]?.message?.content;
            const jsonStart = text.indexOf('{');
            const jsonEnd = text.lastIndexOf('}');
            if (jsonStart !== -1 && jsonEnd !== -1) {
              mistralResult = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
            }
          }
        } catch (e) {
          console.warn('[AIService] AI JSON diagnosis generation failed:', e.message);
        }
      }

      diagnosisData = {
        target_type: targetType,
        crop_or_animal: cropOrAnimal || (targetType === 'plante' ? 'Culture maraîchère' : 'Élevage'),
        symptoms,
        image_url: imageUrl,
        diagnosis_title: mistralResult?.diagnosis_title || `Affection pathologique sur ${cropOrAnimal || targetType}`,
        severity: mistralResult?.severity || 'moyen',
        recommendations: mistralResult?.recommendations || 'Isoler les sujets touchés et surveiller l évolution sur 48h.',
        organic_treatment: mistralResult?.organic_treatment || 'Application d extraits naturels de plantes assainissantes (Neem, Ail, Cendre filtrée).',
        conventional_treatment: mistralResult?.conventional_treatment || 'Consulter un technicien agricole agréé pour un traitement ciblé.',
        preventive_measures: mistralResult?.preventive_measures || 'Maintenir une bonne hygiène des parcelles ou des bâtiments d élevage.'
      };
    }

    // Save diagnosis to database
    try {
      const stmt = db.prepare(`
        INSERT INTO ai_diagnostics (user_id, target_type, crop_or_animal, symptoms, image_url, diagnosis_title, severity, recommendations, organic_treatment, conventional_treatment, preventive_measures)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const inserted = stmt.run(
        userId,
        diagnosisData.target_type,
        diagnosisData.crop_or_animal,
        diagnosisData.symptoms,
        diagnosisData.image_url,
        diagnosisData.diagnosis_title,
        diagnosisData.severity,
        diagnosisData.recommendations,
        diagnosisData.organic_treatment,
        diagnosisData.conventional_treatment,
        diagnosisData.preventive_measures
      );
      diagnosisData.id = inserted.lastInsertRowid;
    } catch (dbErr) {
      console.error('[AIService] Error saving diagnosis:', dbErr);
    }

    return diagnosisData;
  }
}

module.exports = AIService;
