const userRepository = require('../database/repositories/userRepository');
const accountRepository = require('../database/repositories/accountRepository');

class AccountService {
  constructor() {}

  async create(userId) {
    const foundUser = await userRepository.findUserWithAccountsById(userId);
    if (!foundUser) {
      throw new Error('There is no user with this Id.');
    }
    const user = await accountRepository.create(userId);
    return user;
  }
}

module.exports = new AccountService();
