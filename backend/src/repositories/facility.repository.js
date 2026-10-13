const BaseRepository = require('./base.repository');

class FacilityRepository extends BaseRepository {
  constructor() {
    super('hostel_room', 'hostel_room_id');
  }

  // --- Hostel Categories & Hostels ---
  async getHostelCategories() {
    const [rows] = await this.pool.query(`
      SELECT 
        hostel_category_id AS id,
        hostel_category_id,
        name,
        type,
        description,
        created_at
      FROM hostel_category 
      ORDER BY name ASC
    `);
    return rows;
  }

  async createHostel(data) {
    const [result] = await this.pool.query(
      `INSERT INTO hostel_category (name, type, description) VALUES (?, ?, ?)`,
      [data.name, data.type || 'Boys', data.description || data.address || '']
    );
    return { id: result.insertId, ...data };
  }

  async updateHostel(id, data) {
    await this.pool.query(
      `UPDATE hostel_category SET name = ?, type = ?, description = ? WHERE hostel_category_id = ?`,
      [data.name, data.type || 'Boys', data.description || data.address || '', id]
    );
    return { id, ...data };
  }

  async deleteHostel(id) {
    await this.pool.query(`DELETE FROM hostel_category WHERE hostel_category_id = ?`, [id]);
    return true;
  }

  // --- Hostel Rooms ---
  async getHostelRooms() {
    const sql = `
      SELECT 
        hr.hostel_room_id AS id,
        hr.hostel_room_id,
        hr.room_number AS name,
        hr.room_number,
        hr.room_type,
        hr.num_beds AS number_of_bed,
        hr.num_beds AS capacity,
        hr.cost_per_bed,
        hr.hostel_category_id AS hostel_id,
        hc.name AS hostel_name, hc.type AS hostel_type,
        d.dormitory_id, d.name AS dormitory_name, d.incharge_name,
        (SELECT COUNT(*) FROM student s WHERE s.dormitory_id = d.dormitory_id AND s.status = 'active') AS current_occupancy
      FROM hostel_room hr
      LEFT JOIN hostel_category hc ON hr.hostel_category_id = hc.hostel_category_id
      LEFT JOIN dormitory d ON hr.hostel_room_id = d.hostel_room_id
      ORDER BY hr.hostel_room_id ASC
    `;
    const [rows] = await this.pool.query(sql);
    return rows;
  }

  async createRoom(data) {
    const [result] = await this.pool.query(
      `INSERT INTO hostel_room (hostel_category_id, room_number, room_type, num_beds, cost_per_bed) VALUES (?, ?, ?, ?, ?)`,
      [data.hostel_id || data.hostel_category_id || 1, data.name || data.room_number, data.room_type || 'Standard', data.number_of_bed || data.num_beds || 2, data.cost_per_bed || 0]
    );
    return { id: result.insertId, ...data };
  }

  async updateRoom(id, data) {
    await this.pool.query(
      `UPDATE hostel_room SET hostel_category_id = ?, room_number = ?, room_type = ?, num_beds = ?, cost_per_bed = ? WHERE hostel_room_id = ?`,
      [data.hostel_id || data.hostel_category_id || 1, data.name || data.room_number, data.room_type || 'Standard', data.number_of_bed || data.num_beds || 2, data.cost_per_bed || 0, id]
    );
    return { id, ...data };
  }

  async deleteRoom(id) {
    await this.pool.query(`DELETE FROM hostel_room WHERE hostel_room_id = ?`, [id]);
    return true;
  }

  async getDormitories() {
    const sql = `
      SELECT 
        d.dormitory_id AS id,
        d.dormitory_id,
        d.name,
        d.incharge_name,
        hr.room_number, hr.room_type, hr.num_beds, hr.cost_per_bed,
        hc.name AS hostel_name, hc.type AS hostel_type,
        (SELECT COUNT(*) FROM student s WHERE s.dormitory_id = d.dormitory_id AND s.status = 'active') AS current_occupancy
      FROM dormitory d
      LEFT JOIN hostel_room hr ON d.hostel_room_id = hr.hostel_room_id
      LEFT JOIN hostel_category hc ON hr.hostel_category_id = hc.hostel_category_id
      ORDER BY d.dormitory_id ASC
    `;
    const [rows] = await this.pool.query(sql);
    return rows;
  }

  // --- Transport Routes ---
  async getTransportRoutes() {
    const [rows] = await this.pool.query(`
      SELECT 
        transport_route_id AS id,
        transport_route_id,
        route_name AS name,
        route_name AS title,
        route_fare AS fare,
        start_point,
        end_point,
        description
      FROM transport_route 
      ORDER BY route_name ASC
    `);
    return rows;
  }

  async createRoute(data) {
    const [result] = await this.pool.query(
      `INSERT INTO transport_route (route_name, start_point, end_point, route_fare, description) VALUES (?, ?, ?, ?, ?)`,
      [data.name || data.title, data.start_point || '', data.end_point || '', data.fare || data.route_fare || 0, data.description || '']
    );
    return { id: result.insertId, ...data };
  }

  async updateRoute(id, data) {
    await this.pool.query(
      `UPDATE transport_route SET route_name = ?, start_point = ?, end_point = ?, route_fare = ?, description = ? WHERE transport_route_id = ?`,
      [data.name || data.title, data.start_point || '', data.end_point || '', data.fare || data.route_fare || 0, data.description || '', id]
    );
    return { id, ...data };
  }

  async deleteRoute(id) {
    await this.pool.query(`DELETE FROM transport_route WHERE transport_route_id = ?`, [id]);
    return true;
  }

  // --- Vehicles ---
  async getVehicles() {
    const [rows] = await this.pool.query(`
      SELECT 
        vehicle_id AS id,
        vehicle_id,
        vehicle_number AS vehicle_no,
        vehicle_number,
        vehicle_model,
        driver_name,
        driver_phone,
        driver_licence,
        seating_capacity AS capacity,
        seating_capacity
      FROM vehicle 
      ORDER BY vehicle_number ASC
    `);
    return rows;
  }

  async createVehicle(data) {
    const [result] = await this.pool.query(
      `INSERT INTO vehicle (vehicle_number, vehicle_model, driver_name, driver_phone, driver_licence, seating_capacity) VALUES (?, ?, ?, ?, ?, ?)`,
      [data.vehicle_no || data.vehicle_number, data.vehicle_model || '', data.driver_name, data.driver_phone || '', data.driver_licence || '', data.capacity || data.seating_capacity || 30]
    );
    return { id: result.insertId, ...data };
  }

  async updateVehicle(id, data) {
    await this.pool.query(
      `UPDATE vehicle SET vehicle_number = ?, vehicle_model = ?, driver_name = ?, driver_phone = ?, driver_licence = ?, seating_capacity = ? WHERE vehicle_id = ?`,
      [data.vehicle_no || data.vehicle_number, data.vehicle_model || '', data.driver_name, data.driver_phone || '', data.driver_licence || '', data.capacity || data.seating_capacity || 30, id]
    );
    return { id, ...data };
  }

  async deleteVehicle(id) {
    await this.pool.query(`DELETE FROM vehicle WHERE vehicle_id = ?`, [id]);
    return true;
  }

  async getTransports() {
    const sql = `
      SELECT 
        t.transport_id AS id,
        t.transport_id,
        t.route_name,
        t.number_of_vehicle,
        t.description,
        tr.route_name AS detailed_route_name, tr.start_point, tr.end_point, tr.route_fare AS standard_route_fare,
        v.vehicle_number, v.vehicle_model, v.driver_name, v.driver_phone, v.seating_capacity,
        (SELECT COUNT(*) FROM student s WHERE s.transport_id = t.transport_id AND s.status = 'active') AS assigned_students
      FROM transport t
      LEFT JOIN transport_route tr ON t.transport_route_id = tr.transport_route_id
      LEFT JOIN vehicle v ON t.vehicle_id = v.vehicle_id
      ORDER BY t.transport_id ASC
    `;
    const [rows] = await this.pool.query(sql);
    return rows;
  }
}

module.exports = new FacilityRepository();
