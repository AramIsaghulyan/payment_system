const { createUser } = require('../database/queries/userQueries');

class UserService {
  constructor() {}

  async createUser(name, surname, email, password) {
    try {
      const user = await createUser(name, surname, email, password);
      return user;
    } catch (error) {
      throw error;
    }
  }

}

module.exports = new UserService();