const { ValidationError } = require('../utils/errors');

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ValidationError('Email and password are required');
  }

  if (!email.includes('@')) {
    throw new ValidationError('Invalid email format');
  }

  if (password.length < 6) {
    throw new ValidationError('Password must be at least 6 characters');
  }

  next();
};

const validateNote = (req, res, next) => {
  const { title, content } = req.body;

  if (!title || !content) {
    throw new ValidationError('Title and content are required');
  }

  if (title.trim().length === 0) {
    throw new ValidationError('Title cannot be empty');
  }

  if (title.length > 255) {
    throw new ValidationError('Title must be less than 255 characters');
  }

  if (content.trim().length === 0) {
    throw new ValidationError('Content cannot be empty');
  }

  if (content.length > 10000) {
    throw new ValidationError('Content must be less than 10,000 characters');
  }

  next();
};

const validateUUID = (paramName) => {
  return (req, res, next) => {
    const value = req.params[paramName];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(value)) {
      throw new ValidationError(`Invalid ${paramName} format`);
    }
    
    next();
  };
};

module.exports = {
  validateLogin,
  validateNote,
  validateUUID
};
