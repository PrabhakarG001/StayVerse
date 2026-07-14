const Joi = require('joi');
const ExpressError = require('../utils/ExpressError');

const listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().required().min(0),
        location: Joi.string().required(),
        country: Joi.string().required(),
        image: Joi.string().allow("", null),
        galleryImages: Joi.array().items(Joi.string().allow("", null)).optional(),
        category: Joi.string().valid("Beachfront", "Trending", "Historic", "Iconic Cities", "Mountains", "Castles", "Pools", "Camping", "Lakefront", "Jungle").required(),
    }).required(),
});

const reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required(),
});

module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, "Invalid listing data: " + msg);
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, "Invalid review data: " + msg);
  } else {
    next();
  }
};
