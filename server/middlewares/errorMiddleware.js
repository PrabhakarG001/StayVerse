const ExpressError = require('../utils/ExpressError');

module.exports.errorHandler = (err, req, res, next) => {
  console.error("EXPRESS ERROR:", err.stack);
  const { statusCode = 500 } = err;
  const message = err.message || "Something went wrong.";

  res.status(statusCode).render("error.ejs", { err: { statusCode, message } });
};

module.exports.wrapAsync = require('../utils/wrapAsync');
module.exports.ExpressError = ExpressError;
