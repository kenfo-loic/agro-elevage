const db = require('../config/db');

// Major regional production and wholesale market hubs in Cameroon / Central Africa
const REGIONAL_MARKETS = [
  {
    name: 'Marché du Mfoundi (Yaoundé)',
    type: 'marche_grossiste',
    latitude: 3.8666,
    longitude: 11.5166,
    region: 'Centre',
    specialties: ['Tubercules', 'Légumes', 'Plantain', 'Fruits']
  },
  {
    name: 'Marché Sandaga (Douala)',
    type: 'marche_grossiste',
    latitude: 4.0483,
    longitude: 9.7042,
    region: 'Littoral',
    specialties: ['Vivres frais', 'Poissons', 'Plantain du Moungo']
  },
  {
    name: 'Grand Marché Agricole de Foumbot',
    type: 'bassin_production',
    latitude: 5.5097,
    longitude: 10.6306,
    region: 'Ouest',
    specialties: ['Tomates', 'Piments', 'Poivrons', 'Maraîchage intensif']
  },
  {
    name: 'Marché aux Bestiaux de Bafoussam',
    type: 'marche_betail',
    latitude: 5.4777,
    longitude: 10.4176,
    region: 'Ouest',
    specialties: ['Volailles', 'Porcs', 'Bovins', 'Œufs de table']
  },
  {
    name: 'Hub Céréalier de Garoua',
    type: 'bassin_production',
    latitude: 9.3013,
    longitude: 13.3977,
    region: 'Nord',
    specialties: ['Maïs', 'Sorgho', 'Oignons', 'Bétail sahélien']
  },
  {
    name: 'Bassin Bananier de Njombé-Penja',
    type: 'bassin_production',
    latitude: 4.5833,
    longitude: 9.6833,
    region: 'Littoral / Moungo',
    specialties: ['Banane Plantain', 'Poivre de Penja (IGP)', 'Ananas']
  }
];

class GeoController {
  /**
   * Get producers with geographic coordinates and available stock
   */
  static getProducers(req, res) {
    try {
      const producers = db.prepare(`
        SELECT u.id, u.name, u.phone, u.sub_role, u.location, u.latitude, u.longitude, u.avatar,
               COUNT(p.id) as active_products_count,
               GROUP_CONCAT(p.name, ' • ') as products_sample
        FROM users u
        LEFT JOIN products p ON u.id = p.seller_id AND p.is_available = 1
        WHERE u.role = 'vendeur'
        GROUP BY u.id
      `).all();

      return res.json({
        success: true,
        count: producers.length,
        producers
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Get agricultural markets and regional logistics hubs
   */
  static getMarkets(req, res) {
    return res.json({
      success: true,
      count: REGIONAL_MARKETS.length,
      markets: REGIONAL_MARKETS
    });
  }
}

module.exports = GeoController;
