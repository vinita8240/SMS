const bcrypt = require('bcryptjs');
const parentRepo = require('../repositories/parent.repository');

class ParentService {
  async getParents(filters) {
    return parentRepo.getFilteredParents(filters);
  }

  async getParentById(id) {
    const parent = await parentRepo.getParentWithChildren(id);
    if (!parent) throw { statusCode: 404, message: 'Parent not found' };
    delete parent.password;
    return parent;
  }

  async createParent(data) {
    if (!data.name || !data.email || !data.phone) {
      throw { statusCode: 400, message: 'Name, email, and phone are required' };
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    } else {
      data.password = await bcrypt.hash('parent123', 10);
    }

    const insertId = await parentRepo.create(data);
    return parentRepo.getParentWithChildren(insertId);
  }

  async updateParent(id, data) {
    const existing = await parentRepo.findById(id);
    if (!existing) throw { statusCode: 404, message: 'Parent not found' };

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    } else {
      delete data.password;
    }

    await parentRepo.update(id, data);
    return parentRepo.getParentWithChildren(id);
  }

  async deleteParent(id) {
    const existing = await parentRepo.findById(id);
    if (!existing) throw { statusCode: 404, message: 'Parent not found' };
    return parentRepo.delete(id);
  }
}

module.exports = new ParentService();
