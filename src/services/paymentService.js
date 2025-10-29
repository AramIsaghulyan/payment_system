const accountService = require('./accountService');
const transactionRepository = require('../database/repositories/transactionRepository');

class PaymentService {
  constructor() {}

  async transfer(userId, senderCardNumber, receiverCardNumber, amount) {
    const senderAccountId = await accountService.verifySenderAccount(userId, senderCardNumber);
    if (!senderAccountId) {
      throw new Error('User does not own this card.');
    }
    const receiverAccountId = await accountService.isValidCardNumber(receiverCardNumber);
    if (!receiverAccountId) {
      throw new Error('Card number is not valid.')
    }
    if (senderCardNumber === receiverCardNumber) {
      throw new Error('Cannot transfer to the same account.');
    }
    if (amount <= 0) {
      throw new Error('Invalid amount.');
    }
    return await transactionRepository.transfer(senderAccountId, receiverAccountId, amount);
  }

  async deposit(accountId, amount) {
    if (amount <= 0) throw new Error('Invalid amount.');
    return await transactionRepository.deposit(accountId, amount);
  }

  async withdraw(accountId, amount) {
    if (amount <= 0) throw new Error('Invalid amount.');
    return await transactionRepository.withdraw(accountId, amount);
  }
}

module.exports = new PaymentService();
