const userRepository = require('../database/repositories/userRepository');

class UserService {
  constructor() {}

  async findUserWithAccountsById(userId) {
    const foundUser = await userRepository.findUserWithAccountsById(userId);
    if (!foundUser) {
      throw new Error('There is no user with this user Id.');
    }
    return foundUser;
  }

  async create(name, surname, email, password) {
    const foundUser = await userRepository.findUserWithAccountsByEmail(email);
    if (foundUser) {
      throw new Error('User with this email already exists.');
    }
    const user = await userRepository.create(name, surname, email, password);
    return user;
  }

  async update(userId, email, fields) {
    const foundUser = await userRepository.findUserWithAccountsByEmail(email);
    if (!foundUser) {
      throw new Error('There is no user with this user Id.');
    }
    const user = await userRepository.update(userId, foundUser.password, fields);
    return user;
  }
}

module.exports = new UserService();
