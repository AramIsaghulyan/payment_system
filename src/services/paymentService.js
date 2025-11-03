const accountService = require('./accountService');
const transactionRepository = require('../database/repositories/transactionRepository');

class PaymentService {
  constructor() {}

  async findByAccountId(userId, accountId) {
    return await transactionRepository.findByAccountId(userId, accountId);
  }

  async transfer(userId, senderCardNumber, receiverCardNumber, amount) {
    const verifiedSender = await accountService.verifyCardNumber(userId, senderCardNumber);
    if (!verifiedSender?.accountId) {
      throw new Error('Sender is not verified. Check card number.');
    }
    const isValidReciver = await accountService.isValidCardNumber(receiverCardNumber);
    if (!isValidReciver?.accountId) {
      throw new Error('Card number is not valid.');
    }
    if (senderCardNumber === receiverCardNumber) {
      throw new Error('Cannot transfer to the same account.');
    }
    if (amount <= 0) {
      throw new Error('Invalid amount.');
    }
    return await transactionRepository.transfer(verifiedSender.accountId, isValidReciver?.accountId, amount);
  }

  async deposit(userId, cardNumber, amount) {
    const verifiedAccount = await accountService.verifyCardNumber(userId, cardNumber);
    if (!verifiedAccount?.accountId) {
      throw new Error('Deposit card number is not verified. Check card number.');
    }
    if (amount <= 0) {
      throw new Error('Invalid amount.');
    }
    return await transactionRepository.deposit(verifiedAccount.accountId, amount);
  }

  async withdraw(userId, cardNumber, amount) {
    const verifiedAccount = await accountService.verifyCardNumber(userId, cardNumber);
    if (!verifiedAccount?.accountId) {
      throw new Error('Withdraw card number is not verified. Check card number.');
    }
    if (amount <= 0) {
      throw new Error('Invalid amount.');
    }
    return await transactionRepository.withdraw(verifiedAccount.accountId, amount);
  }
}

module.exports = new PaymentService();
