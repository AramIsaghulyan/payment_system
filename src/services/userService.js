const userRepository = require('../database/repositories/userRepository');

class UserService {
  constructor() {}

  async findUserWithAccountsById(userId) {
    const foundUser = await userRepository.findUserWithAccountsById(userId);
    if (!foundUser) {
      throw new Error('There is no user with this user id.');
    }
    return foundUser;
  }

  async create(name, surname, email, password) {
    const foundUser = await userRepository.findByEmail(email);
    if (foundUser) {
      throw new Error('User with this email already exists.');
    }
    const user = await userRepository.create(name, surname, email, password);
    return user;
  }

  async update(userId, fields) {
    const foundUser = await userRepository.findById(userId);
    if (!foundUser) {
      throw new Error('There is no user with this user id.');
    }
    const user = await userRepository.update(userId, fields);
    return user;
  }
}

module.exports = new UserService();
