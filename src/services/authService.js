const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config({ quiet: true });
const { findByEmail  } = require('../database/queries/userQueries');

class AuthService {
  constructor() {}

  async generateToken(email, password) {
    const user = await findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }
    const payload = {
      id: user.id,
      email: user.email,
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  }
}

module.exports = new AuthService();