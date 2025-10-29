const { Joi } = require('../utils/validation');

module.exports = {
  create: {
    userId: Joi.number().required(),
  },
};
