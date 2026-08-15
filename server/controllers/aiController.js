const AIService = require('../services/aiService');
const db = require('../config/db');

class AIController {
  /**
   * Conversational Chat with NaturIA
   */
  static async chat(req, res) {
    try {
      const { message, session_id = 'default', history = [] } = req.body;

      if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Le message ne peut pas être vide.'
        });
      }

      const result = await AIService.chat({
        message: message.trim(),
        sessionId: session_id,
        history
      });

      // Save user & assistant messages if user logged in
      if (req.user) {
        try {
          db.prepare('INSERT INTO chat_messages (user_id, session_id, role, content) VALUES (?, ?, ?, ?)').run(
            req.user.id, session_id, 'user', message
          );
          db.prepare('INSERT INTO chat_messages (user_id, session_id, role, content) VALUES (?, ?, ?, ?)').run(
            req.user.id, session_id, 'assistant', result.reply
          );
        } catch (e) {
          // ignore logging error
        }
      }

      return res.json({
        success: true,
        reply: result.reply,
        source: result.source,
        sessionId: result.sessionId
      });
    } catch (err) {
      console.error('[AIController.chat]', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Diagnostic on Photo / Symptoms
   */
  static async diagnose(req, res) {
    try {
      const { target_type = 'plante', crop_or_animal, symptoms } = req.body;

      if (!symptoms && !req.file) {
        return res.status(400).json({
          success: false,
          error: 'Veuillez décrire les symptômes ou envoyer une photo.'
        });
      }

      let imageUrl = null;
      if (req.file) {
        imageUrl = `uploads/ai_symptoms/${req.file.filename}`;
      }

      const diagnosis = await AIService.diagnose({
        userId: req.user ? req.user.id : null,
        targetType: target_type,
        cropOrAnimal: crop_or_animal || '',
        symptoms: symptoms || 'Analyse basée sur l image fournie.',
        imageUrl
      });

      return res.json({
        success: true,
        message: 'Diagnostic agronomique généré avec succès.',
        diagnosis
      });
    } catch (err) {
      console.error('[AIController.diagnose]', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Get past diagnostics history
   */
  static getHistory(req, res) {
    try {
      if (!req.user) return res.json({ success: true, diagnostics: [] });

      const diagnostics = db.prepare(`
        SELECT * FROM ai_diagnostics 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 20
      `).all(req.user.id);

      return res.json({ success: true, diagnostics });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = AIController;
