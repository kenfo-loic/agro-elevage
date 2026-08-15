const db = require('../config/db');

class ProductController {
  /**
   * Get all products with filters & search
   */
  static getAll(req, res) {
    try {
      const { category, search, minPrice, maxPrice, organic, limit = 50, offset = 0 } = req.query;

      let sql = `
        SELECT p.*, u.name as seller_name, u.phone as seller_phone, u.location as seller_location
        FROM products p
        JOIN users u ON p.seller_id = u.id
        WHERE p.is_available = 1
      `;
      const params = [];

      if (category && category !== 'all') {
        sql += ' AND p.category = ?';
        params.push(category.toLowerCase());
      }

      if (search) {
        sql += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.location LIKE ?)';
        const query = `%${search}%`;
        params.push(query, query, query);
      }

      if (minPrice) {
        sql += ' AND p.price >= ?';
        params.push(parseFloat(minPrice));
      }

      if (maxPrice) {
        sql += ' AND p.price <= ?';
        params.push(parseFloat(maxPrice));
      }

      if (organic === '1' || organic === 'true') {
        sql += ' AND p.is_organic = 1';
      }

      sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit, 10), parseInt(offset, 10));

      const products = db.prepare(sql).all(...params);

      // Get count
      const countSql = `SELECT COUNT(*) as total FROM products WHERE is_available = 1`;
      const total = db.prepare(countSql).get().total;

      return res.json({
        success: true,
        count: products.length,
        total,
        products
      });
    } catch (err) {
      console.error('[ProductController.getAll]', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Get single product by ID
   */
  static getById(req, res) {
    try {
      const { id } = req.params;
      const product = db.prepare(`
        SELECT p.*, u.name as seller_name, u.phone as seller_phone, u.location as seller_location, u.avatar as seller_avatar
        FROM products p
        JOIN users u ON p.seller_id = u.id
        WHERE p.id = ?
      `).get(id);

      if (!product) {
        return res.status(404).json({ success: false, error: 'Produit introuvable.' });
      }

      // Related products in same category
      const related = db.prepare(`
        SELECT id, name, price, unit, image_url, location 
        FROM products 
        WHERE category = ? AND id != ? AND is_available = 1 
        LIMIT 4
      `).all(product.category, id);

      return res.json({
        success: true,
        product,
        related
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Create new product (Seller only)
   */
  static create(req, res) {
    try {
      const {
        name,
        category,
        description,
        price,
        unit = 'kg',
        stock_quantity = 1,
        min_order_quantity = 1,
        location,
        latitude,
        longitude,
        is_organic = 0
      } = req.body;

      if (!name || !category || !price) {
        return res.status(400).json({
          success: false,
          error: 'Le nom du produit, la catégorie et le prix sont obligatoires.'
        });
      }

      let imageUrl = 'assets/images/products/default.jpg';
      if (req.file) {
        imageUrl = `uploads/products/${req.file.filename}`;
      } else if (req.body.image_url) {
        imageUrl = req.body.image_url;
      }

      const stmt = db.prepare(`
        INSERT INTO products 
        (seller_id, name, category, description, price, unit, stock_quantity, min_order_quantity, location, latitude, longitude, image_url, is_organic, is_available)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `);

      const result = stmt.run(
        req.user.id,
        name,
        category.toLowerCase(),
        description || '',
        parseFloat(price),
        unit,
        parseFloat(stock_quantity),
        parseFloat(min_order_quantity),
        location || req.user.location || 'Cameroun',
        latitude ? parseFloat(latitude) : 3.8480,
        longitude ? parseFloat(longitude) : 11.5021,
        imageUrl,
        is_organic === '1' || is_organic === true ? 1 : 0
      );

      const createdProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);

      return res.status(201).json({
        success: true,
        message: 'Produit publié avec succès sur la marketplace !',
        product: createdProduct
      });
    } catch (err) {
      console.error('[ProductController.create]', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Update product
   */
  static update(req, res) {
    try {
      const { id } = req.params;
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

      if (!product) return res.status(404).json({ success: false, error: 'Produit introuvable.' });
      if (product.seller_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Non autorisé à modifier ce produit.' });
      }

      const { name, category, description, price, unit, stock_quantity, min_order_quantity, location, is_organic, is_available } = req.body;

      let imageUrl = product.image_url;
      if (req.file) {
        imageUrl = `uploads/products/${req.file.filename}`;
      } else if (req.body.image_url) {
        imageUrl = req.body.image_url;
      }

      db.prepare(`
        UPDATE products 
        SET name = COALESCE(?, name),
            category = COALESCE(?, category),
            description = COALESCE(?, description),
            price = COALESCE(?, price),
            unit = COALESCE(?, unit),
            stock_quantity = COALESCE(?, stock_quantity),
            min_order_quantity = COALESCE(?, min_order_quantity),
            location = COALESCE(?, location),
            image_url = COALESCE(?, image_url),
            is_organic = COALESCE(?, is_organic),
            is_available = COALESCE(?, is_available),
            updated_at = datetime('now')
        WHERE id = ?
      `).run(
        name || null,
        category ? category.toLowerCase() : null,
        description !== undefined ? description : null,
        price ? parseFloat(price) : null,
        unit || null,
        stock_quantity !== undefined ? parseFloat(stock_quantity) : null,
        min_order_quantity ? parseFloat(min_order_quantity) : null,
        location || null,
        imageUrl,
        is_organic !== undefined ? (is_organic === '1' || is_organic === true ? 1 : 0) : null,
        is_available !== undefined ? parseInt(is_available, 10) : null,
        id
      );

      const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
      return res.json({ success: true, message: 'Produit mis à jour.', product: updated });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Delete product
   */
  static delete(req, res) {
    try {
      const { id } = req.params;
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

      if (!product) return res.status(404).json({ success: false, error: 'Produit introuvable.' });
      if (product.seller_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Non autorisé.' });
      }

      db.prepare('DELETE FROM products WHERE id = ?').run(id);
      return res.json({ success: true, message: 'Produit supprimé avec succès.' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Get products for current seller
   */
  static getSellerProducts(req, res) {
    try {
      const products = db.prepare(`
        SELECT * FROM products 
        WHERE seller_id = ? 
        ORDER BY created_at DESC
      `).all(req.user.id);

      const stats = {
        totalProducts: products.length,
        inStock: products.filter(p => p.stock_quantity > 0).length,
        outOfStock: products.filter(p => p.stock_quantity <= 0).length,
        totalValue: products.reduce((acc, p) => acc + (p.price * p.stock_quantity), 0)
      };

      return res.json({ success: true, stats, products });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = ProductController;
