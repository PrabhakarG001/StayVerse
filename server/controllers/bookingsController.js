const User = require('../models/user');
const Listing = require('../models/listing');

module.exports.createBooking = async (req, res) => {
  const { propertyId, name, image, price } = req.body;
  const user = await User.findById(req.user._id);
  user.bookings.push({ propertyId, name, image, price, date: new Date() });
  await user.save();
  res.json({ success: true });
};

module.exports.renderMyBookings = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.render("pages/users/user-bookings.ejs", { bookings: user.bookings });
};

module.exports.renderMyHost = async (req, res) => {
  const listings = await Listing.find({ owner: req.user._id });
  res.render("pages/users/host-dashboard.ejs", { listings });
};
