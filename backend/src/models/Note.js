const pool = require('../config/database');

class Note {
  
  static async findByTenant(tenantId, userId = null, userRole = null) {
    let query, params;
    
    if (userRole === 'admin' && !userId) {
      
      query = `
        SELECT n.*, u.email as author_email
        FROM notes n
        JOIN users u ON n.user_id = u.id
        WHERE n.tenant_id = $1
        ORDER BY n.created_at DESC
      `;
      params = [tenantId];
    } else {
      
      query = `
        SELECT n.*, u.email as author_email
        FROM notes n
        JOIN users u ON n.user_id = u.id
        WHERE n.tenant_id = $1 AND n.user_id = $2
        ORDER BY n.created_at DESC
      `;
      params = [tenantId, userId];
    }
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  
  static async findById(id, tenantId, userId = null, userRole = null) {
    let query, params;
    
    if (userRole === 'admin' && !userId) {
      
      query = 'SELECT * FROM notes WHERE id = $1 AND tenant_id = $2';
      params = [id, tenantId];
    } else {
      
      query = 'SELECT * FROM notes WHERE id = $1 AND tenant_id = $2 AND user_id = $3';
      params = [id, tenantId, userId];
    }
    
    const result = await pool.query(query, params);
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

  
  static async update(id, tenantId, userId, updateData, userRole = null) {
    const { title, content } = updateData;
    let query, params;
    
    if (userRole === 'admin') {
      
      query = `
        UPDATE notes
        SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3 AND tenant_id = $4
        RETURNING *
      `;
      params = [title, content, id, tenantId];
    } else {
      
      query = `
        UPDATE notes
        SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3 AND tenant_id = $4 AND user_id = $5
        RETURNING *
      `;
      params = [title, content, id, tenantId, userId];
    }
    
    const result = await pool.query(query, params);
    return result.rows[0];
  }

  
  static async delete(id, tenantId, userId, userRole = null) {
    let query, params;
    
    if (userRole === 'admin') {
      
      query = 'DELETE FROM notes WHERE id = $1 AND tenant_id = $2 RETURNING *';
      params = [id, tenantId];
    } else {
      
      query = 'DELETE FROM notes WHERE id = $1 AND tenant_id = $2 AND user_id = $3 RETURNING *';
      params = [id, tenantId, userId];
    }
    
    const result = await pool.query(query, params);
    return result.rows[0];
  }

  static async countByTenant(tenantId) {
    const query = 'SELECT COUNT(*) as count FROM notes WHERE tenant_id = $1';
    const result = await pool.query(query, [tenantId]);
    return parseInt(result.rows[0].count);
  }
}

module.exports = Note;
