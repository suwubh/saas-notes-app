const pool = require('../config/database');

class Note {
  static async findByTenant(tenantId) {
    const query = `
      SELECT n.*, u.email as author_email
      FROM notes n
      JOIN users u ON n.user_id = u.id
      WHERE n.tenant_id = $1
      ORDER BY n.created_at DESC
    `;
    const result = await pool.query(query, [tenantId]);
    return result.rows;
  }

  static async findById(id, tenantId) {
    const query = 'SELECT * FROM notes WHERE id = $1 AND tenant_id = $2';
    const result = await pool.query(query, [id, tenantId]);
    return result.rows[0];
  }

  static async create(noteData) {
    const { tenantId, userId, title, content } = noteData;
    
    const query = `
      INSERT INTO notes (tenant_id, user_id, title, content)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await pool.query(query, [tenantId, userId, title, content]);
    return result.rows[0];
  }

  static async update(id, tenantId, updateData) {
    const { title, content } = updateData;
    
    const query = `
      UPDATE notes 
      SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND tenant_id = $4
      RETURNING *
    `;
    
    const result = await pool.query(query, [title, content, id, tenantId]);
    return result.rows[0];
  }

  static async delete(id, tenantId) {
    const query = 'DELETE FROM notes WHERE id = $1 AND tenant_id = $2 RETURNING *';
    const result = await pool.query(query, [id, tenantId]);
    return result.rows[0];
  }

  static async countByTenant(tenantId) {
    const query = 'SELECT COUNT(*) as count FROM notes WHERE tenant_id = $1';
    const result = await pool.query(query, [tenantId]);
    return parseInt(result.rows[0].count);
  }
}

module.exports = Note;
