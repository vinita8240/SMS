const pool = require('../../../config/db');

/**
 * Transport tool to query routes, vehicles, and student transport allocation
 */
const transportTool = {
  /**
   * Get all active transport routes with fare and description
   */
  async getTransportRoutes() {
    const sql = `
      SELECT tr.transport_route_id, tr.route_name, tr.start_point, tr.end_point, tr.route_fare, tr.description,
             COUNT(t.transport_id) as vehicle_count
      FROM transport_route tr
      LEFT JOIN transport t ON tr.transport_route_id = t.transport_route_id
      GROUP BY tr.transport_route_id
      ORDER BY tr.route_name ASC
    `;
    const [rows] = await pool.query(sql);
    return rows;
  },

  /**
   * Get vehicle and driver details
   */
  async getVehicles() {
    const sql = `
      SELECT v.vehicle_id, v.vehicle_number, v.vehicle_model, v.driver_name, v.driver_phone,
             v.driver_license, v.seating_capacity, v.vehicle_status,
             tr.route_name, tr.start_point, tr.end_point
      FROM vehicle v
      LEFT JOIN transport t ON v.vehicle_id = t.vehicle_id
      LEFT JOIN transport_route tr ON t.transport_route_id = tr.transport_route_id
      ORDER BY v.vehicle_number ASC
    `;
    const [rows] = await pool.query(sql);
    return rows;
  },

  /**
   * Get student's assigned transport route, vehicle, and pickup point
   */
  async getStudentTransport(student_id) {
    if (!student_id) return null;
    const sql = `
      SELECT s.student_id, s.name as student_name, s.pickup_point,
             tr.route_name, tr.start_point, tr.end_point, tr.route_fare,
             v.vehicle_number, v.vehicle_model, v.driver_name, v.driver_phone
      FROM student s
      LEFT JOIN transport_route tr ON (s.route_id = tr.transport_route_id OR s.transport_id = tr.transport_route_id)
      LEFT JOIN transport t ON tr.transport_route_id = t.transport_route_id
      LEFT JOIN vehicle v ON t.vehicle_id = v.vehicle_id
      WHERE s.student_id = ?
      LIMIT 1
    `;
    const [rows] = await pool.query(sql, [student_id]);
    return rows[0] || null;
  }
};

module.exports = transportTool;
