const User = require('../models/user');

module.exports.renderWishlistPage = (req, res) => {
  res.render("pages/wishlists/index");
};

module.exports.getWishlistAPI = (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.json(req.user.wishlist || []);
};

module.exports.toggleWishlistAPI = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { propertyId, name, location, price, rating, imageUrl, isPremium } = req.body;
  const user = await User.findById(req.user._id);
  
  const existingIdx = user.wishlist.findIndex(item => item.propertyId === propertyId);
  let action = '';
  if (existingIdx > -1) {
    user.wishlist.splice(existingIdx, 1);
    action = 'removed';
  } else {
    user.wishlist.push({ propertyId, name, location, price, rating, imageUrl, isPremium });
    action = 'added';
  }
  await user.save();
  res.json({ success: true, action, wishlist: user.wishlist });
};
