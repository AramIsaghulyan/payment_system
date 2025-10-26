const { create, findByEmail, findById } = require('../database/queries/userQueries');
const bcrypt = require('bcrypt');

class UserService {
  constructor() {}

  async create(name, surname, email, password) {
    const hash = await bcrypt.hash(password, 12);
    const user = await create(name, surname, email, hash);
    delete user.password;
    return user;
  }

  async findById(id) {
    const foundUser = await findById(id);
    if (!foundUser) {
      throw new Error('Wrong id.');
    }
    delete foundUser.password;
    return foundUser;
  }
}

module.exports = new UserService();
