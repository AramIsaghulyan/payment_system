const { Joi } = require('../configs/joi');

module.exports = {
  create: {
    name: Joi.string().min(2).max(100).required(),
    surname: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().max(150).required(),
    password: Joi.password().min(8).max(255).strong().required(),
  },
  update: {
    name: Joi.string().min(2).max(100).optional(),
    surname: Joi.string().min(2).max(100).optional(),
    password: Joi.password().min(8).max(255).strong().optional(),
    oldPassword: Joi.string().when('password', {
      is: Joi.exist(),
      then: Joi.required().messages({
        'any.required': '"oldPassword" is required when changing password',
      }),
      otherwise: Joi.forbidden(),
    }),
  },
};
