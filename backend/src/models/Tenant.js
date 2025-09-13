const pool = require('../config/database');

class Tenant {
  static async findBySlug(slug) {
    const query = 'SELECT * FROM tenants WHERE slug = $1';
    const result = await pool.query(query, [slug]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM tenants WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async updateSubscription(id, subscriptionPlan) {
    const query = `
      UPDATE tenants 
      SET subscription_plan = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *
    `;
    const result = await pool.query(query, [subscriptionPlan, id]);
    return result.rows[0];
  }

  static async getNotesCount(tenantId) {
    const query = 'SELECT COUNT(*) as count FROM notes WHERE tenant_id = $1';
    const result = await pool.query(query, [tenantId]);
    return parseInt(result.rows[0].count);
  }
}

module.exports = Tenant;
