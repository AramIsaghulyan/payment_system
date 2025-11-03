const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config({ quiet: true });
const userRepository = require('../database/repositories/userRepository');

class AuthService {
  constructor() {}

  async generateToken(email, password) {
    const user = await userRepository.findUserWithAccountsByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }
    const payload = {
      userId: user.user_id,
      email: user.email,
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  }
}

module.exports = new AuthService();
