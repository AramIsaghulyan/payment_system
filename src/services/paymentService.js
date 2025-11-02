const accountService = require('./accountService');
const transactionRepository = require('../database/repositories/transactionRepository');

class PaymentService {
  constructor() {}

  async findByAccountId(userId, accountId) {
    const account = await accountService.findByUserId(userId);
    if (!account) {
      throw new Error('There is no account with this user Id.');
    }
    return await transactionRepository.findByAccountId(accountId);
  }

  async transfer(userId, senderCardNumber, receiverCardNumber, amount) {
    const sender = await accountService.verifySenderAccount(userId, senderCardNumber);
    if (!sender) {
      throw new Error('User does not own this card.');
    }
    const receiver = await accountService.isValidCardNumber(receiverCardNumber);
    if (!receiver) {
      throw new Error('Card number is not valid.');
    }
    if (senderCardNumber === receiverCardNumber) {
      throw new Error('Cannot transfer to the same account.');
    }
    if (amount <= 0) {
      throw new Error('Invalid amount.');
    }
    return await transactionRepository.transfer(sender.accountId, receiver.accountId, amount);
  }

  async deposit(userId, amount) {
    const account = await accountService.findByUserId(userId);
    if (!account) {
      throw new Error('There is no account with this user Id.');
    }
    if (amount <= 0) {
      throw new Error('Invalid amount.');
    }
    return await transactionRepository.deposit(account.accountId, amount);
  }

  async withdraw(userId, amount) {
    const account = await accountService.findByUserId(userId);
    if (!account) {
      throw new Error('There is no account with this user Id.');
    }
    if (amount <= 0) {
      throw new Error('Invalid amount.');
    }
    return await transactionRepository.withdraw(account.accountId, amount);
  }
}

module.exports = new PaymentService();
