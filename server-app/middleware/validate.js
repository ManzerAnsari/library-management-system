const { ZodError } = require('zod');

function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map(e => ({ path: e.path.join('.'), message: e.message }));
        return res.status(400).json({ error: 'Validation failed', details: errors });
      }
      return next(err);
    }
  };
}

function validateQuery(schema) {
  return (req, res, next) => {
    try {
      req.query = schema.parse(req.query || {});
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map(e => ({ path: e.path.join('.'), message: e.message }));
        return res.status(400).json({ error: 'Validation failed', details: errors });
      }
      return next(err);
    }
  };
}

module.exports = { validate, validateQuery };