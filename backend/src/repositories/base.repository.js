const pool = require('../config/db');

class BaseRepository {
  constructor(tableName, primaryKey = 'id') {
    this.tableName = tableName;
    this.primaryKey = primaryKey;
    this.pool = pool;
  }

  async executeQuery(sql, params = []) {
    const [results] = await this.pool.query(sql, params);
    return results;
  }

  async findById(id, select = '*') {
    const sql = `SELECT ${select} FROM ${this.tableName} WHERE ${this.primaryKey} = ?`;
    const [rows] = await this.pool.query(sql, [id]);
    return rows[0] || null;
  }

  async findAll(options = {}) {
    const { where = '', params = [], limit = 100, offset = 0, orderBy = `${this.primaryKey} DESC` } = options;
    let sql = `SELECT * FROM ${this.tableName}`;
    if (where) {
      sql += ` WHERE ${where}`;
    }
    sql += ` ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
    const [rows] = await this.pool.query(sql, [...params, limit, offset]);
    return rows;
  }

  async count(where = '', params = []) {
    let sql = `SELECT COUNT(*) AS total FROM ${this.tableName}`;
    if (where) {
      sql += ` WHERE ${where}`;
    }
    const [rows] = await this.pool.query(sql, params);
    return rows[0].total;
  }

  async create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
    const [result] = await this.pool.query(sql, values);
    return result.insertId;
  }

  async update(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE ${this.primaryKey} = ?`;
    const [result] = await this.pool.query(sql, [...values, id]);
    return result.affectedRows > 0;
  }

  async delete(id) {
    const sql = `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = ?`;
    const [result] = await this.pool.query(sql, [id]);
    return result.affectedRows > 0;
  }

  async withTransaction(callback) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = BaseRepository;
