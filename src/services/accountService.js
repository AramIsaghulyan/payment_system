const userRepository = require('../database/repositories/userRepository');
const accountRepository = require('../database/repositories/accountRepository');

class AccountService {
  constructor() {}

  async create(userId) {
    const foundUser = await userRepository.findUserWithAccountsById(userId);
    if (!foundUser) {
      throw new Error('There is no user with this Id.');
    }
    const account = await accountRepository.create(userId);
    return account;
  }

  async verifyCardNumber(userId, cardNumber) {
    const verify = await accountRepository.verifyCardNumber(userId, cardNumber);
    return verify;
  }

  async isValidCardNumber(cardNumber) {
    const isValid = await accountRepository.isValidCardNumber(cardNumber);
    return isValid;
  }

  async findByUserId(userId) {
    const account = await accountRepository.findByUserId(userId);
    return account;
  }
}

module.exports = new AccountService();
