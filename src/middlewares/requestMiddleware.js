const requestMiddleware = (middleware) => {
  return async (req, res, next) => {
    try {
      await middleware(req, res, next);
      if (!res.headersSent) next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = requestMiddleware;

