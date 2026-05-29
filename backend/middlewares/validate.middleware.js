const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'Error de validación en los datos de entrada',
      errors: errors.array()
    });
  }
  next();
};

module.exports = validate;
