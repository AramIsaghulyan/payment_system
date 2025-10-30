const baseJoi = require('joi');
const { StatusCodes } = require('http-status-codes');

const Joi = baseJoi.extend((joi) => ({
  type: 'password',
  base: joi.string(),
  messages: {
    'password.minLength': '"{{#label}}" should have at least {{#limit}} characters',
    'password.uppercase': '"{{#label}}" should contain at least one uppercase letter',
    'password.lowercase': '"{{#label}}" should contain at least one lowercase letter',
    'password.number': '"{{#label}}" should contain at least one number',
    'password.special': '"{{#label}}" should contain at least one special character',
  },
  rules: {
    minLength: {
      method(length) {
        return this.$_addRule({ name: 'minLength', args: { length } });
      },
      args: [
        {
          name: 'length',
          assert: (value) => typeof value === 'number' && value > 0,
          message: 'must be a positive number',
        },
      ],
      validate(value, helpers, args) {
        if (value.length < args.length) {
          return helpers.error('password.minLength', { limit: args.length });
        }
        return value;
      },
    },
    strong: {
      method() {
        return this.$_addRule('strong');
      },
      validate(value, helpers) {
        if (!/[A-Z]/.test(value)) return helpers.error('password.uppercase');
        if (!/[a-z]/.test(value)) return helpers.error('password.lowercase');
        if (!/[0-9]/.test(value)) return helpers.error('password.number');
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return helpers.error('password.special');
        return value;
      },
    },
  },
}));

async function validate(body, schemaObject) {
  const schema = Joi.object(schemaObject);
  const res = schema.validate(body);

  if (res.error) {
    const message = res.error.details.map((d) => d.message).join(', ');
    const err = new Error(message);
    err.status = StatusCodes.BAD_REQUEST;
    throw err;
  }

  return res.value;
}

module.exports = { Joi, validate };
